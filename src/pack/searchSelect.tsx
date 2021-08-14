import React, {useMemo, useRef, useState} from "react";
import {Select, SelectProps, Spin}        from "antd";
import {useRequest}                       from 'ahooks';

interface SearchPageProps<T> extends Omit<SelectProps<T>, 'options' | 'children'> {
    fetchOptionArr: (val: string) => Promise<T[]>;
    at: number;
}

export interface ValueType {
    key?: string;
    label: React.ReactNode;
    value: number | string;
}

const SearchSelect: React.FC<SearchPageProps<ValueType>> = ({fetchOptionArr, at = 800, ...props}: SearchPageProps<ValueType>) => {
    const [fetching, setFetching] = useState(false);
    const [optionArr, setOptionArr] = useState<ValueType[]>([]);
    const fetchRef = useRef(0);
    const loadOptionArr = (val: string) => {
        if (!Boolean(val)) {
            setFetching(false);
            return new Promise((resolve) => resolve([]));
        }
        const fetchId = fetchRef.current + 1;
        fetchRef.current = fetchId;
        setOptionArr([]);
        setFetching(true);

        return fetchOptionArr(val)
            .then(
                (newOptionArr) => {
                    console.log(newOptionArr);
                    if (fetchId !== fetchRef.current) {
                        return
                    }
                    setOptionArr(newOptionArr);
                    setFetching(false);
                    return true;
                }
            );
    }
    const {run} = useRequest(loadOptionArr, {debounceInterval: at, throwOnError: true})
    return (
        <Select<ValueType>
            labelInValue
            showSearch
            filterOption={false}
            onSearch={run}
            notFoundContent={fetching ? <Spin size="small"/> : null}
            {...props}
            options={optionArr}
        />
    );
}

export default SearchSelect;
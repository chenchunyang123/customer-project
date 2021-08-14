import request     from "umi-request";
import {ValueType} from "@/pack/searchSelect";
import React       from "react";

export const HintMenu = (val: string) => {
    return request('/api/admin/menu/hint', {method: 'POST', data: {input: val}})
        .then(
            ({status, data}) => {
                let arr: ValueType[] = [];
                if (status === 200 && Boolean(data)) {
                    for (let i = 0; i < data.length; i++) {
                        const current = data[i];
                        arr.push({
                            key:   current['id'],
                            label: <div dangerouslySetInnerHTML={{__html: current['name']}}/>,
                            value: current['path']
                        });
                    }
                }
                console.log(arr, data);
                return arr;
            }
        )
}
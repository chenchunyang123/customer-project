import {createContext, useState} from "react";
import request                   from "umi-request";
import {Menu}                    from "antd";
import {MenuOutlined}            from "@ant-design/icons";

interface PageType {
    page: number;
    page_size: number;
    total: number;
}

interface SortType {
    sort: string;
    sort_direction: 'asc' | 'desc';
}

interface ViewType<T> {
    visit: T;
    visitId: number;
}

function useView<T>() {
    const [page, setPage] = useState<PageType>({page: 1, page_size: 10, total: 0});
    const [sort, setSort] = useState<SortType>({sort: 'id', sort_direction: 'desc'});
    const [data, setData] = useState<T[]>([]);
    const [path, setPath] = useState<string>('');
    const [visit, setVisit] = useState<ViewType<T>>({visit: '' as any, visitId: 0});

    const search = (payload: any) => {
        payload['page'] = page.page;
        payload['sort'] = sort.sort;
        payload['page_size'] = page.page_size;
        payload['sort_direction'] = sort.sort_direction;
        request(path, {method: 'POST', data: payload})
            .then(
                ({statue, data, total}) => {
                    if (statue === 200) {
                        setData(data);
                        setPage({
                            ...page,
                            total
                        });
                    }
                }
            )
    }
    return {
        page, setPage,
        sort, setSort,
        data, setData,
        path, setPath,
        visit, setVisit,
        search
    };
}

export interface UserinfoType {
    u_id: number;
    prv_id: number;

    phone: string;
    avatar: string;
    nick_name: string;
    enterprise_name: string;
}

export const InitUserinfo: UserinfoType = {
    u_id:            0,
    prv_id:          0,
    phone:           ' . . 读取中',
    avatar:          '/default.jpg',
    nick_name:       ' . . 读取中',
    enterprise_name: ' . . 读取中',
};

export interface MenuOutlineType {
    method: string;
    path: string;
}

export type CanType = { [track: string]: boolean };

export const UserinfoContext = createContext<{ userinfo: UserinfoType, setUserinfo(userinfo: UserinfoType): void }>(null as any);

export const CanContext = createContext<CanType>(null as any);
import {createContext} from "react";

export interface UserinfoType {
    u_id: number;
    prv_id: number;

    phone: string;
    avatar: string;
    nick_name: string;
    tenant_status: number;
    tenant_name: string;
}

export const InitUserinfo: UserinfoType = {
    u_id:          0,
    prv_id:        0,
    phone:         ' . . 读取中',
    avatar:        '/default.jpg',
    nick_name:     ' . . 读取中',
    tenant_status: 0,
    tenant_name:   ' . . 读取中',
};

export interface MenuOutlineType {
    method: string;
    path: string;
}

export type CanType = { [track: string]: boolean };

export const UserinfoContext = createContext<{ userinfo: UserinfoType, setUserinfo(userinfo: UserinfoType): void }>(null as any);

export const CanContext = createContext<CanType>(null as any);
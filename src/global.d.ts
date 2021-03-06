import React from "react";

export interface ActionMenuItem {
    name: React.ReactNode;
    key: string;
}

interface MenuGroupOutline {
    id: number;
    name: string;
    admin_page_id: number;
    span: number;
}

interface PageOutline {
    id: number;
    name: string;
    description: string;
}

interface DepartmentOutline {
    id: number;
    name: string;
}

interface ReOption {
    value: number;
    label: string;
}

interface AdminUserOutline {
    id: number;
    real_name: string;
    nick_name: string;
}

interface PositionOutline {
    id: number;
    name: string;
    admin_department_id: number;
    weight: number;
    span: number;
}

interface MenuGroupOutline {
    id: number;
    name: string;

}

type SelectType = 'new' | 'old' | null;

interface DepartmentOutline {
    id: number;
    e_id: number;
    name: string;
    description: string;
}

interface PageProps {
    Outline?: boolean
    multiple?: boolean;
    onChange?: (val: number[]) => any;
    value?: number[];
}

type DepartmentIdOutlineMap = { [departmentId: number]: DepartmentOutline }

type PageIdOutlineMap = { [pageId: number]: PageOutline }

type DepartmentIdPositionOutlineArrMap = { [departmentId: number]: PositionOutline[] };

type DepartmentIdPositionIdMap = { [departmentId: number]: number };

type PageIdMenuGroupOutlineArrMap = { [pageId: number]: MenuGroupOutline[] };

type PageIdMenuGroupIdMap = { [pageId: number]: number };

export interface Visit {
    id: number;
    action:
        | 'detail'
        | 'update'
        | 'create'
        | 'syncRole'
        | 'syncPosition'
        | 'syncMenuGroup'
        | 'syncSubject'
        | 'processBuilder'
        | 'password';
}

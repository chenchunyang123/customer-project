import React, {ReactNode, useState} from "react";
import request                      from "umi-request";
import {packQuery, packReq}         from "@/word/function";
import ProTable, {ProTableProps}    from "@ant-design/pro-table";
import {SelectType, Visit}          from "@/global";
import {IntlType}                   from "@ant-design/pro-provider";

interface TablePageProps extends ProTableProps<any, any, any> {
    selectedClear: () => void;
    setVisit: (visit: Visit) => void;
    path?: string;
    alertRender: (selectType: SelectType, props: {
        intl: IntlType;
        selectedRowKeys: (number | string)[];
        selectedRows: any[];
        onCleanSelected: () => void;
    }) => ReactNode;
}

const TablePage: React.FC<TablePageProps> = (props) => {
    const [searchCollapsed, setSearchCollapsed] = useState(true);
    const [selectType, setSelectType] = useState<SelectType>(null);
    return (
        <ProTable
            tableAlertRender={(renderPs) => props.alertRender(selectType, renderPs)}
            rowSelection={{
                hideSelectAll:    true,
                onChange:         ((selectedRowKeys, selectedRows) => {
                    if (selectedRowKeys.length === 0) {
                        setSelectType(null);
                    } else {
                        if (selectedRows[0].status === 1) {
                            setSelectType('new');
                            console.log('new')
                        } else {
                            setSelectType('old');
                        }
                    }
                }),
                getCheckboxProps: (row) => ({
                    disabled: selectType !== null && (row.status !== 1 ? selectType === 'new' : selectType === 'old')
                })
            }}
            {...props}
            key={'id'}
            actionRef={props.actionRef}
            columns={props.columns}
            options={{fullScreen: true, density: false}}
            size="large"
            rowKey="id"
            bordered
            search={{
                span:       8,
                labelWidth: 100,
                collapsed:  searchCollapsed,
                onCollapse: () => setSearchCollapsed(!searchCollapsed),
            }}
            request={props.request !== undefined ? props.request : async (...params) => {
                console.log('log1 ', ...params);
                let paramsAfter: any = packQuery(...params);
                console.log('log2 ', paramsAfter);
                return packReq(request(props.path as any, {method: 'POST', data: paramsAfter,}),);
            }}
        />
    );
}

export default TablePage;
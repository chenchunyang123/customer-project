import React, {useState}         from "react";
import request                   from "umi-request";
import {packQuery, packReq}      from "@/word/function";
import ProTable, {ProTableProps} from "@ant-design/pro-table";
import {Visit}                   from "@/global";

interface TablePageProps extends ProTableProps<any, any, any> {
    selectedClear: () => void;
    setVisit: (visit: Visit) => void;
    path?: string;
}

const TablePage: React.FC<TablePageProps> = (props) => {
    const [searchCollapsed, setSearchCollapsed] = useState(true);
    return (
        <ProTable
            {...props}
            key={'id'}
            rowSelection={{}}
            actionRef={props.actionRef}
            columns={props.columns}
            options={{fullScreen: true, density: false}}
            size="large"
            rowKey="id"
            bordered
            search={{
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
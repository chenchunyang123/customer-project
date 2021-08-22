import React, {useRef, useCallback, ReactNode, useContext}                                  from 'react';
import {useState}                                                                           from 'react';
import request                                                                              from 'umi-request';
import {ActionType, ProColumns, TableDropdown}                                              from '@ant-design/pro-table';
import {Button, message}                                                                    from 'antd';
import Form                                                                                 from './form';
import ConfirmDelete                                                                        from '@/pack/confirmDelete';
import ConfirmStatus                                                                        from '@/pack/confirmStatus';
import {ActionMenuItem, Visit}                                                              from "@/global";
import {ColumnCreatedAt, ColumnId, ColumnStatus, ColumnUpdatedAt}                           from "@/word/enum";
import TablePage                                                                            from "@/pack/tablePage";
import {PlusSquareTwoTone}                                                                  from "@ant-design/icons";
import {AdminPositionCreate, AdminPositionDelete, AdminPositionStatus, AdminPositionUpdate} from "@/word/const";
import {CanContext}                                                                         from "@/word/state";

interface Row {
    id: number;
    status: number;
    name: string;
    weight: string;
    admin_department_id: number;
    admin_department: {
        name: string;
    };
    description: string;
    created_at: string;
    updated_at: string;
}

const AdminPosition: React.FC = () => {
    const [visit, setVisit] = useState<Visit>({
        id:     -1,
        action: 'detail',
    });
    const actionRef = useRef<ActionType>();
    const can = useContext(CanContext);
    const clearSelected = () => {
        ((actionRef.current as any as ActionType).clearSelected as any)();
    };
    const columns: ProColumns<Row>[] = [
        ColumnId,
        ColumnStatus,
        {
            title:     '所属部门',
            dataIndex: 'admin_department_name',
            search:    false,
            render:    (_, row) => (
                <>
                    {row.admin_department.name}
                </>
            )
        },
        {
            title:     '名称',
            dataIndex: 'name',
            render:    (val, row) => (
                <div dangerouslySetInnerHTML={{__html: row.name}}/>
            )
        },
        {
            title:     '描述',
            dataIndex: 'description',
            render:    (val, row) => (
                <div dangerouslySetInnerHTML={{__html: row.description}}/>
            )
        },
        ...ColumnCreatedAt,
        ...ColumnUpdatedAt,
        {
            title:     '处理',
            valueType: 'option',
            render:    (_, row) => {
                let menuArr: ActionMenuItem[] = [];
                if (row.status === 1 && can[AdminPositionDelete]) {
                    menuArr.push({
                        key:  'delete',
                        name: (
                                  <ConfirmDelete
                                      key={'delete'}
                                      url="/admin/position"
                                      id_arr={[row.id]}
                                      onConfirm={() => {
                                          actionRef.current?.reload();
                                          clearSelected();
                                      }}
                                  >
                                      <span>删除</span>
                                  </ConfirmDelete>
                              ),
                    });
                }
                let jsx: ReactNode | null = null;
                if (menuArr.length === 1) {
                    jsx = menuArr[0].name;
                } else if (menuArr.length > 1) {
                    jsx = <TableDropdown key="action" menus={menuArr}/>;
                }
                return [
                    (
                        can[AdminPositionUpdate] &&
                        <a
                            key="update"
                            onClick={() => {
                                setVisit({
                                    id:     row.id,
                                    action: 'update',
                                });
                            }}
                        >
                            修改
                        </a>
                    ),
                    jsx,
                ];
            },
        },
    ];
    const cancel = useCallback(() => {
        setVisit({
            id:     -1,
            action: 'detail',
        });
    }, []);
    const formFinish = useCallback(
        (data: any) => {
            let path = '/api/admin/position';
            let method = 'POST';
            if (visit.action === 'update') {
                path = path + '/' + visit.id;
                method = 'PUT';
            }
            return request(path, {method, data}).then((res) => {
                if (res.status === 200) {
                    message.success('编辑成功');
                    cancel();
                    actionRef.current?.reload();
                } else {
                    message.error('编辑失败');
                    return false;
                }
                return true;
            });
        },
        [visit.id],
    );
    return (
        <>
            <Form visit={visit} onCancel={cancel} onFinish={formFinish}/>
            <TablePage
                alertRender={(selectType, {selectedRowKeys}) => {
                    return [
                        (
                            selectType === 'new' &&
                            <ConfirmDelete
                                key="deleteAction"
                                id_arr={selectedRowKeys as number[]}
                                url="/admin/position"
                                onConfirm={() => {
                                    (actionRef as React.MutableRefObject<ActionType>).current?.reload();
                                    clearSelected();
                                }}
                            >
                                <a>删除</a>
                            </ConfirmDelete>
                        ),
                        (
                            selectType === 'old' &&
                            <ConfirmStatus
                                key="status"
                                optionArr={[
                                    {
                                        label: '启用',
                                        value: 2,
                                    },
                                    {
                                        label: '异常',
                                        value: 3,
                                    },
                                    {
                                        label: '停用',
                                        value: 4,
                                    },
                                ]}
                                onConfirm={(value) => {
                                    request(`/api/admin/position/status/${value}`, {
                                        method: 'POST',
                                        data:   {id_arr: selectedRowKeys},
                                    }).then(({status}) => {
                                        if (status === 200) {
                                            (actionRef as React.MutableRefObject<ActionType>).current?.reload();
                                            clearSelected();
                                        }
                                    });
                                }}
                            />
                        ),
                    ];
                }}
                actionRef={actionRef}
                toolBarRender={() => [
                    (
                        can[AdminPositionCreate] &&
                        <Button
                            icon={<PlusSquareTwoTone/>}
                            onClick={() =>
                                setVisit({id: 0, action: 'create'})
                            }
                        >
                            添加
                        </Button>
                    ),
                ]}
                scroll={{y: 400}}
                columns={columns}
                setVisit={setVisit}
                selectedClear={clearSelected}
                path={'/api/admin/position/list'}
                canSelection={(row: any) => (
                    (
                        row.status === 1 &&
                        (
                            !can[AdminPositionDelete]
                        )
                    ) ||
                    (
                        row.status !== 1 &&
                        (
                            !can[AdminPositionStatus]
                        )
                    )
                )}
            />
        </>
    );
};

export default AdminPosition;

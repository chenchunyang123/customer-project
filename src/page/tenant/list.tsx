import React, {useRef, useCallback, ReactNode, useContext}        from 'react';
import {useState}                                                 from 'react';
import request                                                    from 'umi-request';
import {ActionType, ProColumns, TableDropdown}                    from '@ant-design/pro-table';
import {Button, message}                                          from 'antd';
import Form                                                       from './form';
import ConfirmDelete                                              from '@/pack/confirmDelete';
import ConfirmStatus                                              from '@/pack/confirmStatus';
import {ActionMenuItem, Visit}                                    from "@/global";
import {ColumnCreatedAt, ColumnId, ColumnStatus, ColumnUpdatedAt} from "@/word/enum";
import TablePage                                                  from "@/pack/tablePage";
import {PlusSquareTwoTone, SyncOutlined}                          from "@ant-design/icons";
import {CanContext, UserinfoContext}                              from "@/word/state";
import {TenantCreate, TenantDelete, TenantStatus, TenantUpdate}   from "@/word/const";

interface Row {
    id: number;
    status: number;
    name: string;
    address: string;
    phone: string;
    real_name: string;
    district_name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

const Tenant: React.FC = () => {
    const [visit, setVisit] = useState<Visit>({
        id:     -1,
        action: 'detail',
    });
    const actionRef = useRef<ActionType>();
    const userinfo = useContext(UserinfoContext);
    const can = useContext(CanContext);
    const clearSelected = () => {
        ((actionRef.current as any as ActionType).clearSelected as any)();
    };
    const columns: ProColumns<Row>[] = [
        ColumnId,
        ColumnStatus,
        {
            title:     '名称',
            dataIndex: 'name',
            render:    (val, row) => (
                <div dangerouslySetInnerHTML={{__html: row.name}}/>
            )
        },
        {
            title:     '所属用户',
            dataIndex: 'real_name',
            render:    (val, row) => (
                <div dangerouslySetInnerHTML={{__html: row.real_name}}/>
            )
        },
        {
            title:     '管理账号',
            dataIndex: 'phone',
            render:    (val, row) => (
                <div dangerouslySetInnerHTML={{__html: row.phone}}/>
            )
        },
        {
            title:     '详细地址',
            dataIndex: 'address',
            render:    (val, row) => (
                <div dangerouslySetInnerHTML={{__html: row.address}}/>
            )
        },
        {
            title:        '描述',
            hideInSearch: true,
            dataIndex:    'description',
            render:       (val, row) => (
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
                if (row.status === 1 && can[TenantDelete]) {
                    menuArr.push({
                        key:  'delete',
                        name: (
                                  <div key={'delete'}>
                                      <ConfirmDelete
                                          key={'delete'}
                                          url="/tenant/1"
                                          id_arr={[row.id]}
                                          onConfirm={() => {
                                              actionRef.current?.reload();
                                              clearSelected();
                                          }}
                                      >
                                      </ConfirmDelete>
                                  </div>
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
                        can[TenantUpdate] &&
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
                    <div key={'lock-block'}>
                        {
                            userinfo.userinfo.prv_id === row.id ?
                            <div
                                className={'disabled-link'}
                                style={{
                                    color: row.status === 1 ?
                                           '#52c41a' :
                                           row.status === 2 ?
                                           '#1890ff' :
                                           row.status === 3 ?
                                           '#cd201f' :
                                           '#c8c8c8'
                                }}
                            >
                                <SyncOutlined spin/> 当前租户
                            </div> :
                            <a
                                onClick={() => {
                                    request('/api/tenant/lock/' + row.id, {method: 'POST'})
                                        .then(
                                            ({status}) => {
                                                if (status === 200) {
                                                    userinfo.setUserinfo({
                                                        ...userinfo.userinfo,
                                                        tenant_name:   row.name,
                                                        tenant_status: row.status,
                                                        prv_id:        row.id,
                                                    });
                                                }
                                            }
                                        )
                                }}
                            >
                                切换租户
                            </a>
                        }
                    </div>,
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
            let path = '/api/tenant/1';
            let method = 'POST';
            if (visit.action === 'update') {
                path = path + '/' + visit.id;
                method = 'PUT';
            }
            console.log(path, method);
            return request(path, {method, data}).then((res) => {
                if (res.status < 209) {
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
                                url="/tenant/1"
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
                                    request(`/api/tenant/status/1/${value}`, {
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
                        can[TenantCreate] &&
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
                path={'/api/tenant/list'}
                selectedClear={clearSelected}
                canSelection={(row: any) => (
                    (
                        row.status === 1 &&
                        (
                            !can[TenantDelete]
                        )
                    ) ||
                    (
                        row.status !== 1 &&
                        (
                            !can[TenantStatus]
                        )
                    )
                )}
            />
        </>
    );
};

export default Tenant;

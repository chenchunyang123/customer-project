import React, {useRef, useCallback, ReactNode}                    from 'react';
import {useState}                                                 from 'react';
import request                                                    from 'umi-request';
import {ActionType, ProColumns, TableDropdown}                    from '@ant-design/pro-table';
import {Avatar, Button, message}                                  from 'antd';
import Form                                                       from './form';
import ConfirmDelete                                              from '@/pack/confirmDelete';
import ConfirmStatus                                              from '@/pack/confirmStatus';
import used                                                       from "@/word/used";
import {ActionMenuItem, Visit}                                    from "@/global";
import {ColumnCreatedAT, ColumnID, ColumnSTATUS, ColumnUpdatedAT} from "@/word/enum";
import TablePage                                                  from "@/pack/tablePage";
import {PlusSquareTwoTone}                                        from "@ant-design/icons";

interface Row {
    id: number;
    code: string;
    sex: number;
    status: number;
    phone: string;
    email: string;
    avatar: string;
    nick_name: string;
    real_name: string;
    birth_at: string;
    created_at: string;
    updated_at: string;
}

const AdminUser: React.FC = () => {
    const [visit, setVisit] = useState<Visit>({
        id:     -1,
        action: 'detail',
    });
    const actionRef = useRef<ActionType>();
    const clearSelected = () => {
        ((actionRef.current as any as ActionType).clearSelected as any)();
    };
    const columns: ProColumns<Row>[] = [
        ColumnID,
        ColumnSTATUS,
        {
            title:     '头像',
            dataIndex: 'avatar',
            width:     60,
            render:    (_, row) => <Avatar src={used.s3_api + row.avatar}/>,
        },
        {
            title:     '手机号',
            order:     10,
            dataIndex: 'phone',
            width:     100,
            render:    (val, row) => (
                <div dangerouslySetInnerHTML={{__html: row.phone}}/>
            )
        },
        {
            title:     '邮箱地址',
            dataIndex: 'email',
            width:     140,
            render:    (val, row) => (
                <div dangerouslySetInnerHTML={{__html: row.email}}/>
            )
        },
        {
            title:     '昵称',
            dataIndex: 'nick_name',
            order:     9,
            width:     100,
            render:    (val, row) => (
                <div dangerouslySetInnerHTML={{__html: row.nick_name}}/>
            )
        },
        {
            dataIndex: 'real_name',
            ellipsis:  true,
            title:     '真实名称',
            width:     100,
            render:    (val, row) => (
                <div dangerouslySetInnerHTML={{__html: row.real_name}}/>
            )
        },
        {
            title:       '生日',
            dataIndex:   'birth_at',
            valueType:   'dateRange',
            filters:     true,
            hideInTable: true,
            search:      {
                transform: (value: any) => ({
                    birth_at_start: value[0],
                    birth_at_end:   value[1],
                }),
            },
        },
        {
            title:     '编号',
            dataIndex: 'code',
            width:     100,
            render:    (val, row) => (
                <div dangerouslySetInnerHTML={{__html: row.code}}/>
            )
        },
        {
            title:     '性别',
            dataIndex: 'sex',
            valueType: 'checkbox',
            order:     0,
            width:     50,
            valueEnum: {
                1: {
                    text: '男',
                },
                2: {
                    text: '女',
                },
            },
        },
        {
            title:        '生日',
            sorter:       true,
            dataIndex:    'birth_at',
            valueType:    'date',
            filters:      false,
            width:        90,
            hideInSearch: true,
        },
        ...ColumnCreatedAT,
        ...ColumnUpdatedAT,
        {
            title:     '处理',
            width:     100,
            fixed:     'right',
            valueType: 'option',
            render:    (_, row) => {
                let menuArr: ActionMenuItem[] = [];
                menuArr.push({
                    key:  'delete',
                    name: (
                              <ConfirmDelete
                                  key={'delete'}
                                  url="/admin/user"
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
                let jsx: ReactNode | null = null;
                if (menuArr.length === 1) {
                    jsx = menuArr[0].name;
                } else if (menuArr.length > 1) {
                    jsx = <TableDropdown key="action" menus={menuArr}/>;
                }
                return [
                    (
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
            let path = '/api/admin/user';
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
                tableAlertRender={({selectedRowKeys}) => {
                    return [
                        <ConfirmDelete
                            key="deleteAction"
                            id_arr={selectedRowKeys as number[]}
                            url="/admin/user"
                            onConfirm={() => {
                                (actionRef as React.MutableRefObject<ActionType>).current?.reload();
                                clearSelected();
                            }}
                        >
                            <a>删除</a>
                        </ConfirmDelete>,
                        (
                            <ConfirmStatus
                                key="status"
                                optionArr={[
                                    {
                                        label: '启用',
                                        value: 1,
                                    },
                                    {
                                        label: '停用',
                                        value: 2,
                                    },
                                    {
                                        label: '锁定',
                                        value: 3,
                                    },
                                ]}
                                onConfirm={(value) => {
                                    request(`/api/admin/user/status/${value}`, {
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
                scroll={{x: 1700, y: 400}}
                columns={columns}
                setVisit={setVisit}
                path={'/api/admin/user/list'}
                selectedClear={clearSelected}
            />
        </>
    );
};

export default AdminUser;

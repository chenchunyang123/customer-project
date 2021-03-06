import React, {useRef, useCallback, ReactNode, useContext}                  from 'react';
import {useState}                                                           from 'react';
import request                                                              from 'umi-request';
import {ActionType, ProColumns, TableDropdown}                              from '@ant-design/pro-table';
import {Avatar, Button, message}                                            from 'antd';
import Form                                                                 from './form';
import ConfirmDelete                                                        from '@/pack/confirmDelete';
import ConfirmStatus                                                        from '@/pack/confirmStatus';
import used                                                                 from "@/word/used";
import {ActionMenuItem, PageProps, Visit}                                   from "@/global";
import {ColumnCreatedAT, ColumnID, ColumnSTATUS, ColumnUpdatedAT}           from "@/word/enum";
import TablePage                                                            from "@/pack/tablePage";
import {PlusSquareTwoTone}                                                  from "@ant-design/icons";
import {AdminUserCreate, AdminUserDelete, AdminUserStatus, AdminUserUpdate} from "@/word/const";
import {CanContext}                                                         from "@/word/state";

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

const AdminUser: React.FC<PageProps> = (props) => {
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
        ColumnID,
        ColumnSTATUS,
        {
            title:     '??????',
            dataIndex: 'avatar',
            width:     60,
            render:    (_, row) => <Avatar src={used.s3_api + used.s3_prefix_avatar + '/' + row.avatar}/>,
        },
        {
            title:     '?????????',
            order:     10,
            dataIndex: 'phone',
            width:     100,
            render:    (val, row) => (
                <div dangerouslySetInnerHTML={{__html: row.phone}}/>
            )
        },
        {
            title:     '????????????',
            dataIndex: 'email',
            width:     220,
            ellipsis:  true,
            render:    (val, row) => (
                <div className={'search'} dangerouslySetInnerHTML={{__html: row.email}}/>
            )
        },
        {
            title:     '??????',
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
            title:     '????????????',
            width:     100,
            render:    (val, row) => (
                <div dangerouslySetInnerHTML={{__html: row.real_name}}/>
            )
        },
        {
            title:       '??????',
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
            title:     '??????',
            dataIndex: 'code',
            width:     100,
            render:    (val, row) => (
                <div dangerouslySetInnerHTML={{__html: row.code}}/>
            )
        },
        {
            title:     '??????',
            dataIndex: 'sex',
            valueType: 'radio',
            order:     0,
            width:     50,
            valueEnum: {
                1: {
                    text: '???',
                },
                2: {
                    text: '???',
                },
            },
        },
        {
            title:        '??????',
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
            title:     '??????',
            width:     100,
            fixed:     'right',
            valueType: 'option',
            render:    (_, row) => {
                let menuArr: ActionMenuItem[] = [];
                if (row.status === 1) {
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
                                      <span>??????</span>
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
                        can[AdminUserUpdate] &&
                        <a
                            key="update"
                            onClick={() => {
                                setVisit({
                                    id:     row.id,
                                    action: 'update',
                                });
                            }}
                        >
                            ??????
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
        clearSelected();
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
                if (res.status < 202) {
                    message.success('????????????');
                    cancel();
                    actionRef.current?.reload();
                } else {
                    message.error('????????????');
                    return false;
                }
                return true;
            });
        },
        [visit.id],
    );
    return (
        <>
            {props.Outline !== true && <Form visit={visit} onCancel={cancel} onFinish={formFinish}/>}
            <TablePage
                alertRender={(selectType, {selectedRowKeys}) => {
                    return [
                        (
                            selectType === 'new' &&
                            <ConfirmDelete
                                key="deleteAction"
                                id_arr={selectedRowKeys as number[]}
                                url="/admin/user"
                                onConfirm={() => {
                                    (actionRef as React.MutableRefObject<ActionType>).current?.reload();
                                    clearSelected();
                                }}
                            >
                                <a>??????(????????????)</a>
                            </ConfirmDelete>
                        ),
                        (
                            selectType === 'old' &&
                            <ConfirmStatus
                                key="status"
                                optionArr={[
                                    {
                                        label: '??????',
                                        value: 2,
                                    },
                                    {
                                        label: '??????',
                                        value: 3,
                                    },
                                    {
                                        label: '??????',
                                        value: 4,
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
                        can[AdminUserCreate] &&
                        <Button
                            icon={<PlusSquareTwoTone/>}
                            onClick={() =>
                                setVisit({id: 0, action: 'create'})
                            }
                        >
                            ??????
                        </Button>
                    ),
                ]}
                scroll={{x: 2000, y: 400}}
                columns={columns}
                setVisit={setVisit}
                path={'/api/admin/user/list'}
                selectedClear={clearSelected}
                canSelection={(row: any) => (
                    (
                        row.status === 1 &&
                        (
                            !can[AdminUserDelete]
                        )
                    ) ||
                    (
                        row.status !== 1 &&
                        (
                            !can[AdminUserStatus]
                        )
                    )
                )}
            />
        </>
    );
};

export default AdminUser;

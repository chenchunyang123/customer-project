import React                                                  from 'react';
import {ProColumns}                                           from '@ant-design/pro-table';
import TablePage                                              from "@/pack/tablePage";
import request                                                from 'umi-request';
import {useContext, useState, useCallback, ReactNode, useRef} from 'react';
import {ActionType, TableDropdown}                            from '@ant-design/pro-table';
import {Button, message}                                      from 'antd';
import Form                                                   from './form';
import ConfirmDelete                                          from '@/pack/confirmDelete';
import {ColumnId}                                             from "@/word/enum";
import {PlusSquareTwoTone}                                    from "@ant-design/icons";
import {CanContext}                                           from "@/word/state";
import {ActionMenuItem, PageProps, Visit}                     from "@/global";
import {RoughCreate, RoughDelete, RoughStatus, RoughUpdate}   from "@/word/const";
import {ColumnStatus}                                         from '@/word/enum';
import ConfirmStatus                                          from '@/pack/confirmStatus';
import {ColumnCreatedAt, ColumnUpdatedAt}                     from "@/word/enum";

// rough-auto state-type

const Rough: React.FC<PageProps> = (props) => {
    const [visit, setVisit] = useState<Visit>({
        id:     -1,
        action: 'detail',
    });
    const actionRef = useRef<ActionType>();
    const can = useContext(CanContext);
    const clearSelected = () => {
        ((actionRef.current as any as ActionType).clearSelected as any)();
    };
    const columns: ProColumns[] = [
        ColumnId,
        // rough-auto column-type
        ...ColumnCreatedAt,
        ...ColumnUpdatedAt,
    ];
    if (props.Outline !== true) {
        columns.splice(1, 0, ColumnStatus);
        columns.push({
            title:     '处理',
            valueType: 'option',
            render:    (_, row) => {
                let menuArr: ActionMenuItem[] = [];
                if (row.status === 1 && can[RoughDelete]) {
                    menuArr.push({
                        key:  'delete',
                        name: (
                                  <div key={'delete'}>
                                      <ConfirmDelete
                                          key={'delete'}
                                          url="/rough"
                                          id_arr={[row.id]}
                                          onConfirm={() => {
                                              actionRef.current?.reload();
                                              clearSelected();
                                          }}
                                      />
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
                        can[RoughUpdate] &&
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
        });
    } else {
        let render: any;
        const value = props.value as number[];
        if (props.multiple) {
            render = (_: any, row: { id: number }) => {
                const ok: boolean = value.indexOf(row.id) > 0;
                return (
                    <a
                        onClick={() => {
                            if (ok) {
                                props.onChange!(value.filter(i => i === row.id));
                            } else {
                                props.onChange!([...value, row.id]);
                            }
                        }}
                    >
                        {ok ? '取消选择' : '选择'}
                    </a>
                );
            }
        } else {
            render = (_: any, row: { id: number }) => (
                <a
                    onClick={() => props.onChange!([row.id])}
                >
                    选择
                </a>
            )
        }
        columns.push({title: '选择', render})
    }
    const cancel = useCallback(() => {
        setVisit({
            id:     -1,
            action: 'detail',
        });
    }, []);
    const formFinish = useCallback(
        (data: any) => {
            let path = '/api/rough';
            let method = 'POST';
            if (visit.action === 'update') {
                path = path + '/' + visit.id;
                method = 'PUT';
            }
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
                            can[RoughDelete] &&
                            selectType === 'new' &&
                            <ConfirmDelete
                                key="deleteAction"
                                id_arr={selectedRowKeys as number[]}
                                url="/rough"
                                onConfirm={() => {
                                    (actionRef as React.MutableRefObject<ActionType>).current?.reload();
                                    clearSelected();
                                }}
                            >
                                <a>删除</a>
                            </ConfirmDelete>
                        ),
                        (
                            can[RoughStatus] &&
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
                                    request(`/api/rough/status/${value}`, {
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
                        can[RoughCreate] &&
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
                headerTitle={'毛坯'}
                scroll={{y: 400}}
                columns={columns}
                setVisit={setVisit}
                path={'/api/rough/list'}
                selectedClear={clearSelected}
                canSelection={(row: any) => (
                    (
                        row.status === 1 &&
                        (
                            !can[RoughDelete]
                        )
                    ) ||
                    (
                        row.status !== 1 &&
                        (
                            !can[RoughStatus]
                        )
                    )
                )}
            />
        </>
    );
};

export default Rough;

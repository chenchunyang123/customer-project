import React, {useEffect, useRef, useState}                                                                           from 'react';
import ProForm, {
    FormInstance,
    ModalForm,
    ProFormDatePicker,
    ProFormSelect,
    ProFormText,
}                                                                                                                     from '@ant-design/pro-form';
import request                                                                                                        from 'umi-request';
import {message, Spin, Table, TableColumnProps}                                                                       from 'antd';
import Checkbox                                                                                                       from 'antd/lib/checkbox/Checkbox';
import {DepartmentIdOutlineMap, DepartmentIdPositionIdMap, DepartmentIdPositionOutlineArrMap, PositionOutline, Visit} from "@/global";

interface Props {
    visit: Visit;
    onCancel: () => void;
    onFinish: (data: any) => Promise<boolean | void>;
}

const Detail: React.FC<Props> = (props) => {
    const formRef = useRef<FormInstance>();
    const [status, setStatus] = useState<number>(0);
    const [departmentIdOutlineMap, setDepartmentIdOutlineMap] = useState<DepartmentIdOutlineMap>({});
    const [positionOutlineArr, setPositionOutlineArr] = useState<PositionOutline[]>([]);
    const [departmentIdPositionIdMap, setDepartmentIdPositionIdMap] = useState<DepartmentIdPositionIdMap>({});
    useEffect(() => {
        if (
            (props.visit.id > 0 && props.visit.action === 'update') ||
            (props.visit.id === 0 && props.visit.action === 'create')
        ) {
            formRef.current?.resetFields();
            setDepartmentIdPositionIdMap({});
            setStatus(0);
            if (props.visit.id === 0 && props.visit.action === 'create') {
                setStatus(1);
            }
            request('/api/admin/user/' + props.visit.id, {method: 'POST'}).then(
                ({
                     data,
                     status:                       resStatus,
                     admin_position_outline_arr:   {data: positionOutlineArr},
                     admin_department_outline_arr: {data: departmentOutlineArr}
                 }) => {
                    formRef.current?.resetFields();
                    new Promise<PositionOutline[]>(
                        resolve => {
                            if (resStatus > 202) {
                                message.error('?????????????????????');
                                return
                            }
                            let newDepartmentIdOutlineMap: DepartmentIdOutlineMap = {};
                            for (let i = 0; i < departmentOutlineArr.length; i++) {
                                const departmentOutline = departmentOutlineArr[i];
                                newDepartmentIdOutlineMap[departmentOutline.id] = departmentOutline;
                            }
                            let departmentIdPositionOutlineArrMap: DepartmentIdPositionOutlineArrMap = {};
                            for (let i = 0; i < positionOutlineArr.length; i++) {
                                const positionOutline = positionOutlineArr[i];
                                let usedPositionOutlineArr = departmentIdPositionOutlineArrMap[positionOutline.admin_department_id];
                                if (usedPositionOutlineArr !== undefined) {
                                    usedPositionOutlineArr[0].span += 1;
                                    positionOutline.span = 0;
                                    usedPositionOutlineArr.push(positionOutline);
                                } else {
                                    positionOutline.span = 1;
                                    departmentIdPositionOutlineArrMap[positionOutline.admin_department_id] = [positionOutline];
                                }
                            }
                            let newPositionOutline = [];
                            for (let departmentId in departmentIdPositionOutlineArrMap) {
                                newPositionOutline.push(...departmentIdPositionOutlineArrMap[departmentId]);
                            }
                            setDepartmentIdOutlineMap(newDepartmentIdOutlineMap);
                            setPositionOutlineArr(newPositionOutline);
                            console.log('log1 ', newPositionOutline);
                            console.log('log2 ', newDepartmentIdOutlineMap);
                            resolve(newPositionOutline);
                        }
                    ).then(
                        (nextPositionOutlineArr) => {
                            if (data) {
                                const {
                                          status,
                                          id,
                                          code,
                                          phone,
                                          email,
                                          real_name,
                                          nick_name,
                                          sex,
                                          birth_at,
                                          admin_position_id_arr,
                                      } = data;
                                formRef.current?.setFieldsValue({
                                    id,
                                    status,
                                    nick_name,
                                    real_name,
                                    email,
                                    phone,
                                    code,
                                    sex,
                                    birth_at,
                                });
                                setStatus(status);
                                if (admin_position_id_arr !== null) {
                                    let newDepartmentIdPositionOutlineMap: DepartmentIdPositionIdMap = {};
                                    for (let i = 0; i < nextPositionOutlineArr.length; i++) {
                                        if (admin_position_id_arr.indexOf(nextPositionOutlineArr[i].id) !== -1) {
                                            newDepartmentIdPositionOutlineMap[nextPositionOutlineArr[i].admin_department_id] = nextPositionOutlineArr[i].id;
                                        }
                                    }
                                    setDepartmentIdPositionIdMap(newDepartmentIdPositionOutlineMap);
                                    console.log('log[ref]: ', newDepartmentIdPositionOutlineMap,);
                                } else {
                                    setDepartmentIdPositionIdMap({});
                                }
                            } else {
                                setStatus(1);
                            }
                        }
                    )
                },
            );
        }
    }, [props.visit.id]);
    const departmentPositionColumnArr: TableColumnProps<PositionOutline>[] =
              [
                  {
                      title:  '????????????',
                      render: (_, row) => {
                          return {
                              children: <>{departmentIdOutlineMap[row.admin_department_id].name}</>,
                              props:    {
                                  rowSpan: row.span,
                              },
                          };
                      },
                  },
                  {
                      title:  '??????????????????',
                      render: (_, row) => {
                          return {
                              children: <>{departmentIdOutlineMap[row.admin_department_id].description}</>,
                              props:    {
                                  rowSpan: row.span,
                              },
                          };
                      },
                  },
                  {
                      title:     '????????????',
                      dataIndex: 'name',
                      render:    (val, row) => (
                          <Checkbox
                              checked={departmentIdPositionIdMap[row.admin_department_id] === row.id}
                              onChange={(e) => {
                                  const newDepartmentPositionMap = {
                                      ...departmentIdPositionIdMap,
                                  };
                                  if (e.target.checked) {
                                      newDepartmentPositionMap[row.admin_department_id] = row.id;
                                  } else {
                                      delete newDepartmentPositionMap[row.admin_department_id];
                                  }
                                  console.log(
                                      'log[???]: ',
                                      newDepartmentPositionMap,
                                  );
                                  setDepartmentIdPositionIdMap(newDepartmentPositionMap);
                              }}
                          >
                              {val}
                          </Checkbox>
                      ),
                  },
                  {
                      title:     '??????????????????',
                      dataIndex: 'description',
                  },
              ];
    return (
        <ModalForm
            width={480 + 1100 + 20}
            formRef={formRef}
            title={
                <>
                    ???????????????
                    {props.visit.action === 'create' ? (
                        ' ??????'
                    ) : props.visit.action === 'update' ? (
                        <>
                            {' ?????? '}
                            <em className={'em-id'}>ID: {props.visit.id}</em>
                        </>
                    ) : (
                            ''
                        )}
                </>
            }
            visible={
                props.visit.id > -1 &&
                ['create', 'update'].indexOf(props.visit.action) !== -1
            }
            modalProps={{
                bodyStyle: {
                    height:    557,
                    padding:   0,
                    overflowY: 'auto',
                },
                onCancel:  props.onCancel,
            }}
            onFinish={(value) => {
                let idArr: number[] = [];
                for (const id in departmentIdPositionIdMap) {
                    idArr.push(departmentIdPositionIdMap[id]);
                }
                return props.onFinish({
                    ...value,
                    admin_position_id_arr: idArr
                });
            }}
        >
            <Spin spinning={status < 1}>
                <div style={{display: 'flex'}}>
                    <div style={{width: 1100}}>
                        <div style={{height: 557}}>
                            <Table
                                pagination={false}
                                bordered
                                rowKey="id"
                                scroll={{y: 500}}
                                columns={departmentPositionColumnArr}
                                dataSource={positionOutlineArr}
                            />
                        </div>
                    </div>
                    <div style={{width: 480, padding: 24}}>
                        <ProForm.Group label="??????">
                            <ProFormSelect
                                disabled={props.visit.id === 0 || status === 1}
                                rules={[
                                    {
                                        required: props.visit.action !== 'create',
                                        message:  '???????????????'
                                    }
                                ]}
                                allowClear={false}
                                name="status"
                                label="?????????????????????"
                                width={200}
                                options={
                                    status === 1 ?
                                    [
                                        {label: '?????????', value: 1},
                                    ] :
                                    [
                                        {label: '?????????', value: 2},
                                        {label: '??????', value: 3},
                                        {label: '??????', value: 4},
                                    ]
                                }
                            />
                        </ProForm.Group>
                        <ProForm.Group label="????????????">
                            <ProFormText
                                width={200}
                                rules={[
                                    {
                                        required: true,
                                        message:  '?????????????????????'
                                    }
                                ]}
                                label="????????????"
                                name="real_name"
                                placeholder="?????????????????????"
                            />
                            <ProFormText
                                rules={[
                                    {
                                        required: true,
                                        message:  '???????????????'
                                    }
                                ]}
                                width={200}
                                label="??????"
                                name="nick_name"
                                placeholder="???????????????"
                            />
                        </ProForm.Group>
                        <ProForm.Group>
                            <ProFormText
                                width={200}
                                rules={[
                                    {
                                        required: true,
                                        message:  '??????????????????'
                                    }
                                ]}
                                name="phone"
                                label="?????????"
                                tooltip="??????????????????"
                                placeholder="??????????????????"
                            />
                            <ProFormText
                                rules={[
                                    {
                                        required: true,
                                        message:  '?????????????????????'
                                    }
                                ]}
                                width={200}
                                name="code"
                                label="????????????"
                                placeholder="?????????????????????"
                            />
                        </ProForm.Group>
                        <ProForm.Group>
                            <ProFormText
                                rules={[
                                    {
                                        required: true,
                                        message:  '?????????????????????'
                                    }
                                ]}
                                width={432}
                                name="email"
                                label="????????????"
                                tooltip="?????????????????????"
                                placeholder="?????????????????????"
                            />
                        </ProForm.Group>
                        <ProForm.Group>
                            <ProFormSelect
                                rules={[
                                    {
                                        required: true,
                                        message:  '???????????????'
                                    }
                                ]}
                                allowClear={false}
                                label="??????"
                                name="sex"
                                width={200}
                                options={[
                                    {label: '???', value: 1},
                                    {label: '???', value: 2},
                                ]}
                            />
                            <ProFormDatePicker
                                rules={[
                                    {
                                        required: true,
                                        message:  '?????????????????????'
                                    }
                                ]}
                                allowClear={false}
                                label="????????????"
                                width={200}
                                name="birth_at"
                            />
                        </ProForm.Group>
                    </div>
                </div>
            </Spin>
        </ModalForm>
    );
};

export default Detail;

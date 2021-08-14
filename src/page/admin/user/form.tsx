import React, {useEffect, useRef, useState}                                                                                              from 'react';
import ProForm, {
    FormInstance,
    ModalForm,
    ProFormDatePicker,
    ProFormSelect,
    ProFormText,
}                                                                                                                                        from '@ant-design/pro-form';
import request                                                                                                                           from 'umi-request';
import {message, Table, TableColumnProps}                                                                                                from 'antd';
import Checkbox                                                                                                                          from 'antd/lib/checkbox/Checkbox';
import {DepartmentIdOutlineMap, DepartmentIdPositionIdMap, DepartmentIdPositionOutlineArrMap, DepartmentOutline, PositionOutline, Visit} from "@/global";

interface Props {
    visit: Visit;
    onCancel: () => void;
    onFinish: (data: any) => Promise<boolean | void>;
}

const Detail: React.FC<Props> = (props) => {
    const formRef = useRef<FormInstance>();
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
            new Promise(
                (resolve, reject) => {
                    if (positionOutlineArr.length === 0) {
                        request('/api/admin/position/outline', {method: 'POST'}).then(
                            ({status, data: positionOutlineArr = []}: {
                                data: PositionOutline[];
                                status: number;
                            }) => {
                                if (status === 200) {
                                    request('/api/admin/department/outline', {method: 'POST'})
                                        .then(
                                            ({status, data: departmentOutlineArr = []}: {
                                                data: DepartmentOutline[];
                                                status: number;
                                            }) => {
                                                if (status === 200) {
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
                                                }
                                            }
                                        )
                                } else {
                                    message.error('获取服务器数据出错');
                                    reject([]);
                                }
                            },
                        );
                    } else {
                        resolve(positionOutlineArr);
                    }
                }
            )
                .then(
                    (nextPositionOutlineArr) => {
                        if (props.visit.id > 0 && props.visit.action === 'update') {
                            request('/api/admin/user/' + props.visit.id, {method: 'POST'}).then(
                                ({status: resStatus, data}) => {
                                    formRef.current?.resetFields();
                                    if (resStatus === 200) {
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
                                        if (admin_position_id_arr !== null) {
                                            let newDepartmentIdPositionOutlineMap: DepartmentIdPositionIdMap = {};
                                            const idArr = admin_position_id_arr as number[];
                                            const arr = nextPositionOutlineArr as PositionOutline[];
                                            for (let i = 0; i < arr.length; i++) {
                                                if (idArr.indexOf(arr[i].id) !== -1) {
                                                    newDepartmentIdPositionOutlineMap[arr[i].admin_department_id] = arr[i].id;
                                                }
                                            }
                                            setDepartmentIdPositionIdMap(newDepartmentIdPositionOutlineMap);
                                            console.log('log[ref]: ', newDepartmentIdPositionOutlineMap,);
                                        } else {
                                            setDepartmentIdPositionIdMap({});
                                        }
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
                                    } else {
                                        message.error('服务器请求出错');
                                    }
                                },
                            );
                        }
                    }
                )
        }
    }, [props.visit.id]);
    const departmentPositionColumnArr: TableColumnProps<PositionOutline>[] =
              [
                  {
                      title:  '部门名称',
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
                      title:  '部门职责描述',
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
                      title:     '岗位名称',
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
                                      'log[选]: ',
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
                      title:     '岗位职责描述',
                      dataIndex: 'description',
                  },
              ];
    return (
        <ModalForm
            width={480 + 1100}
            formRef={formRef}
            title={
                <>
                    管理员用户
                    {props.visit.action === 'create' ? (
                        ' 创建'
                    ) : props.visit.action === 'update' ? (
                        <>
                            {' 修改 '}
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
                    <ProForm.Group label="选项">
                        <ProFormSelect
                            required
                            name="status"
                            label="管理员启用状态"
                            width={200}
                            options={[
                                {label: '使用中', value: 2},
                                {label: '异常', value: 3},
                                {label: '停用', value: 4},
                            ]}
                        />
                    </ProForm.Group>
                    <ProForm.Group label="基本信息">
                        <ProFormText
                            required
                            width={200}
                            label="真实姓名"
                            name="real_name"
                            placeholder="请输入真实姓名"
                        />
                        <ProFormText
                            required
                            width={200}
                            label="昵称"
                            name="nick_name"
                            placeholder="请输入昵称"
                        />
                    </ProForm.Group>
                    <ProForm.Group>
                        <ProFormText
                            required
                            width={200}
                            name="phone"
                            label="手机号"
                            tooltip="作为账号使用"
                            placeholder="请输入手机号"
                        />
                        <ProFormText
                            required
                            width={200}
                            name="code"
                            label="人员编号"
                            placeholder="请输入人员编号"
                        />
                    </ProForm.Group>
                    <ProForm.Group>
                        <ProFormText
                            width={432}
                            name="email"
                            label="邮箱"
                            tooltip="可用于找回账号"
                            placeholder="请输入邮箱"
                        />
                    </ProForm.Group>
                    <ProForm.Group>
                        <ProFormSelect
                            required
                            label="性别"
                            name="sex"
                            width={200}
                            options={[
                                {label: '男', value: 1},
                                {label: '女', value: 2},
                            ]}
                        />
                        <ProFormDatePicker
                            label="生日"
                            width={200}
                            name="birth_at"
                        />
                    </ProForm.Group>
                </div>
            </div>
        </ModalForm>
    );
};

export default Detail;

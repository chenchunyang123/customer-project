import React, {useEffect, useRef, useState}                                                                                                      from 'react';
import ProForm, {
    FormInstance,
    ModalForm,
    ProFormDigit,
    ProFormSelect,
    ProFormText, ProFormTextArea,
}                                                                                                                                                from '@ant-design/pro-form';
import request                                                                                                                                   from 'umi-request';
import {Checkbox, message, Table, TableColumnProps}                                                                                              from 'antd';
import {DepartmentOutline, MenuGroupOutline, PageIdMenuGroupIdMap, PageIdMenuGroupOutlineArrMap, PageIdOutlineMap, PageOutline, ReOption, Visit} from "@/global";

interface Props {
    visit: Visit;
    onCancel: () => void;
    onFinish: (data: any) => Promise<boolean | void>;
}

const Detail: React.FC<Props> = (props) => {
    const formRef = useRef<FormInstance>();
    const [pageIdOutlineMap, setPageIdOutlineMap] = useState<PageIdOutlineMap>({});
    const [departmentOutlineArr, setDepartmentOutlineArr] = useState<ReOption[]>([]);
    const [menuGroupOutlineArr, setMenuGroupOutlineArr] = useState<MenuGroupOutline[]>([]);
    const [pageIdMenuGroupIdMap, setPageIdMenuGroupIdMap] = useState<PageIdMenuGroupIdMap>({});
    useEffect(() => {
        if (
            (props.visit.id > 0 && props.visit.action === 'update') ||
            (props.visit.id === 0 && props.visit.action === 'create')
        ) {
            formRef.current?.resetFields();
            setPageIdMenuGroupIdMap({});
            new Promise(
                (resolve, reject) => {
                    if (departmentOutlineArr.length === 0) {
                        request('/api/admin/department/outline', {method: 'POST'}).then(
                            ({status, data: departmentOutlineArr = []}: {
                                status: number;
                                data: DepartmentOutline[];
                            }) => {
                                if (status === 200) {
                                    let reDepartmentArr: ReOption[] = [];
                                    for (let i = 0; i < departmentOutlineArr.length; i++) {
                                        const departmentOutline = departmentOutlineArr[i];
                                        reDepartmentArr.push({
                                            label: departmentOutline.name,
                                            value: departmentOutline.id
                                        });
                                    }
                                    setDepartmentOutlineArr(reDepartmentArr);
                                }
                            }
                        )
                        request('/api/admin/menu/group/outline', {method: 'POST'}).then(
                            ({status, data: menuGroupOutlineArr = []}: {
                                data: MenuGroupOutline[];
                                status: number;
                            }) => {
                                if (status === 200) {
                                    request('/api/admin/page/outline', {method: 'POST'}).then(
                                        ({status, data: pageOutlineArr = []}: {
                                            status: number;
                                            data: PageOutline[];
                                        }) => {
                                            if (status === 200) {
                                                let newPageIdOutlineMap: PageIdOutlineMap = {};
                                                for (let i = 0; i < pageOutlineArr.length; i++) {
                                                    const pageOutline = pageOutlineArr[i];
                                                    newPageIdOutlineMap[pageOutline.id] = pageOutline;
                                                }
                                                let pageIdMenuGroupOutlineArrMap: PageIdMenuGroupOutlineArrMap = {};
                                                for (let i = 0; i < menuGroupOutlineArr.length; i++) {
                                                    const menuGroupOutline = menuGroupOutlineArr[i];
                                                    let usedMenuGroupOutlineArr = pageIdMenuGroupOutlineArrMap[menuGroupOutline.admin_page_id];
                                                    if (usedMenuGroupOutlineArr !== undefined) {
                                                        usedMenuGroupOutlineArr[0].span += 1;
                                                        menuGroupOutline.span = 0;
                                                        usedMenuGroupOutlineArr.push(menuGroupOutline);
                                                    } else {
                                                        menuGroupOutline.span = 1;
                                                        pageIdMenuGroupOutlineArrMap[menuGroupOutline.admin_page_id] = [menuGroupOutline];
                                                    }
                                                }
                                                let newMenuGroupOutlineArr: MenuGroupOutline[] = [];
                                                for (let pageId in pageIdMenuGroupOutlineArrMap) {
                                                    newMenuGroupOutlineArr.push(...pageIdMenuGroupOutlineArrMap[pageId]);
                                                }
                                                setPageIdOutlineMap(newPageIdOutlineMap);
                                                setMenuGroupOutlineArr(newMenuGroupOutlineArr);
                                                resolve(newMenuGroupOutlineArr);
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
                        resolve(menuGroupOutlineArr);
                    }
                }
            )
                .then(
                    (nextMenuGroupOutlineArr) => {
                        if (props.visit.id > 0 && props.visit.action === 'update') {
                            request('/api/admin/position/' + props.visit.id, {method: 'POST'}).then(
                                ({status: resStatue, data}) => {
                                    formRef.current?.resetFields();
                                    if (resStatue === 200) {
                                        const {
                                                  status,
                                                  id,
                                                  name,
                                                  weight,
                                                  description,
                                                  admin_department_id,
                                                  admin_menu_group_id_arr
                                              } = data;
                                        if (Boolean(admin_menu_group_id_arr)) {
                                            let newPageIdMenuGroupIdMap: PageIdMenuGroupIdMap = {};
                                            const idArr = admin_menu_group_id_arr as number[];
                                            const arr = nextMenuGroupOutlineArr as MenuGroupOutline[];
                                            for (let i = 0; i < arr.length; i++) {
                                                if (idArr.indexOf(arr[i].id) !== -1) {
                                                    newPageIdMenuGroupIdMap[arr[i].admin_page_id] = arr[i].id;
                                                }
                                            }
                                            setPageIdMenuGroupIdMap(newPageIdMenuGroupIdMap);
                                            console.log('log[ref]: ', newPageIdMenuGroupIdMap);
                                        }
                                        formRef.current?.setFieldsValue({
                                            id,
                                            status,
                                            name,
                                            weight,
                                            description,
                                            admin_department_id
                                        });
                                    }
                                }
                            )
                        }
                    }
                )
        }
    }, [props.visit.id]);
    const pageMenuGroupColumnArr: TableColumnProps<MenuGroupOutline>[] =
              [
                  {
                      title:  '页面名称',
                      render: (_, row) => {
                          return {
                              children: <>{pageIdOutlineMap[row.admin_page_id].name}</>,
                              props:    {
                                  rowSpan: row.span,
                              },
                          };
                      },
                  },
                  {
                      title:  '页面描述',
                      render: (_, row) => {
                          return {
                              children: <>{pageIdOutlineMap[row.admin_page_id].description}</>,
                              props:    {
                                  rowSpan: row.span,
                              },
                          };
                      },
                  },
                  {
                      title:     '功能组名',
                      dataIndex: 'name',
                      render:    (val, row) => (
                          <Checkbox
                              checked={
                                  pageIdMenuGroupIdMap[row.admin_page_id] === row.id
                              }
                              onChange={(e) => {
                                  const newPageIdMenuGroupIdMap = {
                                      ...pageIdMenuGroupIdMap,
                                  };
                                  if (e.target.checked) {
                                      newPageIdMenuGroupIdMap[row.admin_page_id] = row.id;
                                  } else {
                                      delete newPageIdMenuGroupIdMap[row.admin_page_id];
                                  }
                                  console.log(
                                      'log[选]: ',
                                      newPageIdMenuGroupIdMap,
                                  );
                                  setPageIdMenuGroupIdMap(newPageIdMenuGroupIdMap);
                              }}
                          >
                              {val}
                          </Checkbox>
                      ),
                  },
                  {
                      title:     '额外功能描述',
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
                    maxHeight: 557,
                    padding:   0,
                    overflowY: 'auto',
                },
                onCancel:  props.onCancel,
            }}
            onFinish={(value) => {
                let idArr: number[] = [];
                for (const id in pageIdMenuGroupIdMap) {
                    idArr.push(pageIdMenuGroupIdMap[id]);
                }
                return props.onFinish({
                    ...value,
                    admin_menu_group_id_arr: idArr
                });
            }}
        >
            <div style={{display: 'flex'}}>
                <div style={{width: 1100}}>
                    <div>
                        <Table
                            pagination={false}
                            bordered
                            rowKey="id"
                            scroll={{y: 500}}
                            columns={pageMenuGroupColumnArr}
                            dataSource={menuGroupOutlineArr}
                        />
                    </div>
                </div>
                <div style={{width: 480, padding: 24}}>
                    <ProForm.Group label="状态选项">
                        <ProFormSelect
                            required
                            label="岗位启用状态"
                            width={200}
                            name="status"
                            options={[
                                {label: '启用', value: 1},
                                {label: '停用', value: 2},
                                {label: '锁定', value: 3},
                            ]}
                        />
                    </ProForm.Group>
                    <ProForm.Group label="基本信息">
                        <ProFormSelect
                            required
                            label="所属部门"
                            width={200}
                            name="admin_department_id"
                            options={departmentOutlineArr}
                        />
                        <ProFormText
                            required
                            width={200}
                            name="name"
                            label="名称"
                            placeholder="请输入名称"
                        />
                    </ProForm.Group>
                    <ProForm.Group>
                        <ProFormDigit
                            required
                            width={200}
                            name="weight"
                            label="权重"
                            placeholder="请输入权重"
                        />
                    </ProForm.Group>
                    <ProForm.Group>
                        <ProFormTextArea
                            width={432}
                            name="description"
                            label="描述"
                            placeholder="请输入描述"
                        />
                    </ProForm.Group>
                </div>
            </div>
        </ModalForm>
    );
};

export default Detail;

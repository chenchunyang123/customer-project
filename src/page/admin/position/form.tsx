import React, {useEffect, useRef, useState}                                                                      from 'react';
import ProForm, {
    FormInstance,
    ModalForm,
    ProFormDigit,
    ProFormSelect,
    ProFormText, ProFormTextArea,
}                                                                                                                from '@ant-design/pro-form';
import request                                                                                                   from 'umi-request';
import {Checkbox, message, Spin, Table, TableColumnProps}                                                        from 'antd';
import {MenuGroupOutline, PageIdMenuGroupIdMap, PageIdMenuGroupOutlineArrMap, PageIdOutlineMap, ReOption, Visit} from "@/global";

interface Props {
    visit: Visit;
    onCancel: () => void;
    onFinish: (data: any) => Promise<boolean | void>;
}

const Detail: React.FC<Props> = (props) => {
    const formRef = useRef<FormInstance>();
    const [status, setStatus] = useState<number>(0);
    const [pageIdOutlineMap, setPageIdOutlineMap] = useState<PageIdOutlineMap>({});
    const [menuGroupOutlineArr, setMenuGroupOutlineArr] = useState<MenuGroupOutline[]>([]);
    const [pageIdMenuGroupIdMap, setPageIdMenuGroupIdMap] = useState<PageIdMenuGroupIdMap>({});
    const [departmentOutlineArr, setDepartmentOutlineArr] = useState<ReOption[]>([]);
    useEffect(() => {
        if (
            (props.visit.id > 0 && props.visit.action === 'update') ||
            (props.visit.id === 0 && props.visit.action === 'create')
        ) {
            formRef.current?.resetFields();
            setPageIdMenuGroupIdMap({});
            setStatus(0);
            if (
                (props.visit.id > 0 && props.visit.action === 'update') ||
                (props.visit.id === 0 && props.visit.action === 'create')
            ) {
                request('/api/admin/position/' + props.visit.id, {method: 'POST'}).then(
                    ({
                         data,
                         status:                       resStatus,
                         admin_page_outline_arr:       {data: pageOutlineArr},
                         admin_menu_group_outline_arr: {data: menuGroupOutlineArr},
                         admin_department_outline_arr: {data: departmentOutlineArr},
                     }) => {
                        new Promise<MenuGroupOutline[]>(
                            resolve => {
                                if (resStatus > 202) {
                                    message.error('?????????????????????');
                                    return
                                }
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
                        ).then(
                            nextMenuGroupOutlineArr => {
                                let reDepartmentArr: ReOption[] = [];
                                for (let i = 0; i < departmentOutlineArr.length; i++) {
                                    const departmentOutline = departmentOutlineArr[i];
                                    reDepartmentArr.push({
                                        label: departmentOutline.name,
                                        value: departmentOutline.id
                                    });
                                }
                                setDepartmentOutlineArr(reDepartmentArr);
                                if (data) {
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
                                    setStatus(status);
                                    formRef.current?.setFieldsValue({
                                        id,
                                        status,
                                        name,
                                        weight,
                                        description,
                                        admin_department_id
                                    });
                                } else {
                                    setStatus(1);
                                }
                            }
                        )
                    }
                )
            }
        }
    }, [props.visit.id]);
    const pageMenuGroupColumnArr: TableColumnProps<MenuGroupOutline>[] =
              [
                  {
                      title:  '????????????',
                      width:  120,
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
                      title:  '????????????',
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
                      title:     '????????????',
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
                                      'log[???]: ',
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
                      title:     '??????????????????',
                      dataIndex: 'description',
                  },
              ];
    return (
        <ModalForm
            width={480 + 1100}
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
            <Spin spinning={status < 1}>
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
                        <ProForm.Group label="????????????">
                            <ProFormSelect
                                label="??????????????????"
                                width={200}
                                name="status"
                                rules={[
                                    {
                                        required: props.visit.action !== 'create',
                                        message:  '???????????????'
                                    }
                                ]}
                                allowClear={false}
                                disabled={props.visit.id === 0 || status === 1}
                                options={
                                    status === 1 ?
                                    [
                                        {label: '?????????', value: 1}
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
                            <ProFormSelect
                                label="????????????"
                                rules={[
                                    {
                                        required: true,
                                        message:  '?????????????????????'
                                    }
                                ]}
                                width={200}
                                name="admin_department_id"
                                options={departmentOutlineArr}
                            />
                            <ProFormText
                                width={200}
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message:  '?????????????????????'
                                    }
                                ]}
                                label="????????????"
                                placeholder="?????????????????????"
                            />
                        </ProForm.Group>
                        <ProForm.Group>
                            <ProFormDigit
                                rules={[
                                    {
                                        required: true,
                                        message:  '???????????????'
                                    }
                                ]}
                                width={200}
                                name="weight"
                                label="??????"
                                placeholder="???????????????"
                            />
                        </ProForm.Group>
                        <ProForm.Group>
                            <ProFormTextArea
                                width={432}
                                name="description"
                                label="????????????"
                                placeholder="?????????????????????"
                            />
                        </ProForm.Group>
                    </div>
                </div>
            </Spin>
        </ModalForm>
    );
};

export default Detail;

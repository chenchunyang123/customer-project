import React, {useEffect, useRef, useState} from 'react';
import ProForm, {
    FormInstance,
    ModalForm,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,
}                                           from '@ant-design/pro-form';
import request                              from 'umi-request';
import {Cascader, Form, message, Spin}      from 'antd';
import {Visit}                              from '@/global';
import {CascaderOptionType}                 from "antd/es/cascader";
import {initDistrict, loadDistrictNext}     from "@/word/map";
import ReUpload                             from "@/pack/upload";
import used                                 from "@/word/used";
import {UploadFile}                         from "antd/es/upload/interface";
import {useDistrict}                        from "@/word/state";

interface Props {
    visit: Visit;
    onCancel: () => void;
    onFinish: (data: any) => Promise<boolean | void>;
}

const Detail: React.FC<Props> = (props) => {
    const formRef = useRef<FormInstance>();
    const district = useDistrict();
    const [status, setStatus] = useState<number>(0);
    useEffect(() => {
        if (
            (props.visit.id > 0 && props.visit.action === 'update') ||
            (props.visit.id === 0 && props.visit.action === 'create')
        ) {
            formRef.current?.resetFields();
            setStatus(0);
            district.setSelectDistrictOptions([]);
            if (props.visit.id === 0 && props.visit.action === 'create') {
                formRef.current?.setFieldsValue({
                    license:     [],
                    license_any: [],
                });
                setStatus(1);
                new Promise(async resolve => {
                    const mapOptions = await initDistrict([]);
                    district.setDistrictOptions(mapOptions);
                    resolve(null);
                })
            }
            if (props.visit.id > 0 && props.visit.action === 'update') {
                request('/api/tenant/1/' + props.visit.id, {method: 'POST'}).then(
                    async ({status: resStatus, data}) => {
                        formRef.current?.resetFields();
                        if (resStatus === 200) {
                            const {
                                      status,
                                      id,
                                      name,
                                      description,
                                      address,
                                      real_name,
                                      phone,
                                      license,
                                      license_any,
                                      district_id_arr,
                                      district_name
                                  } = data;
                            let districtNames: string[] = district_name.split('/');
                            district.initDistrict(districtNames, district_id_arr);
                            setStatus(status);
                            let licenseItem: UploadFile[] = [];
                            if (license) {
                                licenseItem.push({
                                    uid:    '1',
                                    name:   license,
                                    status: 'done',
                                    url:    used.s3_api + used.s3_prefix_license + license,
                                });
                            }
                            let licenseAnyItem: UploadFile[] = [];
                            if (license_any) {
                                for (let i = 0; i < license_any.length; i++) {
                                    licenseAnyItem.push({
                                        uid:    i.toString(),
                                        name:   license_any[i],
                                        status: 'done',
                                        url:    used.s3_api + used.s3_prefix_license_any + license_any[i],
                                    });
                                }
                            }
                            formRef.current?.setFieldsValue({
                                district:    districtNames,
                                real_name,
                                phone,
                                license:     licenseItem,
                                license_any: licenseAnyItem,
                                id,
                                status,
                                name,
                                address,
                                description,
                            });
                        } else {
                            setStatus(1);
                            message.error('服务器请求出错');
                        }
                    },
                );
            }
        }
    }, [props.visit.id]);
    const checkedDistrict = (options: CascaderOptionType[] | undefined) => {
        loadDistrictNext(options as any).then(() => district.setDistrictOptions([...district.districtOptions]))
    }
    return (
        <ModalForm
            width={480 + 17}
            formRef={formRef}
            title={
                <>
                    租户
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
                    height:    600,
                    overflowY: 'auto'
                },
                onCancel:  props.onCancel,
            }}
            onFinish={(values) => {
                let payload: any = {...values};
                const [districtName, districtIdArr] = district.getFormValues();
                payload['district_name'] = districtName;
                payload['district_id_arr'] = districtIdArr;
                if (payload['license_any'].length < 1) {
                    delete payload['license_any'];
                } else {
                    let licenseAny: string[] = [];
                    for (let i = 0; i < payload['license_any'].length; i++) {
                        licenseAny.push(payload['license_any'][i].name);
                    }
                    payload['license_any'] = licenseAny;
                }
                payload['license'] = payload['license'][0]['name'];
                return props.onFinish(payload);
            }}
        >
            <Spin spinning={status < 1}>
                <ProForm.Group label={'租户资质'}>
                    <Form.Item
                        name={'license'}
                        label={'营业许可证'}
                        rules={[
                            {
                                required: true,
                                message:  '请上传营业许可证'
                            }
                        ]}
                    >
                        <ReUpload
                            prefix={used.s3_prefix_license}
                            uploadProps={{
                                multiple: false,
                                listType: "picture-card",
                                action:   used.s3_sign_license,
                            }}
                        />
                    </Form.Item>
                </ProForm.Group>
                <ProForm.Group>
                    <Form.Item name={'license_any'} required label={'其他许可证'}>
                        <ReUpload
                            prefix={used.s3_prefix_license}
                            uploadProps={{
                                multiple: true,
                                listType: "picture-card",
                                action:   used.s3_sign_license_any,
                            }}
                        />
                    </Form.Item>
                </ProForm.Group>
                <ProForm.Group label="选项">
                    <ProFormSelect
                        width={200}
                        rules={[
                            {
                                required: props.visit.action !== 'create',
                                message:  '请选择状态'
                            }
                        ]}
                        allowClear={false}
                        label="启用状态"
                        name="status"
                        disabled={props.visit.id === 0 || status === 1}
                        options={
                            status === 1 ?
                            [
                                {label: '新数据', value: 1}
                            ] :
                            [
                                {label: '使用中', value: 2},
                                {label: '异常', value: 3},
                                {label: '停用', value: 4},
                            ]
                        }
                    />
                </ProForm.Group>
                <ProForm.Group label="基本信息">
                    <ProFormText
                        width={200}
                        name="real_name"
                        label="所属人真实名称"
                        placeholder="请输入所属人真实名称"
                    />
                    <ProFormText
                        width={200}
                        name="phone"
                        label="管理手机账号"
                        placeholder="请输入管理手机账号"
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormText
                        width={432}
                        name="name"
                        label="租户(公司/企业)名称"
                        placeholder="请输入名称"
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <Form.Item name={'district'} label={'所处市区地址'}>
                        <Cascader
                            onChange={district.onChange}
                            style={{width: 432}}
                            options={district.districtOptions}
                            loadData={checkedDistrict}
                        />
                    </Form.Item>
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormText
                        width={432}
                        name="address"
                        label="详细地址"
                        placeholder="请输入详细地址"
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormTextArea
                        label="租户描述"
                        width={432}
                        placeholder={'请输入租户描述'}
                        name="description"
                    />
                </ProForm.Group>
            </Spin>
        </ModalForm>
    );
};

export default Detail;

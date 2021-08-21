import React, {useEffect, useRef, useState} from 'react';
import ProForm, {
    FormInstance,
    ModalForm,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,
}                                           from '@ant-design/pro-form';
import request                              from 'umi-request';
import {Cascader, Form, message}            from 'antd';
import {Visit}                              from '@/global';
import {CascaderOptionType}                 from "antd/es/cascader";
import {initDistrict, loadDistrictNext}     from "@/word/map";

interface Props {
    visit: Visit;
    onCancel: () => void;
    onFinish: (data: any) => Promise<boolean | void>;
}

const Detail: React.FC<Props> = (props) => {
    const formRef = useRef<FormInstance>();
    const [districtOptions, setDistrictOption] = useState<CascaderOptionType[]>([]);
    const [selectedDistrictOptions, setSelectDistrictOptions] = useState<CascaderOptionType[]>([]);
    const [status, setStatus] = useState<number>(1);
    useEffect(() => {
        if (
            (props.visit.id > 0 && props.visit.action === 'update') ||
            (props.visit.id === 0 && props.visit.action === 'create')
        ) {
            formRef.current?.resetFields();
            setStatus(1);
            setSelectDistrictOptions([]);
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
                                      district_id_arr,
                                      district_name
                                  } = data;
                            let districtNames: string[] = district_name.split('/');
                            let districtDoc: CascaderOptionType = {};
                            let selectedDistrictOptions: CascaderOptionType[] = [];
                            for (let i = 0; i < districtNames.length; i++) {
                                selectedDistrictOptions.push({
                                    id:    district_id_arr[i],
                                    label: districtNames[i],
                                    value: districtNames[i],
                                });
                                districtDoc = {
                                    label:    districtNames[districtNames.length - i - 1],
                                    value:    district_id_arr[districtNames.length - i - 1],
                                    children: [districtDoc]
                                }
                            }
                            setDistrictOption([districtDoc]);
                            setSelectDistrictOptions(selectedDistrictOptions);
                            new Promise(async resolve => {
                                const mapOptions = await initDistrict(district_id_arr);
                                setDistrictOption(mapOptions);
                                resolve(null);
                            })
                            setStatus(status);
                            formRef.current?.setFieldsValue({
                                district: districtNames,
                                real_name,
                                phone,
                                id,
                                status,
                                name,
                                address,
                                description,
                            });
                        } else {
                            message.error('服务器请求出错');
                        }
                    },
                );
            }
        }
    }, [props.visit.id]);
    const checkedDistrict = (options: CascaderOptionType[] | undefined) => {
        loadDistrictNext(options as any).then(() => setDistrictOption([...districtOptions]))
    }
    return (
        <ModalForm
            width={480}
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
                onCancel: props.onCancel,
            }}
            onFinish={(values) => {
                let payload: any = {...values};
                let districtIdArr: number[] = [];
                let districtNames: string = '';
                for (let i = 0; i < selectedDistrictOptions.length; i++) {
                    districtIdArr.push(selectedDistrictOptions[i].id);
                    if (i > 0) {
                        districtNames += '/';
                    }
                    districtNames += selectedDistrictOptions[i].value;
                }
                payload['district_name'] = districtNames;
                payload['district_id_arr'] = districtIdArr;
                return props.onFinish(payload);
            }}
        >
            <ProForm.Group label="选项">
                <ProFormSelect
                    width={200}
                    required
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
                        onChange={(value, selectedOptions) => {
                            setSelectDistrictOptions(selectedOptions as any);
                        }}
                        style={{width: 432}}
                        options={districtOptions}
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
        </ModalForm>
    );
};

export default Detail;

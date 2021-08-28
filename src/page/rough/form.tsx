import React, {useEffect, useRef, useState} from 'react';
import ProForm, {
    FormInstance,
    ModalForm,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,
}                                           from '@ant-design/pro-form';
import request                              from 'umi-request';
import {message, Spin}                      from 'antd';
import {Visit}                              from '@/global';

// rough-auto state-type

interface Props {
    visit: Visit;
    onCancel: () => void;
    onFinish: (data: any) => Promise<boolean | void>;
}

const Form: React.FC<Props> = (props) => {
    const formRef = useRef<FormInstance>();
    const [status, setStatus] = useState<number>(0);
    // rough-auto use-state
    useEffect(() => {
        if (
            (props.visit.id > 0 && props.visit.action === 'update') ||
            (props.visit.id === 0 && props.visit.action === 'create')
        ) {
            formRef.current?.resetFields();
            setStatus(0);
            if (props.visit.id === 0 && props.visit.action === 'create') {
                setStatus(1);
            }
            if (props.visit.id > 0 && props.visit.action === 'update') {
                request('/api/rough/' + props.visit.id, {method: 'POST'}).then(
                    async ({
                               status: resStatus,
                               data,
                               // rough-auto payload-params
                           }) => {
                        // rough-auto payload-tidy
                        if (resStatus === 200) {
                            const {
                                      // rough-auto spread
                                  } = data;
                            setStatus(status);
                            formRef.current?.setFieldsValue({
                                // rough-auto spread
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
    return (
        <ModalForm<any>
            width={480}
            formRef={formRef}
            title={
                <>
                    毛坯
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
                return props.onFinish(payload);
            }}
        >
            <Spin spinning={status < 1}>
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
                        name="text"
                        label="文本输入"
                        placeholder="请输入文本输入"
                    />
                    <ProFormSelect
                        required
                        label="单选"
                        width={200}
                        name="check"
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormTextArea
                        label="租户"
                        width={432}
                        placeholder={'请输入描述'}
                        name="description"
                    />
                </ProForm.Group>
            </Spin>
        </ModalForm>
    );
};

export default Form;

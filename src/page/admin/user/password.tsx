import React, {useRef} from 'react';
import ProForm, {
    FormInstance,
    ModalForm,
    ProFormText,
}                      from '@ant-design/pro-form';
import {Visit}         from '@/global';

interface Props {
    visit: Visit;
    onCancel: () => void;
    onFinish: (data: any) => Promise<boolean | void>;
}

const Password: React.FC<Props> = (props) => {
    const formRef = useRef<FormInstance>();
    return (
        <ModalForm
            width={280}
            formRef={formRef}
            title={<>用户 <em className={'em-id'}>ID: {props.visit.id} </em> 修改密码</>}
            visible={props.visit.id > -1 && props.visit.action === 'password'}
            modalProps={{onCancel: props.onCancel}}
            onFinish={props.onFinish}
        >
            <ProForm.Group>
                <ProFormText.Password
                    width={232}
                    name={'password'}
                    label={'密码'}
                    placeholder={'请输入密码'}
                />
            </ProForm.Group>
            <ProForm.Group>
                <ProFormText.Password
                    width={232}
                    name={'password_re'}
                    label={'确定密码'}
                    placeholder={'请再次确定密码'}
                />
            </ProForm.Group>
        </ModalForm>
    );
};

export default Password;

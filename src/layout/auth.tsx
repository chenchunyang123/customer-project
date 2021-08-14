import React, {useCallback, useContext, useState}              from "react";
import css                                                     from './auth.module.less';
import {message, Tabs, Typography}                             from "antd";
import {Route, Switch}                                         from "react-router-dom";
import ProForm, {ProFormCaptcha, ProFormCheckbox, ProFormText} from "@ant-design/pro-form";
import {BulbTwoTone, LockTwoTone, MobileTwoTone}               from "@ant-design/icons";
import request                                                 from "umi-request";
import {STORE_MENU_OUTLINE}                                    from "@/word/const";
import {UserinfoContext}                                       from "@/word/state";

interface LoginForm {
    phone: string;
    captcha: string;
    password: string;
    remember: boolean;
}

const Login: React.FC = () => {
    const [type, setType] = useState<'password' | 'qr-code'>('password');
    const onTabsChange = () => {
        if (type === 'password') {
            setType('qr-code');
        } else {
            setType('password');
        }
    };
    const [loading, setLoading] = useState(false);
    const ctx = useContext(UserinfoContext);
    const onFinish = useCallback(
        (formData) => {
            setLoading(true);
            return request('/api/login', {data: formData, method: 'POST'}).then(
                ({status, data}) => {
                    if (status === 200) {
                        message.success('登录成功, 即将跳转');
                        console.log(data);
                        const {userinfo, menu_outline} = data;
                        localStorage.setItem(
                            STORE_MENU_OUTLINE,
                            JSON.stringify(menu_outline),
                        );
                        if (status === 200) {
                            ctx.setUserinfo({
                                u_id:            userinfo.id,
                                prv_id:          userinfo.prv_id,
                                phone:           userinfo.phone,
                                avatar:          userinfo.avatar,
                                nick_name:       userinfo.nick_name,
                                enterprise_name: userinfo.enterprise_name,
                            });
                        }
                    }
                    setLoading(false);
                    return status;
                },
            );
        },
        [type],
    );
    return (
        <ProForm<LoginForm>
            onFinish={onFinish}
            initialValues={{
                phone:    '19977775555',
                password: '123456',
                captcha:  'test'
            }}
            submitter={{
                searchConfig:      {
                    submitText: '登录',
                },
                render:            (_, dom) => dom.pop(),
                submitButtonProps: {
                    loading,
                    size:  'large',
                    style: {width: '100%'},
                },
            }}
        >
            <Tabs activeKey={type} centered onChange={onTabsChange}>
                <Tabs.TabPane key="password" tab="密码登陆"/>
                <Tabs.TabPane key="qr-code" tab="扫码登陆"/>
            </Tabs>
            <ProFormText
                fieldProps={{
                    size:   'large',
                    prefix: <MobileTwoTone/>,
                }}
                name="phone"
                placeholder="请输入手机号"
                rules={[
                    {
                        required: true,
                        message:  '请输入手机号!',
                    },
                    {
                        pattern: /^1\d{10}$/,
                        message: '不合法的手机号格式!',
                    },
                ]}
            />
            <ProFormText.Password
                name="password"
                placeholder={'请输入密码'}
                initialValue=""
                fieldProps={{
                    size:         'large',
                    prefix:       <LockTwoTone/>,
                    autoComplete: 'off',
                }}
                rules={[
                    {
                        required: true,
                        message:  '密码是必填项！',
                    },
                ]}
            />
            <ProFormCaptcha
                fieldProps={{
                    size:   'large',
                    prefix: <BulbTwoTone/>,
                }}
                captchaProps={{
                    size: 'large',
                }}
                phoneName="phone"
                name="captcha"
                rules={[
                    {
                        required: true,
                        message:  '请输入验证码',
                    },
                ]}
                placeholder="请输入验证码"
                onGetCaptcha={async (phone) => {
                await request('/api/login/captcha', {
                    method: 'POST',
                    data:   {phone},
                }).then(({status}) => {
                    if (status === 200) {
                        message.success(`手机号 ${phone} 验证码发送成功!`);
                    } else {
                        message.error(`短信发送失败`);
                        throw status;
                    }
                });
                }}
            />
            <div className={css.links}>
                <ProFormCheckbox name="remember" noStyle>
                    30天内自动登陆 ( 默认7天 )
                </ProFormCheckbox>
                <a className={css.right}>忘记密码</a>
            </div>
        </ProForm>
    );
}

const Auth: React.FC = () => {
    return (
        <div className={css.root}>
            <div className={css.left}/>
            <div className={css.right}>
                <div className={css.paper}>
                    <div className={css.head}>
                        <embed className={css.logo} src="/src/assets/logo.svg"/>
                        <Typography.Title className={css.title} level={2}>
                            SAAS 管理平台.
                        </Typography.Title>
                    </div>
                    <div>
                        <Switch>
                            <Route path={'/auth/login'}>
                                <Login/>
                            </Route>
                        </Switch>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Auth;
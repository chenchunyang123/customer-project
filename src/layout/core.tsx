import React, {useContext, useState}                                                                                            from "react";
import {Avatar, Button, Layout, Menu, Tag, Typography}                                                                          from "antd";
import {HomeOutlined, LockOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SolutionOutlined, UserSwitchOutlined} from "@ant-design/icons";
import css                                                                                                                      from './core.module.less';
import used                                                                                                                     from "@/word/used";
import {CanContext, UserinfoContext}                                                                                            from "@/word/state";
import {Route, Switch, useHistory}                                                                                              from "react-router-dom";
import request                                                                                                                  from "umi-request";
import SearchSelect                                                                                                             from "@/pack/searchSelect";
import {HintMenu}                                                                                                               from "@/word/hint";
import AdminUser                                                                                                                from "@/page/admin/user/list";
import AdminDepartment                                                                                                          from "@/page/admin/department/list";
import AdminPosition                                                                                                            from "@/page/admin/position/list";
import Tenant                                                                                                                   from "@/page/tenant/list";

const {SubMenu} = Menu;

const Core: React.FC = () => {
    const [collapsed, setCollapsed] = useState(true);
    const userinfo = useContext(UserinfoContext);
    const can = useContext(CanContext);
    const history = useHistory();
    return (
        <Layout className={css.root}>
            <Layout.Sider collapsible onCollapse={() => setCollapsed(!collapsed)} collapsed={collapsed}>
                <div className={css.tag}>
                    <embed className={css.embed} src="/src/assets/logo.svg"/>
                    {
                        !collapsed &&
                        <Typography.Title className={css.logo} level={4}>
                            . React
                        </Typography.Title>
                    }
                </div>
                <Menu theme="dark" mode="inline">
                    <Menu.Item key={'/home'} icon={<HomeOutlined/>}>
                        首页
                    </Menu.Item>
                    <Menu.Item key={'/tenant'} icon={<UserSwitchOutlined/>} onClick={() => history.push('/tenant')}>
                        租户列表
                    </Menu.Item>
                    <SubMenu key={'/admin'} level={1} icon={<SolutionOutlined/>} title={'后台权限'}>
                        {
                            can['/admin/user'] &&
                            <Menu.Item key={'/admin/user'} onClick={() => history.push('/admin/user')}>
                                管理员用户
                            </Menu.Item>
                        }
                        {
                            can['/admin/department'] &&
                            <Menu.Item key={'/admin/department'} onClick={() => history.push('/admin/department')}>
                                管理员部门
                            </Menu.Item>
                        }
                        {
                            can['/admin/position'] &&
                            <Menu.Item key={'/admin/position'} onClick={() => history.push('/admin/position')}>
                                管理员岗位
                            </Menu.Item>
                        }
                    </SubMenu>
                </Menu>
            </Layout.Sider>
            <Layout className={css.right}>
                <Layout.Header
                    className={css.head}
                    style={{padding: 0}}
                >
                    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                        className: css.trigger,
                        onClick:   () => setCollapsed(!collapsed),
                    })}
                    <div className={css.toolbar}>
                        <div className={css.left}>
                            <Avatar
                                shape={"square"}
                                className={css.avatar}
                                src={
                                    <img
                                        alt={'avatar'}
                                        style={{width: 32, height: 32}}
                                        src={
                                            used.s3_api +
                                            used.s3_prefix_avatar +
                                            userinfo.userinfo.avatar
                                        }
                                    />
                                }
                            />
                            <Typography.Title
                                className={css.title1}
                                level={4}
                            >
                                {userinfo.userinfo.nick_name}
                            </Typography.Title>
                            <Typography.Text
                                className={css.title2}
                            >
                                {userinfo.userinfo.phone}
                            </Typography.Text>
                            <SearchSelect
                                placeholder={'功能搜索 ...'}
                                className={css.search}
                                fetchOptionArr={HintMenu}
                                at={800}
                                onChange={(value) => {
                                    history.push(value.value as string);
                                }}
                            />
                            {
                                userinfo.userinfo.prv_id > 1 &&
                                <Tag color={
                                    userinfo.userinfo.tenant_status === 1 ?
                                    '#52c41a' :
                                    userinfo.userinfo.tenant_status === 2 ?
                                    '#1890ff' :
                                    userinfo.userinfo.tenant_status === 3 ?
                                    '#cd201f' :
                                    '#c8c8c8'
                                } icon={<LockOutlined/>} className={css.tenant_tag}>
                                    {userinfo.userinfo.tenant_name}
                                </Tag>
                            }
                        </div>
                        <div className={css.right}>
                            <Button
                                key="header-logout-button"
                                type="link"
                                danger
                                onClick={async () => {
                                    await request('/api/auth/logout', {
                                        method: 'POST',
                                    });
                                    localStorage.clear();
                                    history.push('/auth/login');
                                }}
                                icon={<LogoutOutlined/>}
                            >
                                退出登陆
                            </Button>
                            <Button key="header-help-button" type="dashed">
                                显示页面帮助信息
                            </Button>,
                        </div>
                    </div>
                </Layout.Header>
                <Layout.Content
                    className={css.main}
                >
                    <Switch>
                        <Route path={'/admin/user'}>
                            <AdminUser/>
                        </Route>
                        <Route path={'/admin/department'}>
                            <AdminDepartment/>
                        </Route>
                        <Route path={'/admin/position'}>
                            <AdminPosition/>
                        </Route>
                        <Route path={'/tenant'}>
                            <Tenant/>
                        </Route>
                    </Switch>
                </Layout.Content>
            </Layout>
        </Layout>
    );
}

export default Core;
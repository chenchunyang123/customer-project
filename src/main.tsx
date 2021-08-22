import React, {useCallback, useEffect, useState}                                           from 'react'
import ReactDOM                                                                            from 'react-dom'
import {BrowserRouter, Route, Switch}                                                      from "react-router-dom";
import Auth                                                                                from "./layout/auth";
import {InitUserinfo, UserinfoType, UserinfoContext, CanContext, MenuOutlineType, CanType} from "./word/state";
import {STORE_MENU_OUTLINE, STORE_USERINFO}                                                from "./word/const";
import 'antd/dist/antd.less';
import './assets/global.less';
import Core                                                                                from "@/layout/core";

const App: React.FC = (props) => {
    const [can, setCan] = useState<CanType>({});
    const [userinfo, setUserinfo] = useState<UserinfoType>(InitUserinfo);
    useEffect(() => {
        const cement = window.localStorage.getItem(STORE_MENU_OUTLINE);
        if (cement !== null) {
            const menuOutlineArr = JSON.parse(cement) as MenuOutlineType[];
            let doc: any = {};
            for (let i = 0; i < menuOutlineArr.length; i++) {
                const menuOutline = menuOutlineArr[i];
                doc[menuOutline.method + menuOutline.path] = true;
            }
            setCan(doc);
        }
    }, [userinfo]);
    useEffect(() => {
        const cement = window.localStorage.getItem(STORE_USERINFO);
        if (cement !== null) {
            setUserinfo(JSON.parse(cement) as UserinfoType);
        }
    }, []);
    const pipeSetUserinfo = useCallback((info: UserinfoType) => {
        // window.location.href = '/';
        window.localStorage.setItem(
            STORE_USERINFO,
            JSON.stringify(info),
        );
        setUserinfo(info);
    }, [userinfo]);
    return (
        <UserinfoContext.Provider
            value={{userinfo, setUserinfo: pipeSetUserinfo}}
        >
            <CanContext.Provider value={can}>
                {props.children}
            </CanContext.Provider>
        </UserinfoContext.Provider>
    );
}

ReactDOM.render(
    <App>
        <BrowserRouter>
            <Switch>
                <Route path={'/auth'}>
                    <Auth/>
                </Route>
                <Route path={'/'}>
                    <Core/>
                </Route>
            </Switch>
        </BrowserRouter>
    </App>,
    document.getElementById('root')
)

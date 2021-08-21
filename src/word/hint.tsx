import request     from "umi-request";
import {ValueType} from "@/pack/searchSelect";
import React       from "react";

export const HintAdminUser = (val: string) => {
    return request('/api/admin/user/hint', {method: 'POST', data: {input: val}})
        .then(
            ({status, data}) => {
                let arr: ValueType[] = [];
                if (status === 200) {
                    for (let i = 0; i < data.length; i++) {
                        const current = data[i];
                        const light = Object.values(current['light'][0]) as string[];
                        arr.push({
                            key:   current['id'],
                            label: (
                                       <div>
                                           <div dangerouslySetInnerHTML={{__html: light[0]}}/>
                                           <div>{current['row']['id']}</div>
                                       </div>
                                   ),
                            value: current['path']
                        });
                    }
                }
                console.log(arr, data);
                return arr;
            }
        )
}

export const HintMenu = (val: string) => {
    return request('/api/auth/hint', {method: 'POST', data: {input: val}})
        .then(
            ({status, data}) => {
                let arr: ValueType[] = [];
                if (status === 200 && Boolean(data)) {
                    for (let i = 0; i < data.length; i++) {
                        const current = data[i];
                        arr.push({
                            key:   current['id'],
                            label: <div dangerouslySetInnerHTML={{__html: current['name']}}/>,
                            value: current['path']
                        });
                    }
                }
                console.log(arr, data);
                return arr;
            }
        )
}
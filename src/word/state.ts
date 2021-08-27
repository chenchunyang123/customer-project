import {createContext, useState} from "react";
import {CascaderOptionType}      from "antd/es/cascader";
import {initDistrict}            from "@/word/map";

export interface UserinfoType {
    u_id: number;
    prv_id: number;

    phone: string;
    avatar: string;
    nick_name: string;
    tenant_status: number;
    tenant_name: string;
}

export const InitUserinfo: UserinfoType = {
    u_id:          0,
    prv_id:        0,
    phone:         ' . . 读取中',
    avatar:        '/default.jpg',
    nick_name:     ' . . 读取中',
    tenant_status: 0,
    tenant_name:   ' . . 读取中',
};

export interface MenuOutlineType {
    method: string;
    path: string;
}

export type CanType = { [track: string]: boolean };

export const UserinfoContext = createContext<{ userinfo: UserinfoType, setUserinfo(userinfo: UserinfoType): void }>(null as any);

export const CanContext = createContext<CanType>(null as any);

export const useDistrict = () => {
    const [districtOptions, setDistrictOptions] = useState<CascaderOptionType[]>([]);
    const [selectedDistrictOptions, setSelectDistrictOptions] = useState<CascaderOptionType[]>([]);
    return {
        districtOptions,
        setDistrictOptions,
        selectedDistrictOptions,
        setSelectDistrictOptions,
        getFormValues: () => {
            let districtIdArr: number[] = [];
            let districtNames: string = '';
            for (let i = 0; i < selectedDistrictOptions.length; i++) {
                districtIdArr.push(selectedDistrictOptions[i].id);
                if (i > 0) {
                    districtNames += '/';
                }
                districtNames += selectedDistrictOptions[i].value;
            }
            return [districtNames, districtIdArr];
        },
        onChange:     (_: any, selectedOptions: any) => {
            setSelectDistrictOptions(selectedOptions);
        },
        initDistrict: (districtNames: string[], districtIdArr: any) => {
            let districtDoc: CascaderOptionType = {};
            let selectedDistrictOptions: CascaderOptionType[] = [];
            for (let i = 0; i < districtNames.length; i++) {
                selectedDistrictOptions.push({
                    id:    districtIdArr[i],
                    label: districtNames[i],
                    value: districtNames[i],
                });
                districtDoc = {
                    label:    districtNames[districtNames.length - i - 1],
                    value:    districtIdArr[districtNames.length - i - 1],
                    children: [districtDoc]
                }
            }
            setDistrictOptions([districtDoc]);
            if (selectedDistrictOptions.length > 0) {
                setSelectDistrictOptions(selectedDistrictOptions);
            }
            new Promise(async resolve => {
                const mapOptions = await initDistrict(districtIdArr);
                setDistrictOptions(mapOptions);
                resolve(null);
            })
        }
    };
}
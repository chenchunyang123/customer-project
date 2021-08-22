import {CascaderOptionType} from "antd/es/cascader";
import request              from "umi-request";
import used                 from "@/word/used";

export const loadDistrictNext = (options: CascaderOptionType[]) => {
    let option = options[options.length - 1];
    option.loading = true;
    return request(used.ali_map + '&keywords=' + options[options.length - 1].id)
        .then(
            ({districts}) => {
                option.loading = false;
                if (districts.length > 0) {
                    districts = districts[0]['districts'];
                    let nextDistrictArr: CascaderOptionType[] = [];
                    for (let x = 0; x < districts.length; x++) {
                        const current = districts[x];
                        const adCode = parseInt(current['ad' + 'code']);
                        if (current['level'] === 'street') {
                            nextDistrictArr.push({
                                id:    adCode,
                                label: current['name'],
                                value: current['name'],
                            });
                        } else {
                            nextDistrictArr.push({
                                id:     adCode,
                                label:  current['name'],
                                value:  current['name'],
                                isLeaf: false
                            });
                        }
                    }
                    option.children = nextDistrictArr;
                } else {
                    option.children = [];
                }
            }
        )
}

export const initDistrict = async (idArr: number[]): Promise<CascaderOptionType[]> => {
    let lastDistrictArr: CascaderOptionType[] = [];
    idArr = [100000, ...idArr];
    let i = idArr.length - 2;
    if (i === -1) {
        i = i + 1;
    }
    for (; i > -1; i--) {
        await request(used.ali_map + '&keywords=' + idArr[i])
            .then(
                ({districts}) => {
                    if (districts.length > 0) {
                        districts = districts[0]['districts'];
                        let nextDistrictArr: CascaderOptionType[] = [];
                        for (let x = 0; x < districts.length; x++) {
                            const current = districts[x];
                            const adCode = parseInt(current['ad' + 'code']);
                            if (adCode === idArr[i + 1]) {
                                nextDistrictArr.push({
                                    id:       adCode,
                                    label:    current['name'],
                                    value:    current['name'],
                                    children: lastDistrictArr
                                });
                            } else {
                                nextDistrictArr.push({
                                    id:     adCode,
                                    isLeaf: false,
                                    label:  current['name'],
                                    value:  current['name'],
                                });
                            }
                        }
                        lastDistrictArr = nextDistrictArr;
                    }
                }
            )
    }
    return lastDistrictArr;
}
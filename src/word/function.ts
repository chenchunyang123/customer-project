import {RequestData}  from '@ant-design/pro-table';
import {TreeDataNode} from 'antd';

export const packReq = (p: Promise<Partial<RequestData<any>>>) => {
    return p.then((res) => {
        if (res.status === 200 && Boolean(res.data)) {
            if (!Boolean(res.data)) {
                res.data = [];
            }
            return {
                data:    res.data,
                success: true,
                total:   res.total,
            };
        }
        return {
            data:    [],
            success: false,
            total:   0,
        };
    });
};

export const packQuery = (params: any, sort: any, ..._: any) => {
    let _params_next: any = {};
    for (let column in params) {
        if (Boolean(params[column])) {
            _params_next[column] = params[column];
        }
    }
    let _params1: any = {
        ..._params_next,
        page:      _params_next.current,
        page_size: _params_next.pageSize,
    };
    if (Object.keys(sort).length > 0) {
        _params1['sort'] = Object.keys(sort)[0];
        _params1['sort_direction'] = Object.values(sort)[0] === 'ascend' ? 'asc' : 'desc';
    }
    delete _params1.current;
    delete _params1.pageSize;
    return _params1;
};

interface Outline {
    id: number;
    p_id: number;
    name: string;
}

function generateTreeTn(outlineArr: Outline[], p_id: number): TreeDataNode[] {
    let tnArr: TreeDataNode[] = [];
    for (let i = 0; i < outlineArr.length; i++) {
        if (outlineArr[i].p_id === p_id) {
            const currentOutline = outlineArr.splice(i--, 1)[0];
            const nextTnArr = generateTreeTn(outlineArr, currentOutline.id);
            tnArr.push({
                title:    currentOutline.name,
                key:      currentOutline.id,
                children: nextTnArr,
            });
        }
    }
    return tnArr;
}

export const packTree = (
    outlineArr: { id: number; p_id: number; name: string }[],
): any => {
    let t1Arr: TreeDataNode[] = [];
    for (let i = 0; i < outlineArr.length; i++) {
        if (!Boolean(outlineArr[i].p_id)) {
            const currentOutline = outlineArr.splice(i--, 1)[0];
            const tnArr = generateTreeTn(outlineArr, currentOutline.id);
            t1Arr.push({
                title:    currentOutline.name,
                key:      currentOutline.id,
                children: tnArr,
            });
        }
    }
    return t1Arr;
};

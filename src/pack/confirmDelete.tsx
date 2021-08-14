import {Popconfirm, message} from 'antd';
import React, {useCallback}  from 'react';
import request               from 'umi-request';

interface Props {
    url: string;
    id_arr: number[];
    onConfirm: () => void;
}

const ConfirmDelete: React.FC<Props> = (props) => {
    const delRoleArr = useCallback(() => {
        request(`/api${props.url}`, {
            method: 'DELETE',
            data:   {id_arr: props.id_arr},
        }).then(({status}: { status: number }) => {
            if (status === 200) {
                message.success('删除成功');
                props.onConfirm();
            } else {
                message.error('删除失败');
            }
        });
    }, [props.id_arr]);
    return (
        <Popconfirm title="请再次确定删除" onConfirm={delRoleArr}>
            <a style={{marginRight: 20}}>删除</a>
        </Popconfirm>
    );
};

export default ConfirmDelete;

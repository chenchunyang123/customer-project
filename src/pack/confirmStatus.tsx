import { Popconfirm } from 'antd';
import React from 'react';

interface Props {
    onConfirm: (value: number) => void;
    optionArr: {
        label: string;
        value: number;
    }[];
}

const ConfirmStatus: React.FC<Props> = (props) => {
    return (
        <>
            {props.optionArr.map((option, index) => (
                <Popconfirm
                    key={index}
                    title="请确定再次变更状态"
                    onConfirm={() => props.onConfirm(option.value)}
                >
                    <a style={{ marginRight: 20 }}>{option.label}</a>
                </Popconfirm>
            ))}
        </>
    );
};

export default ConfirmStatus;

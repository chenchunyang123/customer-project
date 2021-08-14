import {ProColumns} from '@ant-design/pro-table';

export const ColumnStatus: ProColumns = {
    title:     '状态',
    sorter:    true,
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: {
        1: {
            text:   '新数据',
            status: 'Success',
        },
        2: {
            text:   '使用中',
            status: 'Processing',
        },
        3: {
            text:   '异常',
            status: 'Error',
        },
        4: {
            text:   '停用',
            status: 'Default',
        },
    },
};

export const ColumnSTATUS: ProColumns = {
    ...ColumnStatus,
    width: 70,
    fixed: 'left',
};

export const ColumnId: ProColumns = {
    title:     'ID',
    dataIndex: 'id',
    sorter:    true,
    search:    false,
};

export const ColumnID: ProColumns = {
    ...ColumnId,
    width: 60,
    fixed: 'left',
};

const createdAt1: ProColumns = {
    title:        '创建时间',
    sorter:       true,
    dataIndex:    'created_at',
    valueType:    'dateTime',
    filters:      false,
    hideInSearch: true,
    width:        160
};

const createdAt2: ProColumns = {
    title:       '创建时间',
    dataIndex:   'created_at',
    valueType:   'dateRange',
    filters:     true,
    hideInTable: true,
    search:      {
        transform: (value) => ({
            created_at_start: value[0],
            created_at_end:   value[1],
        }),
    },
};

const updatedAt1: ProColumns = {
    title:        '更新时间',
    sorter:       true,
    dataIndex:    'updated_at',
    valueType:    'dateTime',
    filters:      false,
    hideInSearch: true,
    width:        160
};

const updatedAt2: ProColumns = {
    title:       '更新时间',
    dataIndex:   'updated_at',
    valueType:   'dateRange',
    filters:     true,
    hideInTable: true,
    search:      {
        transform: (value) => ({
            updated_at_start: value[0],
            updated_at_end:   value[1],
        }),
    },
};

export const ColumnCreatedAt: ProColumns[] = [{...createdAt1}, createdAt2];
export const ColumnCreatedAT: ProColumns[] = [{...createdAt1, fixed: 'right', width: 140,}, createdAt2];

export const ColumnUpdatedAt: ProColumns[] = [{...updatedAt1}, updatedAt2];
export const ColumnUpdatedAT: ProColumns[] = [{...updatedAt1, fixed: 'right', width: 140,}, updatedAt2];

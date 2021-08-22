import React                 from "react";
import {Upload, UploadProps} from "antd";
import {PlusOutlined}        from "@ant-design/icons";
import {UploadFile}          from "antd/es/upload/interface";
import ImgCrop               from "antd-img-crop";
import {hex_md5}             from '@/word/encrypt.js';
import {RcFile}              from "antd/lib/upload/interface";
import request               from "umi-request";
import used                  from "@/word/used";
import {ulid as uniqueId}    from 'ulid';

interface ReUploadProps {
    crop?: boolean;
    value?: UploadFile[];
    aspect?: number;
    prefix: string;
    onChange?: (fileList: UploadFile[]) => void;
    uploadProps: UploadProps;
    beforeUpload?: (file: RcFile, FileList: RcFile[]) => any;
}

const CustomUpload: React.FC<ReUploadProps> = (props) => {
    return (
        <Upload
            {...props.uploadProps}
            fileList={props.value ? props.value : []}
            beforeUpload={(file: RcFile, fileList: RcFile[]) => {
                if (props.beforeUpload !== undefined) {
                    return props.beforeUpload(file, fileList);
                }
            }}
            onRemove={(file) => {
                props.onChange!((props.value as any[])?.filter(
                    f => {
                        return f.uid !== file.uid
                    }
                ))
            }}
            customRequest={async (options) => {
                const uid = uniqueId();
                const filename = options.filename as string;
                let payload = props.value as UploadFile[];
                const rdr = new FileReader();
                rdr.onload = function () {
                    const uploadPayload = {
                        file_md_5: hex_md5(this.result as string),
                        file_ext:  'jpg'
                    };
                    let newUploadFile: UploadFile = {
                        uid:      uid,
                        name:     uploadPayload.file_md_5 + '.' + uploadPayload.file_ext,
                        fileName: filename,
                        status:   'uploading',
                    };
                    payload.push(newUploadFile);
                    if (props.uploadProps.multiple) {
                        props.onChange!([...payload]);
                    } else {
                        props.onChange!([newUploadFile]);
                    }
                    request(options.action, {method: 'POST', data: uploadPayload})
                        .then(
                            ({status, url}) => {
                                if (status === 200) {
                                    request(url, {method: 'PUT', data: options.file})
                                        .then(
                                            () => {
                                                newUploadFile.url = used.s3_api + props.prefix + uploadPayload.file_md_5 + '.' + uploadPayload.file_ext;
                                                newUploadFile.status = 'done';
                                                if (props.uploadProps.multiple) {
                                                    props.onChange!([...payload]);
                                                } else {
                                                    props.onChange!([newUploadFile]);
                                                }
                                            }
                                        )
                                }
                            }
                        )
                }
                rdr.readAsBinaryString(options.file as Blob);
            }}
        >
            <div>
                <PlusOutlined/>
                <div style={{marginTop: 6}}>点击上传</div>
            </div>
        </Upload>
    );
}

const ReUpload: React.FC<ReUploadProps> = (props) => {
    return (
        <>
            {
                props.crop ?
                <ImgCrop
                    rotate
                    aspect={props.aspect}
                >
                    <CustomUpload {...props} />
                </ImgCrop> :
                <CustomUpload {...props} />
            }
        </>
    );
}

export default ReUpload;
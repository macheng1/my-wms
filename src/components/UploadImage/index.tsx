// src/components/UploadImage.tsx
"use client";

import React from "react";
import { Upload, Typography, Toast, withField } from "@douyinfe/semi-ui-19";
import { IconPlus } from "@douyinfe/semi-icons";

import CommonApi from "@/api/common";

const { Text } = Typography;

const UploadImage = ({
  value = [],
  onChange,
  max = 1,
  prompt = "建议尺寸 800x800",
  uploadText = "上传图片",
}: any) => {
  const handleCustomRequest = async ({
    file,
    onProgress,
    onSuccess,
    onError,
  }: any) => {
    try {
      onProgress({ percent: 30 });
      const res = await CommonApi.uploadFiles(file.fileInstance as File);

      if (res.code === 200 && res.data?.length > 0) {
        onProgress({ percent: 100 });
        // 只保留后端返回的 url，移除本地 blob
        const remoteFileData = res.data[0];
        onSuccess(remoteFileData);
        Toast.success("上传成功");
      } else {
        throw new Error(res.message || "上传失败");
      }
    } catch (error: any) {
      onError();
      Toast.error(error.message || "网络请求错误");
    }
  };

  return (
    <div>
      <Upload
        customRequest={handleCustomRequest}
        fileList={value}
        listType="picture"
        accept="image/*"
        onChange={({ fileList }) => onChange?.(fileList)}
        limit={max}
      >
        {value.length < max && (
          <div
            style={{
              width: 100,
              height: 100,
              border: "1px dashed var(--semi-color-border)",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <IconPlus size="extra-large" />
            <Text size="small" type="secondary">
              {uploadText}
            </Text>
          </div>
        )}
      </Upload>
      <Text type="secondary" size="small">
        {prompt}
      </Text>
    </div>
  );
};

// 💡 核心：使用 withField 包装，直接支持 field 属性，消灭 ts(2322)
export default withField(UploadImage);

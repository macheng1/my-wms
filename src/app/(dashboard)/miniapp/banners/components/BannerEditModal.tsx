"use client";

import { useEffect, useState } from "react";
import { Button, Form, Modal, Toast } from "@douyinfe/semi-ui-19";
import MiniappAPI from "@/api/miniapp";
import type {
  MiniappBanner,
  SaveMiniappBannerParams,
} from "@/api/miniapp/types";
import UploadImage from "@/components/UploadImage";

interface BannerEditModalProps {
  visible: boolean;
  data?: MiniappBanner | null;
  onClose: () => void;
  onSuccess: () => void;
}

const imageToFileList = (url?: string | null) =>
  url
    ? [
        {
          uid: url,
          name: "轮播图",
          status: "success",
          url,
        },
      ]
    : [];

const pickImageUrl = (files: any[] = []) => {
  const file = files[0];
  if (!file) return "";
  return file.url || file.response?.url || "";
};

export default function BannerEditModal({
  visible,
  data,
  onClose,
  onSuccess,
}: BannerEditModalProps) {
  const [formApi, setFormApi] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible || !formApi) return;
    formApi.setValues({
      title: data?.title || "",
      imageUrl: imageToFileList(data?.imageUrl),
      linkType: data?.linkType || "none",
      linkValue: data?.linkValue || "",
      sortOrder: data?.sortOrder || 0,
      isActive: data?.isActive ?? 1,
    });
  }, [visible, data, formApi]);

  const handleSubmit = async () => {
    if (!formApi) return;
    try {
      const values = await formApi.validate();
      const payload: SaveMiniappBannerParams = {
        id: data?.id,
        title: values.title,
        imageUrl: pickImageUrl(values.imageUrl),
        linkType: values.linkType || "none",
        linkValue: values.linkValue || "",
        sortOrder: Number(values.sortOrder || 0),
        isActive: values.isActive ?? 1,
      };

      setSaving(true);
      await MiniappAPI.saveBanner(payload);
      Toast.success("轮播图已保存");
      onSuccess();
    } catch (error: any) {
      if (!error?.errors) {
        Toast.error(error?.message || "保存失败");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={data ? "编辑轮播图" : "新增轮播图"}
      visible={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={saving}
      okText="保存"
      cancelText="取消"
      width={620}
      keepDOM
    >
      <Form
        getFormApi={setFormApi}
        labelPosition="left"
        labelWidth={92}
        style={{ marginTop: 12 }}
      >
        <Form.Input
          field="title"
          label="标题"
          placeholder="请输入轮播图标题"
          rules={[{ required: true, message: "请输入轮播图标题" }]}
        />
        <UploadImage
          field="imageUrl"
          label="轮播图片"
          max={1}
          prompt="建议尺寸 750x300"
          uploadText="上传图片"
          uploadPath="miniapp/banner"
        />
        <Form.Select
          field="linkType"
          label="跳转类型"
          optionList={[
            { label: "不跳转", value: "none" },
            { label: "小程序页面", value: "page" },
            { label: "网页", value: "webview" },
            { label: "信息详情", value: "post" },
            { label: "分类列表", value: "category" },
          ]}
          style={{ width: "100%" }}
        />
        <Form.Input
          field="linkValue"
          label="跳转值"
          placeholder="页面路径、网页地址、信息ID或分类ID"
        />
        <Form.InputNumber
          field="sortOrder"
          label="排序"
          min={0}
          style={{ width: "100%" }}
        />
        <Form.Select
          field="isActive"
          label="状态"
          optionList={[
            { label: "启用", value: 1 },
            { label: "停用", value: 0 },
          ]}
          style={{ width: "100%" }}
        />
      </Form>
    </Modal>
  );
}

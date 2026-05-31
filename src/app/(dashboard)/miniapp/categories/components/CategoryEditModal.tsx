"use client";

import { useEffect, useState } from "react";
import { Button, Form, Modal, Toast } from "@douyinfe/semi-ui-19";
import MiniappAPI from "@/api/miniapp";
import type {
  MiniappCategory,
  SaveMiniappCategoryParams,
} from "@/api/miniapp/types";
import UploadImage from "@/components/UploadImage";

interface CategoryEditModalProps {
  visible: boolean;
  data?: MiniappCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}

const imageToFileList = (url?: string | null) =>
  url
    ? [
        {
          uid: url,
          name: "分类图片",
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

export default function CategoryEditModal({
  visible,
  data,
  onClose,
  onSuccess,
}: CategoryEditModalProps) {
  const [formApi, setFormApi] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible || !formApi) return;
    formApi.setValues({
      name: data?.name || "",
      iconUrl: imageToFileList(data?.iconUrl),
      linkUrl: data?.linkUrl || "",
    });
  }, [visible, data, formApi]);

  const handleSubmit = async () => {
    if (!formApi) return;
    try {
      const values = await formApi.validate();
      const payload: SaveMiniappCategoryParams = {
        id: data?.id,
        name: values.name,
        iconUrl: pickImageUrl(values.iconUrl),
        linkUrl: values.linkUrl || "",
        code: data?.code,
        sortOrder: data?.sortOrder || 0,
        isActive: data?.isActive ?? 1,
        description: data?.description || "",
      };

      setSaving(true);
      await MiniappAPI.saveCategory(payload);
      Toast.success("分类已保存");
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
      title={data ? "编辑分类" : "新增分类"}
      visible={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={saving}
      okText="保存"
      cancelText="取消"
      width={520}
      keepDOM
    >
      <Form
        getFormApi={setFormApi}
        labelPosition="left"
        labelWidth={92}
        style={{ marginTop: 12 }}
      >
        <Form.Input
          field="name"
          label="分类名称"
          placeholder="请输入分类名称"
          rules={[{ required: true, message: "请输入分类名称" }]}
        />
        <UploadImage
          field="iconUrl"
          label="分类图片"
          max={1}
          prompt="建议上传正方形图片"
          uploadText="上传图片"
          uploadPath="miniapp/category"
        />
        <Form.Input
          field="linkUrl"
          label="跳转 URL"
          placeholder="不填则默认进入该分类的信息列表"
        />
      </Form>
    </Modal>
  );
}

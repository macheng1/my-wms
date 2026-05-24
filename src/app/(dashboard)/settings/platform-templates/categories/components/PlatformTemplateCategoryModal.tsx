"use client";

import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Toast } from "@douyinfe/semi-ui-19";
import AdminPlatformAPI from "@/api/adminPlatform";
import type { PlatformTemplateCategory } from "@/api/adminPlatform/types";

interface Props {
  visible: boolean;
  data?: PlatformTemplateCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PlatformTemplateCategoryModal({
  visible,
  data,
  onClose,
  onSuccess,
}: Props) {
  const [formApi, setFormApi] = useState<any>(null);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    AdminPlatformAPI.getTemplateAttributes({ page: 1, pageSize: 200 }).then((res) => {
      setAttributes(
        (res.data?.list || []).map((item) => ({
          label: item.name,
          value: item.id,
        })),
      );
    });
  }, [visible]);

  useEffect(() => {
    if (!visible || !formApi) return;
    if (data?.id) {
      setLoading(true);
      AdminPlatformAPI.getTemplateCategoryDetail(data.id)
        .then((res) => {
          formApi.reset();
          formApi.setValues(res.data || {});
        })
        .finally(() => setLoading(false));
    } else {
      formApi.reset();
      formApi.setValues({ isActive: 1, attributeIds: [] });
    }
  }, [visible, data?.id, formApi]);

  async function handleSubmit(values: any) {
    setLoading(true);
    try {
      await AdminPlatformAPI.saveTemplateCategory({
        ...values,
        id: data?.id,
      });
      Toast.success("保存成功");
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title={data?.id ? "编辑标准类目" : "新增标准类目"}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={560}
      keepDOM
    >
      <Form
        getFormApi={setFormApi}
        onSubmit={handleSubmit}
        labelPosition="top"
        disabled={loading}
        style={{ padding: "8px 20px" }}
      >
        <Form.Input field="code" label="类目编码" placeholder="系统自动生成" disabled />
        <Form.Input
          field="name"
          label="类目名称"
          placeholder="请输入类目名称"
          rules={[{ required: true, message: "请输入类目名称" }]}
        />
        <Form.Select
          field="isActive"
          label="状态"
          optionList={[
            { label: "启用", value: 1 },
            { label: "禁用", value: 0 },
          ]}
          style={{ width: "100%" }}
        />
        <Form.Select
          field="attributeIds"
          label="绑定标准属性"
          optionList={attributes}
          multiple
          style={{ width: "100%" }}
          placeholder="请选择标准属性"
        />
        <Form.Slot>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
            <Button onClick={onClose}>取消</Button>
            <Button htmlType="submit" theme="solid" type="primary" loading={loading}>
              保存
            </Button>
          </div>
        </Form.Slot>
      </Form>
    </Modal>
  );
}

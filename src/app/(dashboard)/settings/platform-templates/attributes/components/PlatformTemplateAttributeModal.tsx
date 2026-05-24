"use client";

import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Space } from "@douyinfe/semi-ui-19";
import AdminPlatformAPI from "@/api/adminPlatform";
import type { PlatformTemplateAttribute } from "@/api/adminPlatform/types";

const typeOptions = [
  { label: "下拉选择", value: "select" },
  { label: "手动输入", value: "input" },
  { label: "数字录入", value: "number" },
];

interface Props {
  visible: boolean;
  data?: PlatformTemplateAttribute | null;
  onCancel: () => void;
  onOk: (values: any) => Promise<void> | void;
  loading?: boolean;
}

export default function PlatformTemplateAttributeModal({
  visible,
  data,
  onCancel,
  onOk,
  loading,
}: Props) {
  const [formApi, setFormApi] = useState<any>(null);
  const [type, setType] = useState("input");
  const [options, setOptions] = useState<Array<{ value: string; sort: number }>>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!visible || !formApi) return;
    if (data?.id) {
      setDetailLoading(true);
      AdminPlatformAPI.getTemplateAttributeDetail(data.id)
        .then((res) => {
          const detail = res.data || {};
          const nextType = detail.type || "input";
          setType(nextType);
          setOptions(
            nextType === "select"
              ? (detail.options || []).map((option) => ({
                  value: option.value,
                  sort: option.sort || 0,
                }))
              : [],
          );
          formApi.reset();
          formApi.setValues(detail);
        })
        .finally(() => setDetailLoading(false));
    } else {
      setType("input");
      setOptions([]);
      formApi.reset();
      formApi.setValues({ type: "input", isActive: 1 });
    }
  }, [visible, data?.id, formApi]);

  function handleTypeChange(value: string) {
    setType(value);
    setOptions(value === "select" ? [{ value: "", sort: 1 }] : []);
  }

  function updateOption(index: number, key: "value" | "sort", value: any) {
    const next = [...options];
    next[index][key] = value;
    setOptions(next);
  }

  async function handleSubmit(values: any) {
    await onOk({
      ...values,
      id: data?.id,
      options: type === "select" ? options : [],
    });
  }

  return (
    <Modal
      title={data?.id ? "编辑标准属性" : "新增标准属性"}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={640}
      keepDOM
    >
      <Form
        getFormApi={setFormApi}
        onSubmit={handleSubmit}
        labelPosition="left"
        labelWidth={100}
        disabled={detailLoading}
      >
        <Form.Input field="code" label="属性编码" placeholder="系统自动生成" disabled />
        <Form.Input
          field="name"
          label="属性名称"
          placeholder="请输入属性名称"
          rules={[{ required: true, message: "请输入属性名称" }]}
        />
        <Form.Select
          field="type"
          label="输入类型"
          optionList={typeOptions}
          style={{ width: "100%" }}
          rules={[{ required: true, message: "请选择输入类型" }]}
          onChange={(value) => handleTypeChange(value as string)}
        />
        <Form.Input field="unit" label="单位" placeholder="请输入单位" />
        <Form.Select
          field="isActive"
          label="状态"
          optionList={[
            { label: "启用", value: 1 },
            { label: "禁用", value: 0 },
          ]}
          style={{ width: "100%" }}
        />
        {type === "select" && (
          <Form.Slot label="选项">
            <Space vertical style={{ width: "100%" }}>
              {options.map((option, index) => (
                <Space key={index}>
                  <Input
                    value={option.value}
                    placeholder="选项值"
                    style={{ width: 180 }}
                    onChange={(value) => updateOption(index, "value", value)}
                  />
                  <Input
                    value={String(option.sort)}
                    placeholder="排序"
                    type="number"
                    style={{ width: 100 }}
                    onChange={(value) => updateOption(index, "sort", Number(value))}
                  />
                  <Button
                    theme="borderless"
                    onClick={() => setOptions([...options, { value: "", sort: options.length + 1 }])}
                  >
                    添加
                  </Button>
                  <Button
                    theme="borderless"
                    type="danger"
                    disabled={options.length <= 1}
                    onClick={() => setOptions(options.filter((_, optionIndex) => optionIndex !== index))}
                  >
                    删除
                  </Button>
                </Space>
              ))}
            </Space>
          </Form.Slot>
        )}
        <Form.Slot>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
            <Button onClick={onCancel}>取消</Button>
            <Button htmlType="submit" theme="solid" type="primary" loading={loading || detailLoading}>
              保存
            </Button>
          </div>
        </Form.Slot>
      </Form>
    </Modal>
  );
}

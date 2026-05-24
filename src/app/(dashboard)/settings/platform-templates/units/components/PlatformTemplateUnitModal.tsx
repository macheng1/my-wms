"use client";

import React, { useEffect, useState } from "react";
import { Form, Modal, Toast } from "@douyinfe/semi-ui-19";
import AdminPlatformAPI from "@/api/adminPlatform";
import { UnitCategory } from "@/api/unit/types";
import type { PlatformTemplateUnit } from "@/api/adminPlatform/types";

const CATEGORY_OPTIONS = [
  { label: "计数单位", value: UnitCategory.COUNT },
  { label: "重量单位", value: UnitCategory.WEIGHT },
  { label: "长度单位", value: UnitCategory.LENGTH },
  { label: "体积单位", value: UnitCategory.VOLUME },
  { label: "面积单位", value: UnitCategory.AREA },
  { label: "时间单位", value: UnitCategory.TIME },
];

interface Props {
  visible: boolean;
  data?: PlatformTemplateUnit | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PlatformTemplateUnitModal({
  visible,
  data,
  onClose,
  onSuccess,
}: Props) {
  const [formApi, setFormApi] = useState<any>(null);

  useEffect(() => {
    if (!visible || !formApi) return;
    if (data?.id) {
      AdminPlatformAPI.getTemplateUnitDetail(data.id)
        .then((res) => {
          formApi.reset();
          formApi.setValues(res.data);
        })
        .catch(() => Toast.error("获取详情失败"));
    } else {
      formApi.reset();
      formApi.setValues({ isActive: 1, sortOrder: 0, baseRatio: 1 });
    }
  }, [visible, data?.id, formApi]);

  async function handleOk() {
    if (!formApi) return;
    const values = await formApi.validate();
    await AdminPlatformAPI.saveTemplateUnit({ ...values, id: data?.id });
    Toast.success("保存成功");
    onSuccess();
  }

  return (
    <Modal
      title={data?.id ? "编辑标准单位" : "新增标准单位"}
      visible={visible}
      onCancel={onClose}
      onOk={handleOk}
      width={600}
      keepDOM
    >
      <Form getFormApi={setFormApi} labelPosition="left" labelWidth={120}>
        <Form.Input
          field="code"
          label="单位编码"
          placeholder="请输入单位编码，如：KG"
          disabled={!!data?.id}
        />
        <Form.Input
          field="name"
          label="单位名称"
          placeholder="请输入单位名称"
          rules={[{ required: true, message: "请输入单位名称" }]}
        />
        <Form.Select
          field="category"
          label="单位分类"
          optionList={CATEGORY_OPTIONS}
          style={{ width: "100%" }}
          rules={[{ required: true, message: "请选择单位分类" }]}
        />
        <Form.InputNumber
          field="baseRatio"
          label="换算比例"
          min={0}
          precision={2}
          style={{ width: "100%" }}
          rules={[{ required: true, message: "请输入换算比例" }]}
        />
        <Form.Input
          field="baseUnitCode"
          label="基准单位编码"
          placeholder="请输入基准单位编码"
          rules={[{ required: true, message: "请输入基准单位编码" }]}
        />
        <Form.Input field="symbol" label="显示符号" placeholder="请输入显示符号" />
        <Form.InputNumber field="sortOrder" label="排序" min={0} style={{ width: "100%" }} />
        <Form.TextArea field="description" label="说明" rows={2} />
        <Form.Switch field="isActive" label="启用状态" />
      </Form>
    </Modal>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Modal, Form, Toast } from "@douyinfe/semi-ui-19";
import UnitApi from "@/api/unit";
import { IUnit } from "@/api/unit/types";

interface UnitEditModalProps {
  visible: boolean;
  data: IUnit | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UnitEditModal({
  visible,
  data,
  onClose,
  onSuccess,
}: UnitEditModalProps) {
  const [formApi, setFormApi] = useState<any>(null);

  // 关闭时清空表单
  const handleClose = () => {
    formApi?.reset();
    onClose();
  };

  // 回显或重置
  useEffect(() => {
    if (visible && formApi) {
      if (data?.id) {
        // 编辑时拉取详情
        UnitApi.getUnitDetail(data.id)
          .then((res) => {
            formApi.reset();
            formApi.setValues(res.data);
          })
          .catch(() => {
            Toast.error("获取详情失败");
          });
      } else {
        // 新增时重置并设置默认值
        formApi.reset();
        formApi.setValues({ isActive: 1, sortOrder: 0 });
      }
    }
  }, [visible, data?.id, formApi]);

  // 提交
  const handleOk = async () => {
    if (!formApi) return;
    try {
      const values = await formApi.validate();
      const payload = { ...values, category: values.category || "COUNT" };

      if (data?.id) {
        await UnitApi.updateUnit({ ...payload, id: data.id } as any);
        Toast.success("更新成功");
      } else {
        await UnitApi.saveUnit(payload as any);
        Toast.success("创建成功");
      }

      onSuccess();
    } catch {
      // 校验失败
    }
  };

  return (
    <Modal
      title={data ? "编辑单位" : "新增单位"}
      visible={visible}
      onCancel={handleClose}
      onOk={handleOk}
      width={600}
    >
      <Form getFormApi={setFormApi} labelPosition="left" labelWidth={120}>
        <Form.Input
          field="code"
          label="单位编码"
          placeholder="请输入单位编码，如：kg"
          disabled={!!data}
          rules={[{ required: true, message: "请输入单位编码" }]}
        />
        <Form.Input
          field="name"
          label="单位名称"
          placeholder="请输入单位名称，如：千克"
          rules={[{ required: true, message: "请输入单位名称" }]}
        />

        <Form.Input
          field="symbol"
          label="显示符号"
          placeholder="请输入显示符号（可选）"
        />
        <Form.InputNumber
          field="sortOrder"
          label="排序"
          placeholder="请输入排序序号"
          min={0}
        />
        <Form.TextArea
          field="description"
          label="说明"
          placeholder="请输入单位说明（可选）"
          rows={2}
        />
        <Form.Switch
          field="isActive"
          label="启用状态"
          extraText="启用后可在系统中使用"
        />
      </Form>
    </Modal>
  );
}

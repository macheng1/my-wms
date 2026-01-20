import React, { useEffect, useState, useCallback } from "react";
import { Modal, Form, Button, Toast } from "@douyinfe/semi-ui-19";
import OptionApi from "@/api/spec";
import AttributeAPI from "@/api/attributes";

const { Section } = Form;

export default function SpecEditModal({
  visible,
  loading = false,
  isEdit = false,
  initialValues = {},
  onCancel,
  onOk,
  attributeId,
  optionId,
}) {
  const [formApi, setFormApi] = useState<any>(null);
  const [attributes, setAttributes] = useState<any[]>([]);

  // 加载属性列表（只加载下拉选择类型的属性）
  const loadAttributes = useCallback(async () => {
    const res = await AttributeAPI.getAttributePage({ page: 1, pageSize: 100 });
    setAttributes(
      (res.data?.list || [])
        .filter((item: any) => item.type === "select")
        .map((item) => ({
          label: item.name,
          value: item.id,
        }))
    );
  }, []);

  // 关闭时清空数据
  const handleClose = () => {
    formApi?.reset();
    onCancel();
  };

  // 数据回显与初始化
  useEffect(() => {
    if (visible && formApi) {
      (async () => {
        // 加载属性列表
        await loadAttributes();

        // 先清空旧数据
        formApi.reset();

        if (isEdit && optionId) {
          // 编辑模式：加载详情
          try {
            const res = await OptionApi.getOptionDetail(optionId);
            const data = res.data || {};
            // 确保 attributeId 被正确设置
            formApi.setValues({
              ...data,
              attributeId: data.attributeId || attributeId,
            });
          } catch {
            Toast.error("获取详情失败");
            // 失败时给空对象
            formApi.setValues({
              isActive: 1,
              sort: 0,
              attributeId: attributeId || undefined,
            });
          }
        } else {
          // 新增模式：设置默认值
          formApi.setValues({
            isActive: 1,
            sort: 0,
            attributeId: attributeId || undefined,
            ...initialValues,
          });
        }
      })();
    }
  }, [visible, isEdit, optionId, attributeId, formApi, initialValues, loadAttributes]);

  return (
    <Modal
      title={isEdit ? "编辑规格" : "新增规格"}
      visible={visible}
      onCancel={handleClose}
      width={600}
      confirmLoading={loading}
      maskClosable={false}
      footer={null}
      keepDOM
    >
      <Form
        getFormApi={setFormApi}
        onSubmit={onOk}
        labelPosition="left"
        labelWidth={100}
      >
        <Form.Select
          field="attributeId"
          label="所属属性"
          optionList={attributes}
          rules={[{ required: true, message: "请选择所属属性" }]}
          disabled={isEdit}
          placeholder="请选择所属属性"
          style={{ width: "100%" }}
        />
        <Form.Input
          field="value"
          label="规格值"
          rules={[{ required: true, message: "请输入规格值" }]}
          placeholder="如：304、12.5"
        />
        <Form.Input
          field="sort"
          label="排序"
          type="number"
          placeholder="数字越小越靠前"
        />
        <Form.Select
          field="isActive"
          label="状态"
          optionList={[
            { label: "启用", value: 1 },
            { label: "禁用", value: 0 },
          ]}
          initValue={1}
          style={{ width: "100%" }}
        />

        <Form.Slot>
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Button onClick={handleClose} style={{ marginRight: 12 }}>
              取消
            </Button>
            <Button type="primary" theme="solid" htmlType="submit">
              保存
            </Button>
          </div>
        </Form.Slot>
      </Form>
    </Modal>
  );
}

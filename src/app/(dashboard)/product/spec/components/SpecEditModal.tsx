import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Toast } from "@douyinfe/semi-ui-19";
import AttributeAPI from "@/api/attributes";
import OptionApi from "@/api/spec";

const { Section } = Form;

export default function SpecEditModal({
  visible,
  loading = false,
  isEdit = false,
  initialValues = {},
  onCancel,
  onOk,
  attributeId,
}) {
  const [formApi, setFormApi] = useState<any>(null);
  const [attributes, setAttributes] = useState([]);

  useEffect(() => {
    AttributeAPI.getAttributePage({ page: 1, pageSize: 100 }).then((res) => {
      setAttributes(
        (res.data?.list || []).map((item) => ({
          label: item.name,
          value: item.id,
        }))
      );
    });
  }, []);

  useEffect(() => {
    if (visible && formApi) {
      if (isEdit) {
        OptionApi.getOptionDetail(attributeId)
          .then((res) => {
            formApi.reset();
            formApi.setValues(res.data || {});
          })
          .catch(() => {
            Toast.error("获取详情失败");
          });
      } else {
        // 新增模式：重置并预设属性 ID (如果有)
        formApi.reset();
        formApi.setValues({
          isActive: 1,
          sort: 0,
          attributeId: attributeId || undefined,
          ...initialValues,
        });
      }
    }
  }, [visible, isEdit, initialValues?.id, formApi, attributeId]);

  const handleSubmit = async (values: any) => {
    await onOk(values);
  };

  return (
    <Modal
      title={isEdit ? "编辑规格" : "新增规格"}
      visible={visible}
      onCancel={onCancel}
      width={600}
      confirmLoading={loading}
      maskClosable={false}
      footer={null}
      keepDOM
    >
      <Form
        getFormApi={setFormApi}
        onSubmit={handleSubmit}
        labelPosition="left"
        labelWidth={100}
      >
        <Form.Select
          field="attributeId"
          label="所属属性"
          optionList={attributes}
          rules={[{ required: true, message: "请选择所属属性" }]}
          initValue={attributeId}
          disabled={!!attributeId}
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
            <Button onClick={onCancel} style={{ marginRight: 12 }}>
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

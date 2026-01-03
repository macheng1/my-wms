import React, { useEffect, useState } from "react";
import { Modal, Form, Button, TextArea, Select } from "@douyinfe/semi-ui-19";
import AttributeAPI from "@/api/attributes";

const { Section } = Form;

export default function SpecBatchModal({
  visible,
  loading = false,
  onCancel,
  onOk,
  attributeId,
}) {
  const [formApi, setFormApi] = useState<any>(null);
  const [attributes, setAttributes] = useState([]);
  const [batchValues, setBatchValues] = useState("");

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

  const handleSubmit = async (values: any) => {
    const arr = batchValues
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);
    if (!values.attributeId) return Modal.error({ content: "请选择所属属性" });
    if (arr.length === 0)
      return Modal.error({ content: "请填写至少一个规格值" });
    await onOk({ attributeId: values.attributeId, values: arr, batch: true });
  };

  return (
    <Modal
      title="批量新增规格"
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
        <Section text="批量录入">
          <Form.Select
            field="attributeId"
            label="所属属性"
            optionList={attributes}
            rules={[{ required: true, message: "请选择所属属性" }]}
            initValue={attributeId}
            disabled={!!attributeId}
            style={{ width: "100%" }}
          />
          <Form.Slot label="规格值批量录入">
            <TextArea
              value={batchValues}
              onChange={setBatchValues}
              rows={8}
              placeholder="每行一个规格值，如：304\n316\n321"
            />
          </Form.Slot>
        </Section>
        <Form.Slot>
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Button onClick={onCancel} style={{ marginRight: 12 }}>
              取消
            </Button>
            <Button
              type="primary"
              theme="solid"
              htmlType="submit"
              loading={loading}
            >
              批量保存
            </Button>
          </div>
        </Form.Slot>
      </Form>
    </Modal>
  );
}

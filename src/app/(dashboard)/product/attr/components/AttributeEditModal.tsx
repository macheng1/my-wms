import React, { useEffect, useState } from "react";
import { Modal, Form, Space, Input, Button } from "@douyinfe/semi-ui-19";
import AttributeAPI from "@/api/attributes";

const { Section } = Form;

const typeOptions = [
  { label: "下拉选择", value: "select" },
  { label: "手动输入", value: "input" },
  { label: "数字录入", value: "number" },
];

export default function AttributeEditModal({
  visible,
  onCancel,
  onOk,
  loading = false,
  initialValues = {},
  isEdit = false,
}) {
  const [formApi, setFormApi] = useState<any>(null);
  const [type, setType] = useState<any>(initialValues.type || "input");
  const [options, setOptions] = useState<
    Array<{ value: string; sort: number }>
  >(initialValues.options || []);
  const [detailLoading, setDetailLoading] = useState(false);

  // 编辑时拉取详情
  useEffect(() => {
    if (visible && isEdit && initialValues?.id) {
      setDetailLoading(true);
      AttributeAPI.getAttributeDetail(initialValues.id)
        .then((res) => {
          const detail = res.data || {};
          setType(detail.type || "input");
          setOptions(Array.isArray(detail.options) ? detail.options : []);
          if (formApi) formApi.setValues(detail);
        })
        .finally(() => setDetailLoading(false));
    } else if (visible) {
      setType(initialValues.type || "input");
      setOptions(
        Array.isArray(initialValues.options) ? initialValues.options : []
      );
      if (formApi) formApi.setValues(initialValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, isEdit, initialValues]);

  // 输入类型切换
  const handleTypeChange = (val: string) => {
    setType(val);
    if (val === "select") {
      setOptions([{ value: "", sort: 1 }]);
    } else {
      setOptions([]);
    }
  };
  // 规格选项操作
  const handleAddOption = () =>
    setOptions([...options, { value: "", sort: options.length + 1 }]);
  const handleOptionChange = (
    idx: number,
    key: "value" | "sort",
    value: any
  ) => {
    const newOptions = [...options];
    newOptions[idx][key] = value;
    setOptions(newOptions);
  };
  const handleRemoveOption = (idx: number) =>
    setOptions(options.filter((_, i) => i !== idx));

  // 提交
  const handleSubmit = async (values: any) => {
    values.options = type === "select" ? options : [];
    onOk(values);
  };

  return (
    <Modal
      title={isEdit ? "编辑属性" : "新增属性"}
      visible={visible}
      onCancel={onCancel}
      width={620}
      keepDOM
      footer={null}
      confirmLoading={loading || detailLoading}
      maskClosable={false}
    >
      <Form
        getFormApi={setFormApi}
        onSubmit={handleSubmit}
        labelPosition="left"
        labelWidth={100}
        disabled={detailLoading}
      >
        <Section text="基础信息">
          <Form.Input
            field="code"
            placeholder="自动生成"
            label="业务编码"
            disabled
          />
          <Form.Input
            field="name"
            label="属性名称"
            placeholder="请输入属性名称"
            rules={[{ required: true, message: "请输入属性名称" }]}
          />

          <Form.Select
            field="type"
            label="输入类型"
            placeholder="请选择输入类型"
            style={{ width: "100%" }}
            rules={[{ required: true, message: "请选择输入类型" }]}
            optionList={typeOptions}
            onChange={(val) => handleTypeChange(val)}
          />
          <Form.Input field="unit" label="单位" placeholder="请输入单位" />
        </Section>
        {type === "select" && (
          <Section text="规格选项配置">
            <Form.Slot label="规格选项">
              <Space vertical style={{ width: "100%" }}>
                {options.map((opt, idx) => {
                  return (
                    <Space key={idx} align="center">
                      <Input
                        value={opt.value}
                        placeholder="规格值"
                        onChange={(v) => handleOptionChange(idx, "value", v)}
                        style={{ width: 160 }}
                      />
                      <Input
                        value={opt.sort}
                        placeholder="排序"
                        type="number"
                        onChange={(v) => {
                          console.log("🚀 ~ AttributeEditModal ~ v:", v);
                          return handleOptionChange(idx, "sort", Number(v));
                        }}
                        style={{ width: 100 }}
                      />

                      <Button onClick={handleAddOption} theme="borderless">
                        添加
                      </Button>
                      <Button
                        type="danger"
                        theme="borderless"
                        onClick={() => handleRemoveOption(idx)}
                      >
                        删除
                      </Button>
                    </Space>
                  );
                })}
              </Space>
            </Form.Slot>
          </Section>
        )}
        <Form.Slot>
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Button onClick={onCancel} style={{ marginRight: 12 }}>
              取消
            </Button>
            <Button
              type="primary"
              theme="solid"
              htmlType="submit"
              loading={loading || detailLoading}
            >
              保存
            </Button>
          </div>
        </Form.Slot>
      </Form>
    </Modal>
  );
}

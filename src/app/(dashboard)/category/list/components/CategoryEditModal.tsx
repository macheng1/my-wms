import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Toast, Space, Typography } from "@douyinfe/semi-ui-19";
import { IconArrowUp, IconArrowDown } from "@douyinfe/semi-icons";
import AttributeAPI from "@/api/attributes";
import CategoryApi from "@/api/category";
import { ICategorySave } from "@/api/category/types";

const { Text } = Typography;

export default function CategoryEditModal({
  visible,
  data,
  onClose,
  onSuccess,
}) {
  const [formApi, setFormApi] = useState<any>(null);
  const [attributes, setAttributes] = useState<any>([]);
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 拉取属性列表
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

  // 回显或重置
  useEffect(() => {
    if (visible && formApi) {
      if (data?.id) {
        // 编辑时拉取详情
        setLoading(true);
        CategoryApi.getCategoryDetail(data.id)
          .then((res) => {
            formApi.reset();
            const detail = res.data || {};
            formApi.setValues(detail);
            setSelectedAttributeIds(detail.attributeIds || []);
          })
          .catch(() => Toast.error("获取详情失败"))
          .finally(() => setLoading(false));
      } else {
        // 新增时重置
        formApi.reset();
        formApi.setValues({ isActive: 1, attributeIds: [], ...data });
        setSelectedAttributeIds(data?.attributeIds || []);
      }
    }
  }, [visible, data, formApi]);

  const handleSubmit = async (values: ICategorySave) => {
    setLoading(true);
    try {
      const payload = { ...values, attributeIds: selectedAttributeIds };
      if (data?.id) {
        await CategoryApi.updateCategory({ ...payload, id: data.id });
      } else {
        await CategoryApi.saveCategory(payload);
      }
      Toast.success("保存成功");
      onSuccess?.();
    } catch {
      Toast.error("保存失败");
    } finally {
      setLoading(false);
    }
  };

  const moveSelectedAttribute = (index: number, offset: -1 | 1) => {
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= selectedAttributeIds.length) return;
    const next = [...selectedAttributeIds];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setSelectedAttributeIds(next);
    formApi?.setValue("attributeIds", next);
  };

  const selectedAttributes = selectedAttributeIds
    .map((id) => attributes.find((item) => item.value === id))
    .filter(Boolean);

  return (
    <Modal
      title={data?.id ? "编辑类目" : "新增类目"}
      visible={visible}
      onCancel={onClose}
      width={520}
      confirmLoading={loading}
      maskClosable={false}
      footer={null}
      keepDOM
    >
      <Form
        getFormApi={setFormApi}
        onSubmit={handleSubmit}
        labelPosition="top"
        disabled={loading}
        style={{ padding: "12px 24px" }}
      >
        <Form.Input
          field="code"
          label="类目编码"
          placeholder="系统自动生成"
          disabled
        />
        <Form.Input
          field="name"
          label="类目名称"
          rules={[{ required: true, message: "请输入类目名称" }]}
          placeholder="如：管材、配件"
        />

        <Form.Select
          field="isActive"
          label="启用状态"
          initValue={1}
          optionList={[
            { label: "启用", value: 1 },
            { label: "禁用", value: 0 },
          ]}
          style={{ width: "100%" }}
        />
        <Form.Select
          field="attributeIds"
          label="绑定属性"
          optionList={attributes}
          multiple
          placeholder="可多选，支持动态扩展"
          style={{ width: "100%" }}
          onChange={(value) => setSelectedAttributeIds(Array.isArray(value) ? value : [])}
        />
        {selectedAttributes.length > 0 && (
          <Form.Slot label="显示顺序">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selectedAttributes.map((attr, index) => (
                <div
                  key={attr.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    border: "1px solid var(--semi-color-border)",
                    borderRadius: 6,
                    background: "var(--semi-color-fill-0)",
                  }}
                >
                  <Text>{index + 1}. {attr.label}</Text>
                  <Space spacing={4}>
                    <Button
                      icon={<IconArrowUp />}
                      theme="borderless"
                      disabled={index === 0}
                      onClick={() => moveSelectedAttribute(index, -1)}
                    />
                    <Button
                      icon={<IconArrowDown />}
                      theme="borderless"
                      disabled={index === selectedAttributes.length - 1}
                      onClick={() => moveSelectedAttribute(index, 1)}
                    />
                  </Space>
                </div>
              ))}
            </div>
          </Form.Slot>
        )}
        <Form.Slot>
          <div
            style={{
              marginTop: 32,
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <Button onClick={onClose} theme="light">
              取消
            </Button>
            <Button
              type="primary"
              theme="solid"
              htmlType="submit"
              loading={loading}
            >
              保存
            </Button>
          </div>
        </Form.Slot>
      </Form>
    </Modal>
  );
}

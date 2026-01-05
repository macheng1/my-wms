import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Toast } from "@douyinfe/semi-ui-19";
import AttributeAPI from "@/api/attributes";
import CategoryApi from "@/api/category";
import { ICategorySave } from "@/api/category/types";

export default function CategoryEditModal({
  visible,
  data,
  onClose,
  onSuccess,
}) {
  const [formApi, setFormApi] = useState<any>(null);
  const [attributes, setAttributes] = useState<any>([]);
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
            formApi.setValues(res.data || {});
          })
          .catch(() => Toast.error("获取详情失败"))
          .finally(() => setLoading(false));
      } else {
        // 新增时重置
        formApi.reset();
        formApi.setValues({ isActive: 1, attributeIds: [], ...data });
      }
    }
  }, [visible, data, formApi]);

  const handleSubmit = async (values: ICategorySave) => {
    setLoading(true);
    try {
      if (data?.id) {
        await CategoryApi.updateCategory({ ...values, id: data.id });
      } else {
        await CategoryApi.saveCategory(values);
      }
      Toast.success("保存成功");
      onSuccess?.();
    } catch {
      Toast.error("保存失败");
    } finally {
      setLoading(false);
    }
  };

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
        />
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

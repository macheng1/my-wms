import { useEffect, useState } from "react";
import { Modal, Form, Toast, InputNumber } from "@douyinfe/semi-ui-19";
import DictAPI from "@/api/dict";

interface DictEditModalProps {
  visible: boolean;
  data: any;
  scope: "platform" | "tenant";
  onClose: () => void;
  onSuccess: () => void;
}

// 字典类型选项
const DICT_TYPE_OPTIONS = [
  { label: "行业分类", value: "INDUSTRY" },
  { label: "计量单位", value: "UNIT" },
  { label: "材质类型", value: "MATERIAL" },
];

export default function DictEditModal({
  visible,
  data,
  scope,
  onClose,
  onSuccess,
}: DictEditModalProps) {
  const [formApi, setFormApi] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!data?.id;

  useEffect(() => {
    if (visible && data) {
      formApi?.setValues({ ...data, scope: data.scope || scope });
    } else if (visible) {
      formApi?.reset();
    }
  }, [visible, data, formApi]);

  const handleSubmit = async () => {
    try {
      const values = await formApi.validate();
      setLoading(true);

      if (isEdit) {
        await DictAPI.updateDict({ ...values, id: data.id, scope });
        Toast.success("更新成功");
      } else {
        await DictAPI.saveDict({ ...values, scope });
        Toast.success("保存成功");
      }
      onSuccess();
    } catch (error: any) {
      if (error?.errors) return; // 表单校验错误
      Toast.error(error?.message || "操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "编辑字典项" : "新增字典项"}
      visible={visible}
      onCancel={onClose}
      width={500}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="保存"
      cancelText="取消"
    >
      <Form
        getFormApi={setFormApi}
        labelPosition="left"
        labelWidth={100}
        style={{ marginTop: 16 }}
      >
        <Form.Select
          field="scope"
          label="归属范围"
          optionList={[
            { label: "平台标准字典", value: "platform" },
            { label: "租户自定义字典", value: "tenant" },
          ]}
          style={{ marginBottom: 12, width: "100%" }}
          disabled
        />
        <Form.Select
          field="type"
          label="字典类型"
          placeholder="请选择字典类型"
          optionList={DICT_TYPE_OPTIONS}
          style={{ marginBottom: 12, width: "100%" }}
          rules={[{ required: true, message: "请选择字典类型" }]}
          disabled={isEdit}
        />
        <Form.Input
          field="label"
          label="展示名称"
          placeholder="请输入展示名称"
          rules={[{ required: true, message: "请输入展示名称" }]}
          style={{ marginBottom: 12 }}
        />
        <Form.Input
          field="value"
          label="实际值"
          placeholder="请输入实际值"
          rules={[{ required: true, message: "请输入实际值" }]}
          style={{ marginBottom: 12 }}
          disabled={isEdit}
        />
        <Form.InputNumber
          field="sort"
          label="排序"
          placeholder="请输入排序值"
          style={{ marginBottom: 12, width: "100%" }}
          initValue={0}
          rules={[{ required: true, message: "请输入排序值" }]}
        />
        {scope === "platform" && (
          <>
            <Form.Select
              field="isSystem"
              label="系统内置"
              initValue={0}
              optionList={[
                { label: "否", value: 0 },
                { label: "是", value: 1 },
              ]}
              style={{ marginBottom: 12, width: "100%" }}
            />
            <Form.Select
              field="allowTenantExtend"
              label="允许租户扩展"
              initValue={0}
              optionList={[
                { label: "否", value: 0 },
                { label: "是", value: 1 },
              ]}
              style={{ marginBottom: 12, width: "100%" }}
            />
            <Form.Select
              field="allowTenantOverride"
              label="允许租户覆盖"
              initValue={0}
              optionList={[
                { label: "否", value: 0 },
                { label: "是", value: 1 },
              ]}
              style={{ marginBottom: 12, width: "100%" }}
            />
          </>
        )}
        {isEdit && (
          <Form.Select
            field="isActive"
            label="状态"
            placeholder="请选择状态"
            optionList={[
              { label: "启用", value: 1 },
              { label: "禁用", value: 0 },
            ]}
            style={{ marginBottom: 12, width: "100%" }}
            rules={[{ required: true, message: "请选择状态" }]}
          />
        )}
      </Form>
    </Modal>
  );
}

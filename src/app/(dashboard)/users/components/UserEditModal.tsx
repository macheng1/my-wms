import React, { useEffect } from "react";
import { Modal, Form, Button } from "@douyinfe/semi-ui-19";
import UserAPI from "@/api/users";

interface UserEditModalProps {
  visible: boolean;
  data: any;
  roleOptions: { label: string; value: string }[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserEditModal({
  visible,
  data,
  roleOptions,
  onClose,
  onSuccess,
}: UserEditModalProps) {
  const [formApi, setFormApi] = React.useState<any>(null);

  useEffect(() => {
    if (visible) {
      if (data?.id) {
        // 通过 getUserDetail 获取详情
        UserAPI.getUserDetail(data.id).then((res: any) => {
          formApi?.setValues(res.data);
        });
      } else {
        formApi?.reset();
      }
    }
  }, [visible, data, formApi]);

  const handleSubmit = async (values: any) => {
    if (data?.id) {
      await UserAPI.updateUser({ ...values, id: data.id });
    } else {
      await UserAPI.saveUser(values);
    }
    onSuccess();
  };

  return (
    <Modal
      title={data ? "编辑员工" : "新增员工"}
      visible={visible}
      onCancel={onClose}
      width={480}
      footer={null}
      keepDOM
    >
      <Form
        getFormApi={setFormApi}
        onSubmit={handleSubmit}
        labelPosition="left"
        labelWidth={100}
      >
        <Form.Input
          field="username"
          label="用户名"
          placeholder="请输入用户名"
          rules={[{ required: true, message: "请输入用户名" }]}
          disabled={!!data?.id}
        />
        {!data?.id && (
          <Form.Input
            field="password"
            label="密码"
            type="password"
            placeholder="请输入密码，至少6位"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少6位" },
            ]}
          />
        )}
        <Form.Input field="nickname" label="昵称" placeholder="请输入昵称" />
        <Form.Select
          field="roleIds"
          label="角色"
          multiple
          placeholder="请选择角色"
          rules={[{ required: true, message: "请选择角色" }]}
          optionList={roleOptions}
        />
        <Form.Select
          field="isActive"
          label="状态"
          placeholder="请选择状态"
          optionList={[
            { label: "启用", value: 1 },
            { label: "禁用", value: 0 },
          ]}
          style={{ width: "100%" }}
          rules={[{ required: true, message: "请选择状态" }]}
          initValue={data?.isActive ?? 1}
        />
        <Form.Slot>
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Button onClick={onClose} style={{ marginRight: 12 }}>
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

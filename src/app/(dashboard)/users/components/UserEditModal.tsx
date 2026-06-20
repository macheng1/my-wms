import React, { useEffect } from "react";
import { Modal, Form, Button } from "@douyinfe/semi-ui-19";
import UserAPI from "@/api/users";
import UploadImage from "@/components/UploadImage";

interface UserEditModalProps {
  visible: boolean;
  data: any;
  roleOptions: { label: string; value: string }[];
  deptOptions: any[];
  postOptions: { label: string; value: string }[];
  onClose: () => void;
  onSuccess: () => void;
}

function flattenDeptOptions(list: any[] = [], level = 0): { label: string; value: string }[] {
  return list.flatMap((item) => {
    const label = `${"　".repeat(level)}${item.label || item.deptName}`;
    const current = [{ label, value: item.value || item.id }];
    return item.children?.length ? current.concat(flattenDeptOptions(item.children, level + 1)) : current;
  });
}

export default function UserEditModal({
  visible,
  data,
  roleOptions,
  deptOptions,
  postOptions,
  onClose,
  onSuccess,
}: UserEditModalProps) {
  const [formApi, setFormApi] = React.useState<any>(null);

  useEffect(() => {
    if (visible) {
      if (data?.id) {
        // 通过 getUserDetail 获取详情
        UserAPI.getUserDetail(data.id).then((res: any) => {
          const detail = res.data;
          // 头像字段转成数组格式
          detail.avatar = detail.avatar ? [{ url: detail.avatar }] : [];
          formApi?.setValues(detail);
        });
      } else {
        formApi?.reset();
      }
    }
  }, [visible, data, formApi]);

  const handleSubmit = async (values: any) => {
    let avatarUrl = "";
    if (Array.isArray(values.avatar) && values.avatar.length > 0) {
      const file = values.avatar[0];
      avatarUrl =
        file.url && !file.response ? file.url : file.response?.url || "";
    }
    values.avatar = avatarUrl;

    const payload = data?.id ? { ...values, id: data.id } : values;
    if (data?.id) {
      await UserAPI.updateUser(payload);
    } else {
      await UserAPI.saveUser(payload);
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
        <UploadImage
          field="avatar"
          label="头像"
          max={1}
          uploadPath="avatar"
          uploadText="上传头像"
          prompt="建议尺寸 40x40"
        />
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
            mode="password"
            placeholder="请输入密码，至少6位"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少6位" },
            ]}
          />
        )}
        <Form.Input field="realName" label="姓名" placeholder="请输入姓名" />
        <Form.Input field="phone" label="手机号" placeholder="请输入手机号" />
        <Form.Input field="email" label="邮箱" placeholder="请输入邮箱" />
        <Form.Select
          field="deptId"
          label="部门"
          placeholder="请选择部门"
          optionList={flattenDeptOptions(deptOptions)}
          style={{ width: "100%" }}
        />
        <Form.Select
          field="postId"
          label="岗位"
          placeholder="请选择岗位"
          optionList={postOptions}
          style={{ width: "100%" }}
        />
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

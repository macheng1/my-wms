import React, { useEffect, useMemo, useState } from "react";
import { Button, Form, Modal } from "@douyinfe/semi-ui-19";
import AdminPlatformAPI from "@/api/adminPlatform";
import { PlatformRole, PlatformUser } from "@/api/adminPlatform/types";
import UploadImage from "@/components/UploadImage";

interface PlatformUserEditModalProps {
  visible: boolean;
  data: PlatformUser | null;
  defaultDeptId?: string | number | null;
  roleOptions: { label: string; value: string | number }[];
  deptOptions: any[];
  postOptions: { label: string; value: string | number }[];
  onClose: () => void;
  onSuccess: () => void;
}

function flattenDeptOptions(
  list: any[] = [],
  level = 0,
): { label: string; value: string | number }[] {
  return list.flatMap((item) => {
    const current = [
      {
        label: `${"　".repeat(level)}${item.label || item.deptName}`,
        value: item.value || item.id,
      },
    ];
    return item.children?.length
      ? current.concat(flattenDeptOptions(item.children, level + 1))
      : current;
  });
}

export default function PlatformUserEditModal({
  visible,
  data,
  defaultDeptId,
  roleOptions,
  deptOptions,
  postOptions,
  onClose,
  onSuccess,
}: PlatformUserEditModalProps) {
  const [formApi, setFormApi] = useState<any>(null);
  const deptSelectOptions = useMemo(
    () => flattenDeptOptions(deptOptions),
    [deptOptions],
  );

  useEffect(() => {
    if (!visible || !formApi) return;

    if (data?.id) {
      AdminPlatformAPI.getUserDetail(data.id).then((res) => {
        const detail = res.data || {};
        formApi.setValues({
          ...detail,
          avatar: detail.avatar ? [{ url: detail.avatar }] : [],
          roleIds:
            detail.roleIds ||
            detail.roles?.map((role: PlatformRole) => role.id) ||
            [],
          password: "",
        });
      });
      return;
    }

    formApi.reset();
    formApi.setValues({ deptId: defaultDeptId, isActive: 1, roleIds: [] });
  }, [visible, data, defaultDeptId, formApi]);

  const handleSubmit = async (values: any) => {
    let avatarUrl = "";
    if (Array.isArray(values.avatar) && values.avatar.length > 0) {
      const file = values.avatar[0];
      avatarUrl = file.url && !file.response ? file.url : file.response?.url || "";
    }

    await AdminPlatformAPI.saveUser({
      ...values,
      avatar: avatarUrl,
      id: data?.id,
      password: values.password || undefined,
    });
    onSuccess();
  };

  return (
    <Modal
      title={data ? "编辑平台用户" : "创建平台用户"}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={520}
      keepDOM
    >
      <Form
        getFormApi={setFormApi}
        onSubmit={handleSubmit}
        labelPosition="left"
        labelWidth={96}
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
          label="账号"
          placeholder="请输入账号"
          rules={[{ required: true, message: "请输入账号" }]}
          disabled={!!data?.id}
        />
        {!data?.id && (
          <Form.Input
            field="password"
            label="初始密码"
            mode="password"
            placeholder="请输入初始密码，至少6位"
            rules={[
              { required: true, message: "请输入初始密码" },
              { min: 6, message: "密码至少6位" },
            ]}
          />
        )}
        {data?.id && (
          <Form.Input
            field="password"
            label="新密码"
            mode="password"
            placeholder="不填则不修改密码"
            rules={[{ min: 6, message: "密码至少6位" }]}
          />
        )}
        <Form.Input field="realName" label="姓名" placeholder="请输入姓名" />
        <Form.Input field="phone" label="手机号" placeholder="请输入手机号" />
        <Form.Input field="email" label="邮箱" placeholder="请输入邮箱" />
        <Form.Select
          field="deptId"
          label="平台部门"
          placeholder="请选择平台部门"
          optionList={deptSelectOptions}
          style={{ width: "100%" }}
        />
        <Form.Select
          field="postId"
          label="平台岗位"
          placeholder="请选择平台岗位"
          optionList={postOptions}
          style={{ width: "100%" }}
        />
        <Form.Select
          field="roleIds"
          label="平台角色"
          multiple
          placeholder="请选择平台角色"
          rules={[{ required: true, message: "请选择平台角色" }]}
          optionList={roleOptions}
          style={{ width: "100%" }}
        />
        <Form.Select
          field="isActive"
          label="状态"
          placeholder="请选择状态"
          optionList={[
            { label: "启用", value: 1 },
            { label: "禁用", value: 0 },
          ]}
          rules={[{ required: true, message: "请选择状态" }]}
          initValue={data?.isActive ?? 1}
          style={{ width: "100%" }}
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

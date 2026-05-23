"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Modal,
  Space,
  Table,
  Tag,
  Toast,
  Typography,
} from "@douyinfe/semi-ui-19";
import { IconEdit2, IconPlus, IconPlay, IconPause } from "@douyinfe/semi-icons";
import AdminPlatformAPI from "@/api/adminPlatform";
import { PlatformRole, PlatformUser } from "@/api/adminPlatform/types";
import DeptAPI from "@/api/dept";
import PostAPI from "@/api/post";

const { Title } = Typography;
const { Section } = Form;

export default function PlatformUsersPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [deptOptions, setDeptOptions] = useState<any[]>([]);
  const [postOptions, setPostOptions] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<PlatformUser | null>(null);
  const [formApi, setFormApi] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userRes, roleRes, deptRes, postRes] = await Promise.all([
        AdminPlatformAPI.getUsers({ page: 1, pageSize: 100 }),
        AdminPlatformAPI.getRoles(),
        DeptAPI.getOptions(),
        PostAPI.getOptions(),
      ]);
      setUsers(userRes.data?.list || []);
      setRoles(roleRes.data || []);
      setDeptOptions(deptRes.data || []);
      setPostOptions(
        (postRes.data || []).map((item: any) => ({
          label: item.label || item.postName,
          value: item.value || item.id,
        })),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!visible || !formApi) return;

    if (currentUser?.id) {
      AdminPlatformAPI.getUserDetail(currentUser.id).then((res) => {
        formApi.setValues({
          ...res.data,
          password: "",
        });
      });
    } else {
      formApi.reset();
      formApi.setValues({ isActive: 1, roleIds: [] });
    }
  }, [visible, currentUser, formApi]);

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        label: role.name,
        value: role.id,
      })),
    [roles],
  );

  const flatDeptOptions = useMemo(() => {
    const walk = (list: any[] = [], level = 0): any[] =>
      list.flatMap((item) => {
        const current = [{
          label: `${"　".repeat(level)}${item.label || item.deptName}`,
          value: item.value || item.id,
        }];
        return item.children?.length ? current.concat(walk(item.children, level + 1)) : current;
      });
    return walk(deptOptions);
  }, [deptOptions]);

  const handleSave = async (values: any) => {
    await AdminPlatformAPI.saveUser({
      ...values,
      id: currentUser?.id,
      password: values.password || undefined,
    });
    Toast.success("保存成功");
    setVisible(false);
    setCurrentUser(null);
    loadData();
  };

  const handleToggleStatus = (record: PlatformUser) => {
    const nextStatus = record.isActive === 1 ? 0 : 1;
    const actionText = nextStatus === 1 ? "启用" : "禁用";
    Modal.confirm({
      title: `确认${actionText}平台用户`,
      content: `确定要${actionText}「${record.username}」吗？`,
      onOk: async () => {
        await AdminPlatformAPI.updateUserStatus(record.id, nextStatus);
        Toast.success(`${actionText}成功`);
        loadData();
      },
    });
  };

  return (
    <div style={{ padding: 4 }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title heading={5} style={{ margin: 0 }}>
          平台用户
        </Title>
        <Button
          icon={<IconPlus />}
          theme="solid"
          onClick={() => {
            setCurrentUser(null);
            setVisible(true);
          }}
        >
          创建平台用户
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={users}
        pagination={false}
        columns={[
          { title: "账号", dataIndex: "username" },
          {
            title: "姓名",
            dataIndex: "realName",
            render: (text) => text || "-",
          },
          {
            title: "角色",
            dataIndex: "roleNames",
            render: (items) =>
              Array.isArray(items) && items.length > 0 ? items.join(", ") : "-",
          },
          {
            title: "部门",
            dataIndex: "deptName",
            render: (text) => text || "-",
          },
          {
            title: "岗位",
            dataIndex: "postName",
            render: (text) => text || "-",
          },
          {
            title: "状态",
            dataIndex: "isActive",
            render: (value) => (
              <Tag color={value === 1 ? "green" : "grey"}>
                {value === 1 ? "启用" : "禁用"}
              </Tag>
            ),
          },
          {
            title: "操作",
            dataIndex: "option",
            render: (_, record) => (
              <Space>
                <Button
                  icon={<IconEdit2 />}
                  theme="light"
                  onClick={() => {
                    setCurrentUser(record);
                    setVisible(true);
                  }}
                >
                  编辑
                </Button>
                <Button
                  icon={record.isActive === 1 ? <IconPause /> : <IconPlay />}
                  theme="light"
                  type={record.isActive === 1 ? "warning" : "primary"}
                  onClick={() => handleToggleStatus(record)}
                >
                  {record.isActive === 1 ? "禁用" : "启用"}
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={currentUser ? "编辑平台用户" : "创建平台用户"}
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={640}
        keepDOM
      >
        <Form
          getFormApi={setFormApi}
          onSubmit={handleSave}
          labelPosition="left"
          labelWidth={100}
        >
          <Section text="基础信息">
            <Form.Input
              field="username"
              label="账号"
              rules={[{ required: true, message: "请输入账号" }]}
            />
            <Form.Input field="realName" label="姓名" />
            <Form.Input field="phone" label="手机号" />
            <Form.Input field="email" label="邮箱" />
            <Form.Select
              field="deptId"
              label="平台部门"
              optionList={flatDeptOptions}
              placeholder="请选择平台部门"
              style={{ width: "100%" }}
            />
            <Form.Select
              field="postId"
              label="平台岗位"
              optionList={postOptions}
              placeholder="请选择平台岗位"
              style={{ width: "100%" }}
            />
            <Form.Input
              field="password"
              label="密码"
              mode="password"
              placeholder={currentUser ? "不填则不修改密码" : "请输入初始密码"}
              rules={
                currentUser
                  ? []
                  : [{ required: true, message: "请输入初始密码" }]
              }
            />
            <Form.Select
              field="roleIds"
              label="平台角色"
              multiple
              optionList={roleOptions}
              placeholder="请选择平台角色"
              style={{ width: "100%" }}
            />
            <Form.Select
              field="isActive"
              label="是否启用"
              initValue={1}
              style={{ width: 120 }}
            >
              <Form.Select.Option value={1}>启用</Form.Select.Option>
              <Form.Select.Option value={0}>禁用</Form.Select.Option>
            </Form.Select>
          </Section>
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Button onClick={() => setVisible(false)} style={{ marginRight: 12 }}>
              取消
            </Button>
            <Button type="primary" theme="solid" htmlType="submit">
              保存
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

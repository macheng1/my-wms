"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Modal, Space, Tag, Toast } from "@douyinfe/semi-ui-19";
import { IconDelete, IconEdit2, IconKey, IconPause, IconPlay } from "@douyinfe/semi-icons";
import AdminPlatformAPI from "@/api/adminPlatform";
import { PlatformRole, PlatformUser } from "@/api/adminPlatform/types";
import DeptAPI from "@/api/dept";
import PostAPI from "@/api/post";
import { ProColumnType, ProDataTableRef } from "@/components/ProDataTable";
import CommonImage from "@/components/CommonImage";
import ResetPasswordModal from "@/app/(dashboard)/users/components/ResetPasswordModal";
import PlatformUserEditModal from "./components/PlatformUserEditModal";
import PlatformUserLayout, {
  DeptTreeNode,
} from "./components/PlatformUserLayout";

const ALL_DEPT_KEY = "__all__";

const toDeptTree = (list: any[] = []): DeptTreeNode[] =>
  list.map((item) => ({
    label: item.label || item.deptName,
    key: String(item.value || item.id),
    value: String(item.value || item.id),
    children: item.children?.length ? toDeptTree(item.children) : undefined,
  }));

const findDeptLabel = (nodes: DeptTreeNode[], key: string): string => {
  for (const node of nodes) {
    if (node.key === key) return node.label;
    if (node.children?.length) {
      const childLabel = findDeptLabel(node.children, key);
      if (childLabel) return childLabel;
    }
  }
  return "";
};

export default function PlatformUsersPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const mountedRef = useRef(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [resetPwdModal, setResetPwdModal] = useState({
    visible: false,
    userId: "",
    username: "",
  });
  const [currentUser, setCurrentUser] = useState<PlatformUser | null>(null);
  const [selectedDeptKey, setSelectedDeptKey] = useState(ALL_DEPT_KEY);
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [deptOptions, setDeptOptions] = useState<any[]>([]);
  const [postOptions, setPostOptions] = useState<
    { label: string; value: string | number }[]
  >([]);

  useEffect(() => {
    Promise.all([
      AdminPlatformAPI.getRoles(),
      DeptAPI.getOptions(),
      PostAPI.getOptions(),
    ]).then(([roleRes, deptRes, postRes]) => {
      setRoles(roleRes.data || []);
      setDeptOptions(deptRes.data || []);
      setPostOptions(
        (postRes.data || []).map((item: any) => ({
          label: item.label || item.postName,
          value: item.value || item.id,
        })),
      );
    });
  }, []);

  const deptTreeData = useMemo(
    () => [
      {
        label: "全部部门",
        key: ALL_DEPT_KEY,
        value: ALL_DEPT_KEY,
        children: toDeptTree(deptOptions),
      },
    ],
    [deptOptions],
  );

  const selectedDeptId =
    selectedDeptKey === ALL_DEPT_KEY ? undefined : selectedDeptKey;

  const selectedDeptName =
    selectedDeptKey === ALL_DEPT_KEY
      ? "全部部门"
      : findDeptLabel(deptTreeData, selectedDeptKey) || "已选部门";

  const loadPlatformUsers = useCallback(async (params: any) => {
    if (!selectedDeptId) {
      return AdminPlatformAPI.getUsers(params);
    }

    const res = await AdminPlatformAPI.getUsers({
      ...params,
      deptId: selectedDeptId,
    });
    const list = res.data?.list || [];
    const filteredList = list.filter(
      (user) => String(user.deptId || "") === String(selectedDeptId),
    );

    return {
      ...res,
      data: {
        ...(res.data || {}),
        list: filteredList,
        total: filteredList.length,
      },
    };
  }, [selectedDeptId]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    tableRef.current?.reload(true);
  }, [selectedDeptId]);

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        label: role.name,
        value: role.id,
      })),
    [roles],
  );

  const handleResetPassword = async (newPassword: string) => {
    await AdminPlatformAPI.resetUserPassword({
      userId: resetPwdModal.userId,
      newPassword,
    });
    setResetPwdModal({ visible: false, userId: "", username: "" });
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
        tableRef.current?.reload();
      },
    });
  };

  const handleDelete = (record: PlatformUser) => {
    Modal.confirm({
      title: "确认删除平台用户",
      content: `确定要删除「${record.username}」吗？删除后该账号将无法登录。`,
      onOk: async () => {
        await AdminPlatformAPI.deleteUser(record.id);
        Toast.success("删除成功");
        tableRef.current?.reload();
      },
    });
  };

  const columns: ProColumnType<PlatformUser>[] = [
    {
      title: "头像",
      dataIndex: "avatar",
      hideInSearch: true,
      width: 72,
      render: (_, record) => (
        <CommonImage
          src={record.avatar}
          size={40}
          radius={20}
          alt="avatar"
          preview={false}
          fallbackText="-"
        />
      ),
    },
    { title: "账号", dataIndex: "username", valueType: "text" },
    {
      title: "姓名",
      dataIndex: "realName",
      valueType: "text",
      hideInSearch: true,
      render: (text) => text || "-",
    },
    {
      title: "手机号",
      dataIndex: "phone",
      valueType: "text",
      hideInSearch: true,
      render: (text) => text || "-",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      valueType: "text",
      hideInSearch: true,
      render: (text) => text || "-",
    },
    {
      title: "部门",
      dataIndex: "deptName",
      hideInSearch: true,
      render: (text) => text || "-",
    },
    {
      title: "岗位",
      dataIndex: "postName",
      hideInSearch: true,
      render: (text) => text || "-",
    },
    {
      title: "角色",
      dataIndex: "roleNames",
      hideInSearch: true,
      render: (items) =>
        Array.isArray(items) && items.length > 0 ? items.join(", ") : "-",
    },
    {
      title: "状态",
      dataIndex: "isActive",
      valueType: "select",
      valueEnum: {
        1: { text: "启用", color: "green" },
        0: { text: "禁用", color: "grey" },
      },
      fieldProps: {
        optionList: [
          { label: "启用", value: 1 },
          { label: "禁用", value: 0 },
        ],
      },
      render: (value) => (
        <Tag color={value === 1 ? "green" : "grey"}>
          {value === 1 ? "启用" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "操作",
      dataIndex: "option",
      hideInSearch: true,
      fixed: "right",
      width: 380,
      render: (_, record) => (
        <Space>
          <Button
            icon={<IconEdit2 />}
            theme="light"
            onClick={() => {
              setCurrentUser(record);
              setIsModalVisible(true);
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
          <Button
            icon={<IconKey />}
            theme="light"
            type="warning"
            onClick={() =>
              setResetPwdModal({
                visible: true,
                userId: String(record.id),
                username: record.username || record.realName || "",
              })
            }
          >
            重置密码
          </Button>
          <Button
            icon={<IconDelete />}
            theme="light"
            type="danger"
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PlatformUserLayout
        tableRef={tableRef}
        deptTreeData={deptTreeData}
        selectedDeptKey={selectedDeptKey}
        selectedDeptName={selectedDeptName}
        columns={columns}
        api={loadPlatformUsers}
        onSelectDept={(key) => setSelectedDeptKey(key || ALL_DEPT_KEY)}
        onRefreshUsers={() => tableRef.current?.reload()}
        onCreateUser={() => {
          setCurrentUser(null);
          setIsModalVisible(true);
        }}
      />

      <PlatformUserEditModal
        visible={isModalVisible}
        data={currentUser}
        defaultDeptId={selectedDeptId}
        roleOptions={roleOptions}
        deptOptions={deptOptions}
        postOptions={postOptions}
        onClose={() => setIsModalVisible(false)}
        onSuccess={() => {
          Toast.success("保存成功");
          setIsModalVisible(false);
          setCurrentUser(null);
          tableRef.current?.reload();
        }}
      />
      <ResetPasswordModal
        visible={resetPwdModal.visible}
        userId={resetPwdModal.userId}
        username={resetPwdModal.username}
        onOk={handleResetPassword}
        onCancel={() => setResetPwdModal({ visible: false, userId: "", username: "" })}
      />
    </>
  );
}

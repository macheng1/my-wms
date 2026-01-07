"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button, Modal, Toast, Space } from "@douyinfe/semi-ui-19";
import { IconPlus, IconEdit2, IconDelete } from "@douyinfe/semi-icons";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import UserAPI from "@/api/users";
import RoleAPI from "@/api/role";
import UserEditModal from "./components/UserEditModal";
import ResetPasswordModal from "./components/ResetPasswordModal";

export default function UserListPage() {
  const [resetPwdModal, setResetPwdModal] = useState({
    visible: false,
    userId: "",
    username: "",
  });
  const tableRef = useRef<ProDataTableRef>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roleOptions, setRoleOptions] = useState<any[]>([]);

  // 拉取角色下拉
  useEffect(() => {
    RoleAPI.selectRoleList().then((res: any) => {
      const validRoles = (res.data || [])
        .filter((item: any) => {
          // 只保留有 name 且 id 为数字或字符串的角色
          return (
            item &&
            typeof item.name === "string" &&
            item.name.trim() !== "" &&
            (typeof item.id === "string" || typeof item.id === "number") &&
            // 排除纯数字但 name 不是角色名的异常项
            isNaN(Number(item.name))
          );
        })
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      setRoleOptions(
        validRoles.map((item: any) => ({
          label: item.name,
          value: item.id,
        }))
      );
    });
  }, []);

  // 表格列
  const columns: ProColumnType<any>[] = [
    { title: "用户名", dataIndex: "username", valueType: "text" },

    {
      title: "状态",
      dataIndex: "isActive",
      valueType: "select",
      valueEnum: {
        1: { text: "启用", color: "green" },
        0: { text: "禁用", color: "grey" },
      },
      render: (text, record) => {
        const val =
          typeof record.isActive === "boolean"
            ? record.isActive
              ? 1
              : 0
            : record.isActive;
        return val === 1 ? "启用" : "禁用";
      },
    },
    {
      title: "角色",
      dataIndex: "roleNames",
      valueType: "text",
      render: (_, record) => (record.roleNames || []).join(", "),
      hideInSearch: true,
    },
    {
      title: "操作",
      dataIndex: "option",
      hideInSearch: true,
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
            icon={<IconDelete />}
            theme="light"
            type="danger"
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
          <Button
            theme="light"
            type="warning"
            onClick={() =>
              setResetPwdModal({
                visible: true,
                userId: record.id,
                username:
                  record.username || record.nickname || record.realName || "",
              })
            }
          >
            重置密码
          </Button>
        </Space>
      ),
    },
  ];

  // 删除
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "确定要删除该员工吗？",
      onOk: async () => {
        await UserAPI.deleteUser(id);
        Toast.success("删除成功");
        tableRef.current?.reload();
      },
    });
  };

  // 重置密码API调用
  const handleResetPwdOk = async (newPassword: string) => {
    await UserAPI.resetPassword({ userId: resetPwdModal.userId, newPassword });
    setResetPwdModal({ ...resetPwdModal, visible: false });
  };

  return (
    <div style={{ padding: 4 }}>
      <ProDataTable
        ref={tableRef}
        title="员工管理"
        api={UserAPI.getUserPage}
        columns={columns}
        toolBarRender={() => (
          <Button
            icon={<IconPlus />}
            theme="solid"
            onClick={() => {
              setCurrentUser(null);
              setIsModalVisible(true);
            }}
          >
            新增员工
          </Button>
        )}
      />
      <UserEditModal
        visible={isModalVisible}
        data={currentUser}
        roleOptions={roleOptions}
        onClose={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          tableRef.current?.reload();
        }}
      />
      <ResetPasswordModal
        visible={resetPwdModal.visible}
        userId={resetPwdModal.userId}
        username={resetPwdModal.username}
        onOk={handleResetPwdOk}
        onCancel={() => setResetPwdModal({ ...resetPwdModal, visible: false })}
      />
    </div>
  );
}

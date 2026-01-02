"use client";

import React, { useState, useRef, useMemo } from "react";
import dayjs from "dayjs";
import { Button, Space, Tag, Modal, Toast, Switch } from "@douyinfe/semi-ui-19";
import {
  IconPlus,
  IconEdit2,
  IconDelete,
  IconPlay,
  IconPause,
} from "@douyinfe/semi-icons";
import RoleAPI from "@/api/role";
import RoleEditModal from "./components/RoleEditModal";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";

// 💡 定义角色实体类型，消灭 any
interface Role {
  id: string | number;
  name: string;
  isActive: number; // 1=启用, 0=禁用
  remark?: string;
  permissionCodes: string[];
  createdAt?: string;
}

export default function RoleListPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  /**
   * 💡 逻辑 1: 处理启用/禁用切换
   */
  const handleToggleStatus = (record: Role) => {
    const isActive = record.isActive === 1;
    const actionText = isActive ? "禁用" : "启用";
    Modal.confirm({
      title: `确定要${actionText}角色「${record.name}」吗？`,
      content: isActive
        ? "禁用后，拥有该角色的用户将失去相关权限。"
        : "启用后，用户将恢复相关功能权限。",
      onOk: async () => {
        try {
          // 调用新接口，仅修改 isActive 字段
          await RoleAPI.updateRoleStatus(record.id, isActive ? 0 : 1);
          Toast.success(`${actionText}成功`);
          tableRef.current?.reload(); // 刷新列表
        } catch (error) {
          // 错误已由 request 拦截器处理
        }
      },
    });
  };

  const handleDelete = (id: string | number) => {
    Modal.confirm({
      title: "确定删除该角色吗？",
      content: "删除后拥有该角色的账号权限将受影响。",
      onOk: async () => {
        try {
          await RoleAPI.deleteRole(id);
          Toast.success("删除成功");
          tableRef.current?.reload();
        } catch (error) {}
      },
    });
  };

  // 💡 配置式列定义
  const columns: ProColumnType<Role>[] = useMemo(
    () => [
      {
        title: "角色名称",
        dataIndex: "name",
        valueType: "text",
      },
      {
        title: "状态",
        dataIndex: "isActive",
        valueType: "select",
        // 💡 这里保留 ProDataTable 的自动 Tag 功能
        valueEnum: {
          1: { text: "启用", color: "green" },
          0: { text: "禁用", color: "grey" },
        },
      },
      {
        title: "备注",
        dataIndex: "remark",
        hideInSearch: true,
      },
      {
        title: "创建时间",
        dataIndex: "createdAt",
        valueType: "text",
        render: (text) =>
          text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-",
        width: 180,
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
                setCurrentRole(record);
                setIsModalVisible(true);
              }}
            >
              编辑
            </Button>

            {/* 💡 逻辑 2: 动态显示启用/禁用按钮 */}
            <Button
              icon={record.isActive === 1 ? <IconPause /> : <IconPlay />}
              theme="light"
              type={record.isActive === 1 ? "warning" : "primary"}
              onClick={() => handleToggleStatus(record)}
            >
              {record.isActive === 1 ? "禁用" : "启用"}
            </Button>

            <Button
              icon={<IconDelete />}
              theme="light"
              type="danger"
              onClick={() => handleDelete(record.id)}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <div style={{ padding: "4px" }}>
      <ProDataTable
        ref={tableRef}
        title="角色管理"
        api={RoleAPI.getRoles}
        columns={columns}
        toolBarRender={() => (
          <Button
            icon={<IconPlus />}
            theme="solid"
            onClick={() => {
              setCurrentRole(null);
              setIsModalVisible(true);
            }}
          >
            创建角色
          </Button>
        )}
      />

      <RoleEditModal
        visible={isModalVisible}
        data={currentRole}
        onClose={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          tableRef.current?.reload();
        }}
      />
    </div>
  );
}

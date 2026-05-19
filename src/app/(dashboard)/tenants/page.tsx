"use client";

import { useRef, useState } from "react";
import {
  Button,
  Modal,
  Toast,
  Space,
  Tag,
} from "@douyinfe/semi-ui-19";
import { IconTickCircle, IconClose, IconEdit2, IconDelete, IconSetting } from "@douyinfe/semi-icons";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import TenantsAPI from "@/api/tenants";
import AdminPlatformAPI from "@/api/adminPlatform";
import TenantEditModal from "./components/TenantEditModal";
import TenantDetailModal from "./components/TenantDetailModal";
import TenantMenuModal from "./components/TenantMenuModal";
import { getIndustryName } from "@/constants/industryCodes";

export default function TenantListPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<any>(null);

  const lifecycleMap: Record<string, { text: string; color: "green" | "orange" | "red" | "grey" | "blue" }> = {
    pending: { text: "待审核", color: "orange" },
    active: { text: "运营中", color: "green" },
    rejected: { text: "已驳回", color: "red" },
    disabled: { text: "已禁用", color: "grey" },
    expired: { text: "已到期", color: "blue" },
  };

  // 表格列定义
  const columns: ProColumnType<any>[] = [
    {
      title: "企业编码",
      dataIndex: "code",
      valueType: "text",
      width: 150,
    },
    {
      title: "企业名称",
      dataIndex: "name",
      valueType: "text",
      width: 250,
    },
    {
      title: "行业",
      dataIndex: "industryName",
      valueType: "text",
      hideInSearch: true,
      width: 180,
      render: (_, record) => {
        // 优先使用后端返回的 industryName，否则根据 industryCode 解析
        if (record.industryName && record.industryName !== "未分类") {
          return record.industryName;
        }
        if (record.industryCode) {
          return getIndustryName(record.industryCode);
        }
        return "-";
      },
    },
    {
      title: "联系人",
      dataIndex: "contactPerson",
      valueType: "text",
      hideInSearch: true,
      width: 120,
    },
    {
      title: "联系电话",
      dataIndex: "contactPhone",
      valueType: "text",
      hideInSearch: true,
      width: 140,
    },
    {
      title: "生命周期",
      dataIndex: "lifecycleStatus",
      valueType: "select",
      width: 100,
      valueEnum: {
        pending: { text: "待审核", color: "orange" },
        active: { text: "运营中", color: "green" },
        rejected: { text: "已驳回", color: "red" },
        disabled: { text: "已禁用", color: "grey" },
        expired: { text: "已到期", color: "blue" },
      },
      render: (_, record) => {
        const config = lifecycleMap[record.lifecycleStatus || (record.isApproved === 1 ? "active" : "pending")];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "启用状态",
      dataIndex: "isActive",
      valueType: "select",
      width: 100,
      valueEnum: {
        1: { text: "启用", color: "green" },
        0: { text: "禁用", color: "grey" },
      },
      render: (_, record) => (
        <Tag color={record.isActive === 1 ? "green" : "grey"}>
          {record.isActive === 1 ? "启用" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "官网地址",
      dataIndex: "website",
      valueType: "text",
      hideInSearch: true,
      width: 200,
      render: (text) =>
        text ? (
          <a
            href={text}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1890ff", textDecoration: "none" }}
          >
            {text}
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      valueType: "text",
      hideInSearch: true,
      width: 180,
      render: (text) => (text ? new Date(text).toLocaleString("zh-CN") : "-"),
    },
    {
      title: "操作",
      dataIndex: "option",
      hideInSearch: true,
      width: 380,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button theme="light" size="small" onClick={() => handleView(record)}>
            详情
          </Button>
          <Button
            icon={<IconEdit2 />}
            theme="light"
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            icon={<IconSetting />}
            theme="light"
            size="small"
            onClick={() => handleMenu(record)}
          >
            管理菜单
          </Button>
          <Button
            theme="light"
            size="small"
            onClick={() => handleLifecycle(record)}
          >
            生命周期
          </Button>
          {record.isApproved !== 1 ? (
            <Button
              icon={<IconTickCircle />}
              theme="light"
              type="primary"
              size="small"
              onClick={() => handleApprove(record)}
            >
              通过
            </Button>
          ) : null}
          <Button
            icon={<IconClose />}
            theme="light"
            type="warning"
            size="small"
            onClick={() => handleReject(record)}
          >
            驳回
          </Button>
          <Button
            icon={<IconDelete />}
            theme="light"
            type="danger"
            size="small"
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 查看详情
  const handleView = (record: any) => {
    setCurrentTenant(record);
    setDetailModalVisible(true);
  };

  // 编辑
  const handleEdit = (record: any) => {
    setCurrentTenant(record);
    setEditModalVisible(true);
  };

  const handleMenu = (record: any) => {
    setCurrentTenant(record);
    setMenuModalVisible(true);
  };

  const handleLifecycle = (record: any) => {
    Modal.confirm({
      title: `调整租户「${record.name}」生命周期`,
      content: (
        <div style={{ paddingTop: 8 }}>
          <div style={{ marginBottom: 8 }}>选择后会直接影响租户登录状态。</div>
          <select
            id="tenant-lifecycle-select"
            defaultValue={record.lifecycleStatus || (record.isApproved === 1 ? "active" : "pending")}
            style={{ width: "100%", height: 32 }}
          >
            <option value="pending">待审核</option>
            <option value="active">运营中</option>
            <option value="rejected">已驳回</option>
            <option value="disabled">已禁用</option>
            <option value="expired">已到期</option>
          </select>
        </div>
      ),
      onOk: async () => {
        const select = document.getElementById("tenant-lifecycle-select") as HTMLSelectElement | null;
        const lifecycleStatus = select?.value as any;
        await AdminPlatformAPI.updateTenantLifecycle(record.id, { lifecycleStatus });
        Toast.success("生命周期已更新");
        tableRef.current?.reload();
      },
    });
  };

  // 删除
  const handleDelete = async (record: any) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除租户【${record.name}】吗？删除后数据将无法恢复。`,
      onOk: async () => {
        try {
          await TenantsAPI.deleteTenant(record.id);
          Toast.success("删除成功");
          tableRef.current?.reload();
        } catch (error: any) {
          Toast.error(error.message || "删除失败");
        }
      },
    });
  };

  const handleApprove = async (record: any) => {
    Modal.confirm({
      title: "确认审核通过",
      content: `审核通过后，租户【${record.name}】的管理员账号可以登录系统。`,
      onOk: async () => {
        try {
          await TenantsAPI.approveTenant(record.id);
          Toast.success("审核通过");
          tableRef.current?.reload();
        } catch (error: any) {
          Toast.error(error.message || "审核失败");
        }
      },
    });
  };

  const handleReject = async (record: any) => {
    Modal.confirm({
      title: "确认驳回并禁用",
      content: `驳回后，租户【${record.name}】将被禁用，租户管理员无法登录。`,
      onOk: async () => {
        try {
          await TenantsAPI.rejectTenant(record.id);
          Toast.success("已驳回");
          tableRef.current?.reload();
        } catch (error: any) {
          Toast.error(error.message || "驳回失败");
        }
      },
    });
  };

  // 编辑弹窗成功回调
  const handleEditSuccess = () => {
    setEditModalVisible(false);
    tableRef.current?.reload();
  };

  return (
    <div style={{ padding: 4 }}>
      <ProDataTable
        ref={tableRef}
        title="租户管理"
        api={TenantsAPI.getTenantList}
        columns={columns}
        search={true}
        rowKey="id"
      />

      {/* 详情弹窗 */}
      <TenantDetailModal
        visible={detailModalVisible}
        tenantId={currentTenant?.id}
        onClose={() => {
          setDetailModalVisible(false);
          setCurrentTenant(null);
        }}
      />

      {/* 编辑弹窗 */}
      <TenantEditModal
        visible={editModalVisible}
        data={currentTenant}
        onClose={() => {
          setEditModalVisible(false);
          setCurrentTenant(null);
        }}
        onSuccess={handleEditSuccess}
      />

      <TenantMenuModal
        visible={menuModalVisible}
        tenant={currentTenant}
        onClose={() => {
          setMenuModalVisible(false);
          setCurrentTenant(null);
        }}
      />
    </div>
  );
}

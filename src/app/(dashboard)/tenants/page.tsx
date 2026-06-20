"use client";

import { type ReactNode, useMemo, useRef, useState } from "react";
import {
  Button,
  Dropdown,
  Modal,
  Toast,
  Space,
  Tag,
  TextArea,
} from "@douyinfe/semi-ui-19";
import {
  IconTickCircle,
  IconClose,
  IconEdit2,
  IconDelete,
  IconSetting,
  IconMore,
} from "@douyinfe/semi-icons";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import TenantsAPI from "@/api/tenants";
import AdminPlatformAPI from "@/api/adminPlatform";
import TenantEditModal from "./components/TenantEditModal";
import TenantDetailModal from "./components/TenantDetailModal";
import TenantMenuModal from "./components/TenantMenuModal";
import { useBtnAuth } from "@/hooks/useBtnAuth";
import { useDictOptions } from "@/hooks/useDictOptions";
import { getIndustryByCode } from "@/constants/industryCodes";
import {
  TENANT_LIFECYCLE_MAP,
  TENANT_SOURCE_MAP,
  TENANT_SOURCE_OPTIONS,
  TENANT_LIFECYCLE_TRANSITIONS,
  type TenantLifecycleStatus,
} from "@/constants/tenant";

type TenantAction = {
  key: string;
  label: string;
  icon?: ReactNode;
  type?: "primary" | "warning" | "danger";
  onClick: () => void;
};

export default function TenantListPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const { hasBtnAuth } = useBtnAuth();
  const industryOptions = useDictOptions("INDUSTRY");
  const industryNameMap = useMemo(
    () =>
      new Map(
        industryOptions.map((option) => [
          String(option.value),
          String(option.label),
        ]),
      ),
    [industryOptions],
  );
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<any>(null);

  // 生命周期/来源等常量统一在 @/constants/tenant 维护
  const lifecycleMap = TENANT_LIFECYCLE_MAP;
  const sourceMap = TENANT_SOURCE_MAP;

  const getTenantActions = (record: any): TenantAction[] => {
    const actions: TenantAction[] = [
      {
        key: "detail",
        label: "详情",
        onClick: () => handleView(record),
      },
    ];

    if (hasBtnAuth("platform:tenant:update")) {
      actions.push(
        {
          key: "edit",
          label: "编辑",
          icon: <IconEdit2 />,
          onClick: () => handleEdit(record),
        },
        {
          key: "menu",
          label: "管理菜单",
          icon: <IconSetting />,
          onClick: () => handleMenu(record),
        },
      );
    }

    const status = (record.lifecycleStatus ||
      (record.isApproved === 1 ? "active" : "pending")) as TenantLifecycleStatus;
    // 可执行动作由「合法跃迁」常量驱动，与后端状态机单一真相
    const allowed = TENANT_LIFECYCLE_TRANSITIONS[status] || [];
    const canTo = (target: TenantLifecycleStatus) => allowed.includes(target);

    // 审核类（待审核 / 已驳回 → 运营中；待审核 → 已驳回）
    if (hasBtnAuth("platform:tenant:approve")) {
      if (canTo("active") && (status === "pending" || status === "rejected")) {
        actions.push({
          key: "approve",
          label: status === "rejected" ? "重新通过" : "通过",
          icon: <IconTickCircle />,
          type: "primary",
          onClick: () => handleApprove(record),
        });
      }
      if (canTo("rejected")) {
        actions.push({
          key: "reject",
          label: "驳回",
          icon: <IconClose />,
          type: "warning",
          onClick: () => handleReject(record),
        });
      }
    }

    // 启停类（运营中 → 已禁用；已禁用 / 已到期 → 运营中）
    if (hasBtnAuth("platform:tenant:status")) {
      if (canTo("disabled")) {
        actions.push({
          key: "disable",
          label: "停用",
          icon: <IconClose />,
          type: "warning",
          onClick: () => handleDisable(record),
        });
      }
      if (canTo("active") && (status === "disabled" || status === "expired")) {
        actions.push({
          key: "enable",
          label: "启用",
          icon: <IconTickCircle />,
          type: "primary",
          onClick: () => handleEnable(record),
        });
      }
    }

    if (hasBtnAuth("platform:tenant:delete")) {
      actions.push({
        key: "delete",
        label: "删除",
        icon: <IconDelete />,
        type: "danger",
        onClick: () => handleDelete(record),
      });
    }

    return actions;
  };

  const renderActionButton = (action: TenantAction) => (
    <Button
      key={action.key}
      icon={action.icon}
      theme="light"
      type={action.type}
      size="small"
      onClick={action.onClick}
    >
      {action.label}
    </Button>
  );

  const renderTenantActions = (record: any) => {
    const actions = getTenantActions(record);
    const visibleActions = actions.slice(0, 3);
    const dropdownActions = actions.slice(3);

    return (
      <Space>
        {visibleActions.map(renderActionButton)}
        {dropdownActions.length > 0 ? (
          <Dropdown
            trigger="click"
            position="bottomRight"
            render={
              <Dropdown.Menu>
                {dropdownActions.map((action) => (
                  <Dropdown.Item
                    key={action.key}
                    icon={action.icon}
                    type={action.type === "danger" ? "danger" : undefined}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            }
          >
            <span style={{ display: "inline-flex" }}>
              <Button icon={<IconMore />} theme="light" size="small" />
            </span>
          </Dropdown>
        ) : null}
      </Space>
    );
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
      title: "来源",
      dataIndex: "tenantSource",
      valueType: "select",
      width: 120,
      valueEnum: {
        platform: { text: "平台后台", color: "blue" },
        miniapp: { text: "小程序", color: "green" },
        import: { text: "导入", color: "grey" },
        api: { text: "开放接口", color: "orange" },
      },
      fieldProps: {
        optionList: TENANT_SOURCE_OPTIONS,
      },
      render: (_, record) => {
        const source = sourceMap[record.tenantSource || "platform"];
        return source ? <Tag color={source.color}>{source.text}</Tag> : "-";
      },
    },
    {
      title: "行业",
      dataIndex: "industryName",
      valueType: "text",
      hideInSearch: true,
      width: 180,
      render: (_, record) => {
        // 优先用后端返回的 industryName；否则按 industryCode 解析：
        // 后端字典 → GB/T 标准常量(注册用的同一套) → 原始代码兜底
        if (record.industryName && record.industryName !== "未分类") {
          return record.industryName;
        }
        if (record.industryCode) {
          return (
            industryNameMap.get(record.industryCode) ||
            getIndustryByCode(record.industryCode)?.name ||
            record.industryCode
          );
        }
        return "-";
      },
    },
    {
      title: "联系人",
      dataIndex: "contactPerson",
      valueType: "text",
      width: 120,
    },
    {
      title: "联系电话",
      dataIndex: "contactPhone",
      valueType: "text",
      width: 140,
    },
    {
      title: "联系邮箱",
      dataIndex: "email",
      valueType: "text",
      width: 200,
      render: (text) => text || "-",
    },
    {
      title: "状态",
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
        const config =
          lifecycleMap[
            record.lifecycleStatus ||
              (record.isApproved === 1 ? "active" : "pending")
          ];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
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
      fixed: "right",
      width: 350,
      render: (_, record) => renderTenantActions(record),
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

  // 统一的生命周期变更：后端会按 lifecycleStatus 同步 isActive/isApproved
  const changeLifecycle = async (
    record: any,
    lifecycleStatus: "pending" | "active" | "rejected" | "disabled" | "expired",
    opts?: { auditRemark?: string; disabledReason?: string; successMsg?: string },
  ) => {
    try {
      await AdminPlatformAPI.updateTenantLifecycle(record.id, {
        lifecycleStatus,
        ...(opts?.auditRemark ? { auditRemark: opts.auditRemark } : {}),
        ...(opts?.disabledReason ? { disabledReason: opts.disabledReason } : {}),
      });
      Toast.success(opts?.successMsg || "操作成功");
      tableRef.current?.reload();
    } catch (error: any) {
      Toast.error(error.message || "操作失败");
    }
  };

  // 停用（运营中 → 已禁用）：管理员将无法登录
  const handleDisable = (record: any) => {
    const reasonRef = { current: "" };
    Modal.confirm({
      title: `确认停用租户「${record.name}」`,
      content: (
        <div style={{ paddingTop: 8 }}>
          <div style={{ marginBottom: 8 }}>
            停用后，该租户管理员将无法登录系统；可随时重新启用。
          </div>
          <TextArea
            autosize={{ minRows: 2 }}
            placeholder="停用原因（选填，便于追溯）"
            onChange={(v) => (reasonRef.current = v)}
          />
        </div>
      ),
      onOk: () =>
        changeLifecycle(record, "disabled", {
          disabledReason: reasonRef.current.trim() || undefined,
          successMsg: "已停用",
        }),
    });
  };

  // 启用（已禁用 / 已到期 → 运营中）
  const handleEnable = (record: any) => {
    Modal.confirm({
      title: `确认启用租户「${record.name}」`,
      content: "启用后，该租户管理员可以正常登录系统。",
      onOk: () => changeLifecycle(record, "active", { successMsg: "已启用" }),
    });
  };

  // 删除
  const handleDelete = async (record: any) => {
    // 运营中的租户必须先停用，避免误删在职客户（与后端校验一致）
    const isRunning = record.lifecycleStatus === "active" || record.isActive === 1;
    if (isRunning) {
      Modal.warning({
        title: "请先停用该租户",
        content: `租户【${record.name}】仍在运营中。请先点「停用」，再执行删除。`,
      });
      return;
    }
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除租户【${record.name}】吗？为软删除：数据会保留并标记删除（可联系平台恢复），不会立即物理清除。`,
      onOk: async () => {
        try {
          await TenantsAPI.deleteTenant(record.id);
          Toast.success("已删除（软删除）");
          tableRef.current?.reload();
        } catch (error: any) {
          Toast.error(error.message || "删除失败");
        }
      },
    });
  };

  // 审核通过（待审核 / 已驳回 → 运营中）
  const handleApprove = (record: any) => {
    Modal.confirm({
      title: "确认审核通过",
      content: (
        <div>
          <div>审核通过后，租户【{record.name}】的管理员账号可以登录系统。</div>
          <div style={{ marginTop: 8, color: "var(--semi-color-text-2)" }}>
            {record.email
              ? `系统会发送审核通过邮件至：${record.email}`
              : "该租户未填写邮箱，不会发送邮件通知。"}
          </div>
        </div>
      ),
      onOk: () =>
        changeLifecycle(record, "active", {
          auditRemark: "审核通过",
          successMsg: "已通过",
        }),
    });
  };

  // 驳回（仅待审核申请 → 已驳回）
  const handleReject = (record: any) => {
    const reasonRef = { current: "" };
    Modal.confirm({
      title: "确认驳回入驻申请",
      content: (
        <div style={{ paddingTop: 8 }}>
          <div style={{ marginBottom: 8 }}>
            驳回后，租户【{record.name}】的入驻申请未通过，管理员无法登录。
          </div>
          <TextArea
            autosize={{ minRows: 3 }}
            placeholder="请输入驳回原因，会随邮件发送给租户"
            onChange={(v) => (reasonRef.current = v)}
          />
          <div style={{ marginTop: 8, color: "var(--semi-color-text-2)" }}>
            {record.email
              ? `系统会发送审核驳回邮件至：${record.email}`
              : "该租户未填写邮箱，不会发送邮件通知。"}
          </div>
        </div>
      ),
      onOk: () =>
        changeLifecycle(record, "rejected", {
          auditRemark: reasonRef.current.trim() || "入驻申请未通过审核",
          successMsg: "已驳回",
        }),
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

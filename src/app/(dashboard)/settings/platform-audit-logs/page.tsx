"use client";

import { Tag } from "@douyinfe/semi-ui-19";
import AdminPlatformAPI from "@/api/adminPlatform";
import type { OperationLog } from "@/api/adminPlatform/types";
import ProDataTable, { ProColumnType } from "@/components/ProDataTable";

export default function PlatformAuditLogsPage() {
  const columns: ProColumnType<OperationLog>[] = [
    {
      title: "操作人",
      dataIndex: "username",
      valueType: "text",
      render: (text) => text || "-",
    },
    {
      title: "模块",
      dataIndex: "module",
      valueType: "text",
      fieldProps: {
        placeholder: "tenant / platform-menu",
      },
    },
    {
      title: "动作",
      dataIndex: "action",
      valueType: "text",
      hideInSearch: true,
    },
    {
      title: "范围",
      dataIndex: "scope",
      hideInSearch: true,
      render: () => <Tag color="blue">platform</Tag>,
    },
    {
      title: "描述",
      dataIndex: "description",
      hideInSearch: true,
      render: (text) => text || "-",
    },
    {
      title: "IP",
      dataIndex: "ip",
      hideInSearch: true,
      render: (text) => text || "-",
    },
    {
      title: "时间",
      dataIndex: "createdAt",
      hideInSearch: true,
      render: (text) => (text ? new Date(String(text)).toLocaleString("zh-CN") : "-"),
    },
  ];

  return (
    <div style={{ padding: 4 }}>
      <ProDataTable
        title="平台操作审计"
        api={AdminPlatformAPI.getPlatformAuditLogs}
        columns={columns}
        rowKey="id"
        initialValues={{
          module: "",
          username: "",
        }}
      />
    </div>
  );
}

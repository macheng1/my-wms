"use client";

import { useEffect, useState } from "react";
import { Button, Form, Space, Table, Tag, Typography } from "@douyinfe/semi-ui-19";
import AdminPlatformAPI from "@/api/adminPlatform";
import { OperationLog } from "@/api/adminPlatform/types";

const { Title } = Typography;

export default function TenantOperationLogsPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState({ page: 1, pageSize: 20, module: "", username: "" });

  const loadData = async (nextQuery = query) => {
    setLoading(true);
    try {
      const res: any = await AdminPlatformAPI.getTenantAuditLogs(nextQuery);
      setLogs(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 4 }}>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <Title heading={5} style={{ margin: 0 }}>
          租户操作日志
        </Title>
      </div>

      <Form
        layout="horizontal"
        onSubmit={(values) => {
          const nextQuery = { ...query, ...values, page: 1 };
          setQuery(nextQuery);
          loadData(nextQuery);
        }}
        style={{ marginBottom: 16 }}
      >
        <Form.Input field="module" label="模块" placeholder="user / role / inventory" style={{ width: 220 }} />
        <Form.Input field="username" label="操作人" placeholder="账号" style={{ width: 180 }} />
        <Form.Slot>
          <Space>
            <Button theme="solid" type="primary" htmlType="submit">
              查询
            </Button>
          </Space>
        </Form.Slot>
      </Form>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={logs}
        scroll={{ x: "max-content" }}
        pagination={{
          currentPage: query.page,
          pageSize: query.pageSize,
          total,
          onPageChange: (page) => {
            const nextQuery = { ...query, page };
            setQuery(nextQuery);
            loadData(nextQuery);
          },
        }}
        columns={[
          { title: "操作人", dataIndex: "username", render: (text) => text || "-" },
          { title: "模块", dataIndex: "module" },
          { title: "动作", dataIndex: "action" },
          {
            title: "范围",
            dataIndex: "scope",
            render: () => <Tag color="green">tenant</Tag>,
          },
          { title: "描述", dataIndex: "description", render: (text) => text || "-" },
          { title: "IP", dataIndex: "ip", render: (text) => text || "-" },
          {
            title: "时间",
            dataIndex: "createdAt",
            render: (text) => (text ? new Date(text).toLocaleString("zh-CN") : "-"),
          },
        ]}
      />
    </div>
  );
}

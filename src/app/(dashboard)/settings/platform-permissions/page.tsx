"use client";

import { useEffect, useState } from "react";
import { Table, Tag, Typography } from "@douyinfe/semi-ui-19";
import AdminPlatformAPI from "@/api/adminPlatform";
import { PlatformPermission } from "@/api/adminPlatform/types";

const { Title } = Typography;

export default function PlatformPermissionsPage() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<PlatformPermission[]>([]);

  useEffect(() => {
    setLoading(true);
    AdminPlatformAPI.getPermissions()
      .then((res) => setDataSource(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 4 }}>
      <Title heading={5} style={{ marginBottom: 16 }}>
        平台权限
      </Title>
      <Table
        rowKey="code"
        loading={loading}
        dataSource={dataSource}
        pagination={false}
        columns={[
          { title: "权限名称", dataIndex: "name" },
          { title: "权限码", dataIndex: "code" },
          {
            title: "类型",
            dataIndex: "type",
            render: (text) => <Tag>{text || "-"}</Tag>,
          },
          {
            title: "路由",
            dataIndex: "routePath",
            render: (text) => text || "-",
          },
          {
            title: "说明",
            dataIndex: "description",
            render: (text) => text || "-",
          },
        ]}
      />
    </div>
  );
}

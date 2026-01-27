"use client";

import { useRef, useState } from "react";
import {
  Button,
  Modal,
  Toast,
  Space,
  Tag,
} from "@douyinfe/semi-ui-19";
import { IconEdit2, IconDelete } from "@douyinfe/semi-icons";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import TenantsAPI from "@/api/tenants";
import TenantEditModal from "./components/TenantEditModal";
import TenantDetailModal from "./components/TenantDetailModal";
import { getIndustryName } from "@/constants/industryCodes";

export default function TenantListPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<any>(null);

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
      title: "状态",
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
      width: 200,
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
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Tag, Button, Space, Typography, TagColor, Switch } from "@douyinfe/semi-ui-19";
import { IconEdit } from "@douyinfe/semi-icons";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import InventoryApi from "@/api/inventory";
import { IQueryInventory } from "@/api/inventory/types";
import AdjustModal from "./components/AdjustModal";

const { Text } = Typography;

export default function InventoryListPage() {
  const tableRef = React.useRef<ProDataTableRef>(null);
  const [adjustVisible, setAdjustVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  // 是否显示全部（含未绑定库位的产品）；默认只显示绑定过库位的产品
  const [showAll, setShowAll] = useState(false);
  // 用 ref 给 api 取最新值，避免 ProDataTable 缓存的 api 闭包拿到旧 state
  const showAllRef = React.useRef(showAll);

  // 包一层：默认 onlyLocationBound=true，仅在「显示全部」时传 false
  const fetchList = (params: IQueryInventory) =>
    InventoryApi.getInventoryPage({
      ...params,
      onlyLocationBound: showAllRef.current ? false : undefined,
    });

  // 库存状态渲染
  const renderStockStatus = (record: any) => {
    const statusInfo = record.stockStatusInfo;
    if (!statusInfo) return "-";

    const colorMap: Record<string, TagColor> = {
      red: "red",
      orange: "orange",
      green: "green",
    };

    return (
      <Tag color={colorMap[statusInfo.color] || "blue"}>{statusInfo.label}</Tag>
    );
  };

  // 列定义
  const columns: ProColumnType<any>[] = [
    {
      title: "SKU",
      dataIndex: "sku",
      valueType: "text",
      width: 150,
    },
    {
      title: "产品名称",
      dataIndex: "productName",
      valueType: "text",
      width: 200,
    },
    {
      title: "库位",
      dataIndex: "locationName",
      valueType: "text",
      width: 120,
    },
    {
      title: "总库存",
      dataIndex: "quantity",
      valueType: "digit",
      hideInSearch: true,
      width: 120,
      render: (text: number, record: any) => (
        <Text strong style={{ fontSize: 16 }}>
          {record.quantityDisplay ||
            `${text.toLocaleString()} ${record.unitSymbol || ""}`}
        </Text>
      ),
    },
    {
      title: "锁定库存",
      dataIndex: "lockedQuantity",
      valueType: "digit",
      hideInSearch: true,
      width: 120,
      render: (_: number, record: any) => (
        <Text type={Number(record.lockedQuantity || 0) > 0 ? "warning" : "secondary"}>
          {record.lockedQuantityDisplay || `0 ${record.unitSymbol || ""}`}
        </Text>
      ),
    },
    {
      title: "可预购库存",
      dataIndex: "availableQuantity",
      valueType: "digit",
      hideInSearch: true,
      width: 130,
      render: (_: number, record: any) => (
        <Text strong style={{ fontSize: 16, color: Number(record.availableQuantity || 0) <= 0 ? "#d54941" : "#2e7d32" }}>
          {record.availableQuantityDisplay || `0 ${record.unitSymbol || ""}`}
        </Text>
      ),
    },
    {
      title: "安全库存",
      dataIndex: "safetyStock",
      valueType: "digit",
      hideInSearch: true,
      width: 100,
      render: (_: any, record: any) => record.safetyStockDisplay || "-",
    },
    {
      title: "库存状态",
      dataIndex: "stockStatus",
      valueType: "select",
      valueEnum: {
        LOW_STOCK: { text: "库存不足", status: "Warning" },
        OUT_OF_STOCK: { text: "零库存", status: "Error" },
        IN_STOCK: { text: "库存充足", status: "Success" },
      },
      render: (_: any, record: any) => renderStockStatus(record),
    },
    {
      title: "最后来源",
      dataIndex: "lastSourceLabel",
      valueType: "text",
      hideInSearch: true,
      width: 90,
      render: (_: string, record: any) => record.lastSourceLabel || record.lastSource || "-",
    },
    {
      title: "最后操作人",
      dataIndex: "lastOperatorName",
      valueType: "text",
      hideInSearch: true,
      width: 110,
      render: (text: string) => text || "-",
    },
    {
      title: "操作",
      dataIndex: "option",
      hideInSearch: true,
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<IconEdit />}
            theme="light"
            size="small"
            type="primary"
            onClick={() => handleAdjustStock(record)}
          >
            修改库存
          </Button>
          <Button
            theme="light"
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewDetail = (record: any) => {
    // 可以打开详情弹窗或跳转
    console.log("查看详情:", record);
  };

  const handleAdjustStock = (record: any) => {
    setCurrentRecord(record);
    setAdjustVisible(true);
  };

  return (
    <div style={{ padding: "4px" }}>
      <ProDataTable
        ref={tableRef}
        title="库存查询"
        api={fetchList}
        columns={columns}
        toolBarRender={() => (
          <Space align="center">
            <Space spacing={4} align="center">
              <Text type="tertiary">显示全部</Text>
              <Switch
                size="small"
                checked={showAll}
                onChange={(v) => {
                  showAllRef.current = v;
                  setShowAll(v);
                  tableRef.current?.reload();
                }}
              />
            </Space>
            <Button
              theme="solid"
              onClick={() => {
                // 导出功能
                console.log("导出库存");
              }}
            >
              导出Excel
            </Button>
          </Space>
        )}
      />

      {/* 库存调整弹窗 */}
      <AdjustModal
        visible={adjustVisible}
        data={currentRecord}
        onClose={() => setAdjustVisible(false)}
        onSuccess={() => {
          setAdjustVisible(false);
          tableRef.current?.reload();
        }}
      />
    </div>
  );
}

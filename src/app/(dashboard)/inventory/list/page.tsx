"use client";

import React, { useState } from "react";
import { Tag, Button, Space, Typography, TagColor } from "@douyinfe/semi-ui-19";
import { IconEdit } from "@douyinfe/semi-icons";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import InventoryApi from "@/api/inventory";
import AdjustModal from "./components/AdjustModal";

const { Text } = Typography;

export default function InventoryListPage() {
  const tableRef = React.useRef<ProDataTableRef>(null);
  const [adjustVisible, setAdjustVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);

  // 格式化多单位库存展示
  const renderMultiUnitQty = (
    multiUnitQty:
      | Record<
          string,
          { quantity: number; name: string; symbol: string; display: string }
        >
      | undefined,
  ) => {
    if (!multiUnitQty || Object.keys(multiUnitQty).length === 0) return "-";
    return (
      <Space wrap>
        {Object.entries(multiUnitQty).map(([unit, qty]) => (
          <Tag key={unit} color="blue">
            {qty.display}
          </Tag>
        ))}
      </Space>
    );
  };

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
      title: "库存数量",
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
      title: "多单位库存",
      dataIndex: "multiUnitQty",
      hideInSearch: true,
      render: renderMultiUnitQty,
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
        api={InventoryApi.getInventoryPage}
        columns={columns}
        toolBarRender={() => (
          <Space>
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

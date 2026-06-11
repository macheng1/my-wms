"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button, Space, Tag, Typography, TagColor } from "@douyinfe/semi-ui-19";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import TransactionApi from "@/api/transactions";
import { TransactionType } from "@/api/transactions/types";
import ProductApi from "@/api/product";
import dayjs from "dayjs";

const { Text } = Typography;

// 交易类型选项
const TRANSACTION_TYPE_OPTIONS = [
  { label: "采购入库", value: TransactionType.INBOUND_PURCHASE },
  { label: "退货入库", value: TransactionType.INBOUND_RETURN },
  { label: "调拨入库", value: TransactionType.INBOUND_TRANSFER },
  { label: "生产入库", value: TransactionType.INBOUND_PRODUCTION },
  { label: "销售出库", value: TransactionType.OUTBOUND_SALES },
  { label: "领料出库", value: TransactionType.OUTBOUND_MATERIAL },
  { label: "调拨出库", value: TransactionType.OUTBOUND_TRANSFER },
  { label: "报废出库", value: TransactionType.OUTBOUND_SCRAP },
  { label: "订购锁库", value: TransactionType.STOCK_LOCK },
  { label: "订购释放", value: TransactionType.STOCK_RELEASE },
  { label: "盘盈", value: TransactionType.ADJUSTMENT_IN },
  { label: "盘亏", value: TransactionType.ADJUSTMENT_OUT },
];

export default function TransactionsPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [productOptions, setProductOptions] = useState<any[]>([]);

  // 加载产品选项
  useEffect(() => {
    ProductApi.getProductSelect().then((res) => {
      setProductOptions(res.data || []);
    });
  }, []);

  // 交易类型映射
  const typeMap: Record<string, string> = {
    [TransactionType.INBOUND_PURCHASE]: "采购入库",
    [TransactionType.INBOUND_RETURN]: "退货入库",
    [TransactionType.INBOUND_TRANSFER]: "调拨入库",
    [TransactionType.INBOUND_PRODUCTION]: "生产入库",
    [TransactionType.OUTBOUND_SALES]: "销售出库",
    [TransactionType.OUTBOUND_MATERIAL]: "领料出库",
    [TransactionType.OUTBOUND_TRANSFER]: "调拨出库",
    [TransactionType.OUTBOUND_SCRAP]: "报废出库",
    [TransactionType.STOCK_LOCK]: "订购锁库",
    [TransactionType.STOCK_RELEASE]: "订购释放",
    [TransactionType.ADJUSTMENT_IN]: "盘盈",
    [TransactionType.ADJUSTMENT_OUT]: "盘亏",
  };

  // 获取类型标签颜色
  const getTypeColor = (type: string): TagColor => {
    // 入库类型用绿色系
    if (type.startsWith("INBOUND_")) {
      const colorMap: Record<string, TagColor> = {
        [TransactionType.INBOUND_PURCHASE]: "green",
        [TransactionType.INBOUND_RETURN]: "cyan",
        [TransactionType.INBOUND_TRANSFER]: "blue",
        [TransactionType.INBOUND_PRODUCTION]: "lime",
      };
      return colorMap[type] || "green";
    }
    // 出库类型用红色/紫色系
    if (type.startsWith("OUTBOUND_")) {
      const colorMap: Record<string, TagColor> = {
        [TransactionType.OUTBOUND_SALES]: "pink",
        [TransactionType.OUTBOUND_MATERIAL]: "purple",
        [TransactionType.OUTBOUND_TRANSFER]: "blue",
        [TransactionType.OUTBOUND_SCRAP]: "red",
      };
      return colorMap[type] || "red";
    }
    if (type === TransactionType.STOCK_LOCK) return "orange";
    if (type === TransactionType.STOCK_RELEASE) return "teal";
    // 调整类型用橙色
    return "orange";
  };

  // 列定义
  const columns: ProColumnType<any>[] = [
    {
      title: "交易类型",
      dataIndex: "transactionType",
      valueType: "select",
      valueEnum: TRANSACTION_TYPE_OPTIONS.reduce((acc, opt) => {
        acc[opt.value] = { text: opt.label };
        return acc;
      }, {} as any),
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{typeMap[type] || type}</Tag>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      valueType: "select",
      width: 150,
      fieldProps: {
        optionList: productOptions,
        showClear: true,
        placeholder: "请选择产品",
      },
    },
    {
      title: "产品名称",
      dataIndex: "productName",
      valueType: "text",
      hideInSearch: true,
    },
    {
      title: "变动数量",
      dataIndex: "quantity",
      valueType: "digit",
      hideInSearch: true,
      render: (text: number, record: any) => {
        const isInbound = record.typeDirection == "INBOUND";
        const unitText = record.unitSymbol || record.unitName || "";
        return (
          <Text strong style={{ color: isInbound ? "green" : "red" }}>
            {isInbound ? "+" : "-"}
            {text} {unitText}
          </Text>
        );
      },
    },
    {
      title: "变动前",
      dataIndex: "beforeQty",
      valueType: "digit",
      hideInSearch: true,
      render: (text: number, record: any) =>
        `${text} ${record.unitSymbol || record.unitName || ""}`,
    },
    {
      title: "变动后",
      dataIndex: "afterQty",
      valueType: "digit",
      hideInSearch: true,
      render: (text: number, record: any) =>
        `${text} ${record.unitSymbol || record.unitName || ""}`,
    },
    {
      title: "单据号",
      dataIndex: "orderNo",
      valueType: "text",
      hideInSearch: true,
    },
    {
      title: "库位",
      dataIndex: "locationName",
      valueType: "text",
      hideInSearch: true,
    },
    {
      title: "备注",
      dataIndex: "remark",
      valueType: "text",
      hideInSearch: true,
      width: 200,
      render: (text: string) => text || "-",
    },
    {
      title: "交易时间",
      dataIndex: "createdAt",
      valueType: "dateTime",
      hideInSearch: true,
      width: 180,
      render: (text: string) =>
        text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
  ];

  return (
    <div style={{ padding: "4px" }}>
      <ProDataTable
        ref={tableRef}
        title="库存流水"
        api={TransactionApi.getTransactions}
        columns={columns}
        toolBarRender={() => (
          <Space>
            <Button
              theme="solid"
              onClick={() => {
                // 导出功能
                console.log("导出流水");
              }}
            >
              导出Excel
            </Button>
          </Space>
        )}
      />
    </div>
  );
}

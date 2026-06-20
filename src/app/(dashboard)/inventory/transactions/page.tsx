"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button, Space, Tag, Typography, TagColor, Toast } from "@douyinfe/semi-ui-19";
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
  const [exporting, setExporting] = useState(false);

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
      // 主值按方向上色（入库绿/出库红），折算量（库存单位）用灰色，与入库/出库页一致
      render: (text: number, record: any) => {
        const isInbound = record.typeDirection == "INBOUND";
        const unitText = record.unitSymbol || record.unitName || "";
        const main =
          record.quantityDisplay || `${isInbound ? "+" : "-"}${text} ${unitText}`;
        // 操作单位与库存主单位不同时（quantityWithStockDisplay 带括号）才展示折算量
        const hasConversion =
          record.quantityWithStockDisplay &&
          record.quantityWithStockDisplay !== record.quantityDisplay;
        return (
          <span>
            <Text strong type={isInbound ? "success" : "danger"}>
              {main}
            </Text>
            {hasConversion && record.stockQuantityDisplay && (
              <Text type="tertiary" style={{ marginLeft: 4 }}>
                ({record.stockQuantityDisplay})
              </Text>
            )}
          </span>
        );
      },
    },
    {
      title: "变动前",
      dataIndex: "beforeQty",
      valueType: "digit",
      hideInSearch: true,
      // 变动前是起始值，用灰色弱化，与库存变化列的「变动前」配色一致
      render: (text: number, record: any) => (
        <Text type="tertiary">
          {record.beforeQtyDisplay || `${text} ${record.unitSymbol || record.unitName || ""}`}
        </Text>
      ),
    },
    {
      title: "变动后",
      dataIndex: "afterQty",
      valueType: "digit",
      hideInSearch: true,
      // 变动后按方向上色（增加=绿、减少=红、不变=灰）
      render: (text: number, record: any) => {
        const before = Number(record.beforeQty);
        const after = Number(record.afterQty);
        const afterType =
          after > before ? "success" : after < before ? "danger" : "tertiary";
        return (
          <Text strong type={afterType}>
            {record.afterQtyDisplay || `${text} ${record.unitSymbol || record.unitName || ""}`}
          </Text>
        );
      },
    },
    {
      title: "单据号",
      dataIndex: "orderNo",
      valueType: "text",
      fieldProps: { placeholder: "请输入单据号" },
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
      title: "变动时间",
      dataIndex: "createdAt",
      valueType: "dateTime",
      hideInSearch: true,
      width: 180,
      render: (text: string) =>
        text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
    {
      // 仅用于搜索栏的变动时间范围筛选，不在表格中显示
      title: "变动时间",
      dataIndex: "dateRange",
      valueType: "dateRange",
      hideInTable: true,
    },
  ];

  // 把搜索栏的「时间范围」(Date 数组) 规整成含整日的 startDate/endDate
  const normalizeParams = (params: any) => {
    const { dateRange, ...rest } = params || {};
    const [start, end] = Array.isArray(dateRange) ? dateRange : [];
    return {
      ...rest,
      startDate: start ? dayjs(start).startOf("day").format("YYYY-MM-DD HH:mm:ss") : undefined,
      endDate: end ? dayjs(end).endOf("day").format("YYYY-MM-DD HH:mm:ss") : undefined,
    };
  };

  // 列表请求：套用日期规整
  const loadTransactions = (params: any) =>
    TransactionApi.getTransactions(normalizeParams(params));

  // 导出当前筛选下的流水（不分页，后端导出全部命中记录）
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = tableRef.current?.getQueryParams() || {};
      await TransactionApi.exportTransactions(normalizeParams(params));
      Toast.success("导出成功");
    } catch (e) {
      console.error("导出失败:", e);
      Toast.error("导出失败，请稍后重试");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ padding: "4px" }}>
      <ProDataTable
        ref={tableRef}
        title="库存流水"
        api={loadTransactions}
        columns={columns}
        toolBarRender={() => (
          <Space>
            <Button theme="solid" loading={exporting} onClick={handleExport}>
              导出Excel
            </Button>
          </Space>
        )}
      />
    </div>
  );
}

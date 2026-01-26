"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button, Space, Tag, Typography } from "@douyinfe/semi-ui-19";
import { IconPlus } from "@douyinfe/semi-icons";
import dayjs from "dayjs";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import OutboundApi from "@/api/outbound";
import { OutboundType } from "@/api/outbound/types";
import OutboundModal from "./components/OutboundModal";
import ProductApi from "@/api/product";

const { Text } = Typography;

// 出库类型选项
const OUTBOUND_TYPE_OPTIONS = [
  { label: "销售出库", value: OutboundType.SALES },
  { label: "领料出库", value: OutboundType.MATERIAL },
  { label: "调拨出库", value: OutboundType.TRANSFER },
  { label: "报废出库", value: OutboundType.SCRAP },
  { label: "盘亏", value: OutboundType.ADJUSTMENT_OUT },
];

export default function OutboundPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"single" | "batch">("single");
  const [productOptions, setProductOptions] = useState<any[]>([]);

  // 加载产品选项
  useEffect(() => {
    ProductApi.getProductSelect().then((res) => {
      setProductOptions(res.data || []);
    });
  }, []);

  // 交易类型映射
  const typeMap: Record<string, string> = {
    [OutboundType.SALES]: "销售出库",
    [OutboundType.MATERIAL]: "领料出库",
    [OutboundType.TRANSFER]: "调拨出库",
    [OutboundType.SCRAP]: "报废出库",
    [OutboundType.ADJUSTMENT_OUT]: "盘亏",
  };

  // 获取类型标签颜色
  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      [OutboundType.SALES]: "green",
      [OutboundType.MATERIAL]: "blue",
      [OutboundType.TRANSFER]: "cyan",
      [OutboundType.SCRAP]: "red",
      [OutboundType.ADJUSTMENT_OUT]: "orange",
    };
    return colorMap[type] || "default";
  };

  // 列定义
  const columns: ProColumnType<any>[] = [
    {
      title: "出库类型",
      dataIndex: "transactionType",
      valueType: "select",
      valueEnum: OUTBOUND_TYPE_OPTIONS.reduce((acc, opt) => {
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
      title: "出库数量",
      dataIndex: "quantity",
      valueType: "digit",
      hideInSearch: true,
      render: (text: number, record: any) => (
        <Text strong style={{ color: "red" }}>
          {text} {record.unitName}
        </Text>
      ),
    },
    {
      title: "变动后库存",
      dataIndex: "afterQty",
      valueType: "digit",
      hideInSearch: true,
      render: (text: number, record: any) => `${text} ${record.unitName}`,
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
      title: "时间",
      dataIndex: "createdAt",
      valueType: "dateTime",
      hideInSearch: true,
      width: 180,
      render: (text: string) =>
        text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
  ];

  // 打开出库弹窗
  const handleOpenModal = (type: "single" | "batch") => {
    setModalType(type);
    setModalVisible(true);
  };

  return (
    <div style={{ padding: "4px" }}>
      <ProDataTable
        ref={tableRef}
        title="出库管理"
        api={OutboundApi.getOutboundLogs}
        columns={columns}
        toolBarRender={() => (
          <Space>
            <Button
              icon={<IconPlus />}
              theme="solid"
              onClick={() => handleOpenModal("single")}
            >
              单笔出库
            </Button>
            <Button
              icon={<IconPlus />}
              theme="solid"
              onClick={() => handleOpenModal("batch")}
            >
              批量出库
            </Button>
          </Space>
        )}
      />

      {/* 出库弹窗 */}
      <OutboundModal
        visible={modalVisible}
        type={modalType}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          tableRef.current?.reload();
        }}
      />
    </div>
  );
}

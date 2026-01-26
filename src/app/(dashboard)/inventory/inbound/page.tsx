"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button, Space, Tag, Typography } from "@douyinfe/semi-ui-19";
import { IconPlus } from "@douyinfe/semi-icons";
import dayjs from "dayjs";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import InboundApi from "@/api/inbound";
import { InboundType } from "@/api/inbound/types";
import InboundModal from "./components/InboundModal";
import ProductApi from "@/api/product";

const { Text } = Typography;

// 入库类型选项
const INBOUND_TYPE_OPTIONS = [
  { label: "采购入库", value: InboundType.PURCHASE },
  { label: "退货入库", value: InboundType.RETURN },
  { label: "调拨入库", value: InboundType.TRANSFER },
  { label: "生产入库", value: InboundType.PRODUCTION },
  { label: "盘盈", value: InboundType.ADJUSTMENT_IN },
];

export default function InboundPage() {
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
    [InboundType.PURCHASE]: "采购入库",
    [InboundType.RETURN]: "退货入库",
    [InboundType.TRANSFER]: "调拨入库",
    [InboundType.PRODUCTION]: "生产入库",
    [InboundType.ADJUSTMENT_IN]: "盘盈",
  };

  // 获取类型标签颜色
  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      [InboundType.PURCHASE]: "green",
      [InboundType.RETURN]: "blue",
      [InboundType.TRANSFER]: "cyan",
      [InboundType.PRODUCTION]: "purple",
      [InboundType.ADJUSTMENT_IN]: "orange",
    };
    return colorMap[type] || "default";
  };

  // 列定义
  const columns: ProColumnType<any>[] = [
    {
      title: "入库类型",
      dataIndex: "transactionType",
      valueType: "select",
      valueEnum: INBOUND_TYPE_OPTIONS.reduce((acc, opt) => {
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
      title: "入库数量",
      dataIndex: "quantity",
      valueType: "digit",
      hideInSearch: true,
      render: (text: number, record: any) => (
        <Text strong style={{ color: "green" }}>
          +{text} {record.unitName}
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
      dataIndex: "location",
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
      title: "创建时间",
      dataIndex: "createdAt",
      valueType: "dateTime",
      hideInSearch: true,
      width: 180,
      render: (text: string) =>
        text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
  ];

  // 打开入库弹窗
  const handleOpenModal = (type: "single" | "batch") => {
    setModalType(type);
    setModalVisible(true);
  };

  return (
    <div style={{ padding: "4px" }}>
      <ProDataTable
        ref={tableRef}
        title="入库管理"
        api={InboundApi.getInboundLogs}
        columns={columns}
        toolBarRender={() => (
          <Space>
            <Button
              icon={<IconPlus />}
              theme="solid"
              onClick={() => handleOpenModal("single")}
            >
              单笔入库
            </Button>
            <Button
              icon={<IconPlus />}
              theme="solid"
              onClick={() => handleOpenModal("batch")}
            >
              批量入库
            </Button>
          </Space>
        )}
      />

      {/* 入库弹窗 */}
      <InboundModal
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

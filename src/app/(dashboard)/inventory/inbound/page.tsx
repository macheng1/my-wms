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
import InboundModal from "./components/InboundModal";
import ProductApi from "@/api/product";
import { INBOUND_TYPE_MAP, INBOUND_TYPE_OPTIONS } from "@/constants/inventory";

const { Text } = Typography;

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
        <Tag color={INBOUND_TYPE_MAP[type as keyof typeof INBOUND_TYPE_MAP]?.color}>
          {INBOUND_TYPE_MAP[type as keyof typeof INBOUND_TYPE_MAP]?.text || type}
        </Tag>
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
      // 主值（操作单位）用绿色加粗，折算量（库存单位）用次要灰色，分清「录入的」和「换算的」
      render: (text: number, record: any) => {
        const main =
          record.quantityDisplay ||
          `+${text} ${record.unitSymbol || record.unitName || ""}`;
        // 操作单位与库存主单位不同时（quantityWithStockDisplay 带括号）才展示折算量
        const hasConversion =
          record.quantityWithStockDisplay &&
          record.quantityWithStockDisplay !== record.quantityDisplay;
        return (
          <span>
            <Text strong type="success">
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
      title: "库存变化",
      dataIndex: "afterQty",
      valueType: "digit",
      hideInSearch: true,
      // 变动前用灰色，变动后用强调色（增加=绿、减少=红），一眼看出本次净增/净减
      render: (text: number, record: any) => {
        // 缺少结构化字段时回退到整串显示
        if (!record.beforeQtyDisplay || !record.afterQtyDisplay) {
          return (
            record.stockChangeDisplay ||
            record.afterQtyDisplay ||
            `${text} ${record.unitSymbol || record.unitName || ""}`
          );
        }
        const before = Number(record.beforeQty);
        const after = Number(record.afterQty);
        const afterType =
          after > before ? "success" : after < before ? "danger" : "tertiary";
        return (
          <span>
            <Text type="tertiary">{record.beforeQtyDisplay}</Text>
            <Text type="tertiary" style={{ margin: "0 4px" }}>
              →
            </Text>
            <Text strong type={afterType}>
              {record.afterQtyDisplay}
            </Text>
          </span>
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
      title: "来源",
      dataIndex: "source",
      valueType: "select",
      width: 90,
      valueEnum: {
        "admin-web": { text: "后台" },
        miniapp: { text: "小程序" },
        app: { text: "手机" },
      },
      fieldProps: { placeholder: "请选择来源", showClear: true },
      render: (_: any, record: any) => record.sourceLabel || record.source || "-",
    },
    {
      title: "操作人",
      dataIndex: "operatorName",
      valueType: "text",
      hideInSearch: true,
      width: 110,
      render: (text: string) => text || "-",
    },
    {
      title: "入库时间",
      dataIndex: "createdAt",
      valueType: "dateTime",
      hideInSearch: true,
      width: 180,
      render: (text: string) =>
        text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
    {
      // 仅用于搜索栏的入库时间范围筛选，不在表格中显示
      title: "入库时间",
      dataIndex: "dateRange",
      valueType: "dateRange",
      hideInTable: true,
    },
  ];

  // 打开入库弹窗
  const handleOpenModal = (type: "single" | "batch") => {
    setModalType(type);
    setModalVisible(true);
  };

  // 把搜索栏的「时间范围」(Date 数组) 规整成含整日的 startDate/endDate 再请求
  const loadInboundLogs = (params: any) => {
    const { dateRange, ...rest } = params || {};
    const [start, end] = Array.isArray(dateRange) ? dateRange : [];
    return InboundApi.getInboundLogs({
      ...rest,
      startDate: start ? dayjs(start).startOf("day").format("YYYY-MM-DD HH:mm:ss") : undefined,
      endDate: end ? dayjs(end).endOf("day").format("YYYY-MM-DD HH:mm:ss") : undefined,
    });
  };

  return (
    <div style={{ padding: "4px" }}>
      <ProDataTable
        ref={tableRef}
        title="入库管理"
        api={loadInboundLogs}
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

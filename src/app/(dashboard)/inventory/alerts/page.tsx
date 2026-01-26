"use client";

import React, { useRef, useState, useEffect } from "react";
import { Tag, Typography, Toast, Modal } from "@douyinfe/semi-ui-19";
import dayjs from "dayjs";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import AlertApi from "@/api/alerts";
import { AlertLevel } from "@/api/alerts/types";
import ProductApi from "@/api/product";

const { Text } = Typography;

// 预警级别选项
const ALERT_LEVEL_OPTIONS = [
  { label: "严重", value: AlertLevel.CRITICAL },
  { label: "高", value: AlertLevel.HIGH },
  { label: "中", value: AlertLevel.MEDIUM },
];

export default function AlertsPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [productOptions, setProductOptions] = useState<any[]>([]);

  // 加载产品选项
  useEffect(() => {
    ProductApi.getProductSelect().then((res) => {
      setProductOptions(res.data || []);
    });
  }, []);

  // 预警级别映射
  const levelMap: Record<string, string> = {
    [AlertLevel.CRITICAL]: "严重",
    [AlertLevel.HIGH]: "高",
    [AlertLevel.MEDIUM]: "中",
  };

  // 获取级别标签颜色
  const getLevelColor = (level: string) => {
    const colorMap: Record<string, string> = {
      [AlertLevel.CRITICAL]: "red",
      [AlertLevel.HIGH]: "orange",
      [AlertLevel.MEDIUM]: "yellow",
    };
    return colorMap[level] || "default";
  };

  // 列定义
  const columns: ProColumnType<any>[] = [
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
    },
    {
      title: "当前库存",
      dataIndex: "quantity",
      valueType: "digit",
      hideInSearch: true,
      render: (text: number, record: any) => (
        <Text strong style={{ color: (text ?? 0) <= 0 ? "red" : "inherit" }}>
          {(text ?? 0).toLocaleString()} {record.unitName || "-"}
        </Text>
      ),
    },
    {
      title: "安全库存",
      dataIndex: "safetyStock",
      valueType: "digit",
      hideInSearch: true,
      render: (text: number, record: any) =>
        `${text ?? 0} ${record.unitName || "-"}`,
    },
    {
      title: "预警级别",
      dataIndex: "alertLevel",
      valueType: "select",
      valueEnum: ALERT_LEVEL_OPTIONS.reduce((acc, opt) => {
        acc[opt.value] = { text: opt.label };
        return acc;
      }, {} as any),
      render: (level: string) => (
        <Tag color={getLevelColor(level)}>{levelMap[level] || level}</Tag>
      ),
    },
    {
      title: "预警信息",
      dataIndex: "alertMessage",
      valueType: "text",
      hideInSearch: true,
      render: (text: string) => <Text type="danger">{text}</Text>,
    },
    {
      title: "库位",
      dataIndex: "location",
      valueType: "text",
      hideInSearch: true,
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

  // 标记解决
  const handleResolve = (record: any) => {
    Modal.confirm({
      title: "确定标记为已解决吗？",
      content: `确认解决「${record.productName || record.sku}」的库存预警？`,
      onOk: async () => {
        try {
          await AlertApi.resolveAlert(record.id);
          Toast.success("标记成功");
          tableRef.current?.reload();
        } catch (error) {
          Toast.error("操作失败");
        }
      },
    });
  };

  return (
    <div style={{ padding: "4px" }}>
      <ProDataTable
        ref={tableRef}
        title="库存预警"
        api={AlertApi.getAlerts}
        columns={columns}
        initialValues={{ isResolved: 0 }}
      />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Modal, Table, Tag, Typography } from "@douyinfe/semi-ui-19";
import OrderApi from "@/api/orders";
import {
  OrderItem,
  OrderRecord,
  OrderSource,
  OrderStatus,
  OrderType,
} from "@/api/orders/types";
import { formatOrderSpecs } from "@/utils/orderSpecs";

type DisplayMap<T extends string> = Record<T, { text: string; color: string }>;

function InfoGrid({ items }: { items: Array<[string, any]> }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "10px 18px",
        marginBottom: 18,
      }}
    >
      {items.map(([label, value]) => (
        <div key={label} style={{ minWidth: 0 }}>
          <Typography.Text type="tertiary" size="small">
            {label}
          </Typography.Text>
          <div style={{ marginTop: 4, minHeight: 20 }}>
            {value || "-"}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrderDetailModal({
  visible,
  order,
  sourceMap,
  typeMap,
  statusMap,
  onClose,
}: {
  visible: boolean;
  order: OrderRecord | null;
  sourceMap: DisplayMap<OrderSource>;
  typeMap: DisplayMap<OrderType>;
  statusMap: DisplayMap<OrderStatus>;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<OrderRecord | null>(null);

  useEffect(() => {
    if (!visible || !order?.id) return;
    OrderApi.getOrderDetail(order.id)
      .then((res) => setDetail(res.data || order));
  }, [visible, order]);

  const current = detail || order;
  const columns = useMemo(
    () => [
      {
        title: "序号",
        width: 64,
        render: (_: unknown, __: unknown, index: number) => index + 1,
      },
      {
        title: "产品名称",
        dataIndex: "productName",
        width: 180,
        render: (value: string) => (
          <Typography.Text ellipsis={{ showTooltip: true }}>
            {value || "-"}
          </Typography.Text>
        ),
      },
      {
        title: "SKU名称",
        width: 180,
        render: (_: unknown, item: OrderItem) => (
          <Typography.Text ellipsis={{ showTooltip: true }}>
            {item.skuName || item.productName || "-"}
          </Typography.Text>
        ),
      },
      {
        title: "SKU",
        dataIndex: "sku",
        width: 150,
        render: (value: string) => (
          <Typography.Text code copyable={!!value} ellipsis={{ showTooltip: true }}>
            {value || "-"}
          </Typography.Text>
        ),
      },
      {
        title: "条形码",
        dataIndex: "barcode",
        width: 150,
        render: (value: string) => (
          <Typography.Text code copyable={!!value} ellipsis={{ showTooltip: true }}>
            {value || "-"}
          </Typography.Text>
        ),
      },
      {
        title: "规格",
        width: 360,
        render: (_: unknown, item: OrderItem) => (
          <Typography.Paragraph
            style={{
              margin: 0,
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
          >
            {formatOrderSpecs(item.specList, item.specs)}
          </Typography.Paragraph>
        ),
      },
      {
        title: "数量",
        width: 100,
        render: (_: unknown, item: any) =>
          `${Number(item.quantity || 0)}${item.unitName ? ` ${item.unitName}` : ""}`,
      },
      // 单价/金额暂时不用，先隐藏，保留后端字段不影响后续恢复。
      // {
      //   title: "单价",
      //   dataIndex: "price",
      //   width: 100,
      //   render: (value: number) => `¥${Number(value || 0).toFixed(2)}`,
      // },
      // {
      //   title: "金额",
      //   dataIndex: "amount",
      //   width: 100,
      //   render: (value: number) => `¥${Number(value || 0).toFixed(2)}`,
      // },
    ],
    [],
  );

  return (
    <Modal
      title={`订单明细${current?.orderNumber ? `：${current.orderNumber}` : ""}`}
      visible={visible}
      onCancel={onClose}
      onOk={onClose}
      okText="确定"
      cancelButtonProps={{ style: { display: "none" } }}
      width={1180}
    >
      {current ? (
        <>
          <InfoGrid
            items={[
              ["订单号", current.orderNumber],
              [
                "状态",
                <Tag key="status" color={statusMap[current.status]?.color as any}>
                  {statusMap[current.status]?.text || current.status}
                </Tag>,
              ],
              [
                "来源",
                <Tag key="source" color={sourceMap[current.source]?.color as any}>
                  {sourceMap[current.source]?.text || current.source}
                </Tag>,
              ],
              [
                "类型",
                <Tag key="type" color={typeMap[current.orderType]?.color as any}>
                  {typeMap[current.orderType]?.text || current.orderType}
                </Tag>,
              ],
              ["客户", current.customerName],
              ["电话", current.customerPhone],
              ["地址", current.customerAddress],
              ["创建时间", current.createdAt ? dayjs(current.createdAt).format("YYYY-MM-DD HH:mm") : "-"],
              ["期望交期", current.expectedDeliveryDate ? dayjs(current.expectedDeliveryDate).format("YYYY-MM-DD") : "-"],
              // 订单金额暂时不用，先不展示。
              // ["订单金额", `¥${Number(current.totalAmount || 0).toFixed(2)}`],
              ["备注", current.remark],
            ]}
          />
          <Table
            rowKey="id"
            columns={columns}
            dataSource={current.items || []}
            pagination={false}
            size="small"
            empty="暂无商品明细"
            scroll={{ x: 1124 }}
          />
        </>
      ) : null}
    </Modal>
  );
}

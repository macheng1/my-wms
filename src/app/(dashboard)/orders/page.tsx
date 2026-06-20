"use client";

import { useRef, useState } from "react";
import dayjs from "dayjs";
import {
  Button,
  Form,
  Modal,
  Space,
  Tag,
  Timeline,
  Toast,
} from "@douyinfe/semi-ui-19";
import { IconDelete, IconPlus } from "@douyinfe/semi-icons";
import ProDataTable, {
  ProColumnType,
  ProDataTableRef,
} from "@/components/ProDataTable";
import OrderApi from "@/api/orders";
import {
  OrderFlowLog,
  OrderRecord,
  OrderSource,
  OrderStatus,
  OrderType,
} from "@/api/orders/types";
import { useBtnAuth } from "@/hooks/useBtnAuth";

const sourceMap: Record<OrderSource, { text: string; color: string }> = {
  [OrderSource.MINIAPP]: { text: "小程序", color: "blue" },
  [OrderSource.WEBSITE]: { text: "官网", color: "green" },
  [OrderSource.ADMIN]: { text: "后台", color: "grey" },
};

const typeMap: Record<OrderType, { text: string; color: string }> = {
  [OrderType.STANDARD]: { text: "标品", color: "cyan" },
  [OrderType.CUSTOM]: { text: "非标", color: "purple" },
};

const statusMap: Record<OrderStatus, { text: string; color: string }> = {
  [OrderStatus.PENDING_CONFIRM]: { text: "待确认", color: "orange" },
  [OrderStatus.PENDING_REVIEW]: { text: "待审核", color: "orange" },
  [OrderStatus.REJECTED]: { text: "已驳回", color: "red" },
  [OrderStatus.CONFIRMED]: { text: "已确认", color: "blue" },
  [OrderStatus.PROCESSING]: { text: "处理中", color: "purple" },
  [OrderStatus.STOCK_LOCKED]: { text: "已锁库", color: "blue" },
  [OrderStatus.OUT_OF_STOCK]: { text: "库存不足", color: "red" },
  [OrderStatus.PENDING_SCHEDULE]: { text: "待排期", color: "orange" },
  [OrderStatus.SCHEDULED]: { text: "已排期", color: "cyan" },
  [OrderStatus.PRODUCING]: { text: "制作中", color: "purple" },
  [OrderStatus.PRODUCED]: { text: "制作完成", color: "green" },
  [OrderStatus.PENDING_SHIPMENT]: { text: "待发货", color: "orange" },
  [OrderStatus.SHIPPED]: { text: "已发货", color: "green" },
  [OrderStatus.COMPLETED]: { text: "已完成", color: "green" },
  [OrderStatus.CANCELLED]: { text: "已取消", color: "grey" },
};

const nextStatusMap: Record<OrderType, Partial<Record<OrderStatus, OrderStatus[]>>> = {
  [OrderType.STANDARD]: {
    [OrderStatus.PENDING_CONFIRM]: [
      OrderStatus.CONFIRMED,
      OrderStatus.REJECTED,
      OrderStatus.OUT_OF_STOCK,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.PENDING_REVIEW]: [
      OrderStatus.CONFIRMED,
      OrderStatus.REJECTED,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.CONFIRMED]: [
      OrderStatus.PROCESSING,
      OrderStatus.STOCK_LOCKED,
      OrderStatus.PENDING_SHIPMENT,
      OrderStatus.OUT_OF_STOCK,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.PROCESSING]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
    [OrderStatus.STOCK_LOCKED]: [OrderStatus.PENDING_SHIPMENT, OrderStatus.CANCELLED],
    [OrderStatus.OUT_OF_STOCK]: [OrderStatus.PENDING_SCHEDULE, OrderStatus.CANCELLED],
    [OrderStatus.PENDING_SCHEDULE]: [OrderStatus.SCHEDULED, OrderStatus.CANCELLED],
    [OrderStatus.SCHEDULED]: [OrderStatus.PRODUCING, OrderStatus.CANCELLED],
    [OrderStatus.PRODUCING]: [OrderStatus.PRODUCED, OrderStatus.CANCELLED],
    [OrderStatus.PRODUCED]: [OrderStatus.PENDING_SHIPMENT, OrderStatus.CANCELLED],
    [OrderStatus.PENDING_SHIPMENT]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED],
  },
  [OrderType.CUSTOM]: {
    [OrderStatus.PENDING_CONFIRM]: [
      OrderStatus.PENDING_REVIEW,
      OrderStatus.REJECTED,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.PENDING_REVIEW]: [
      OrderStatus.PENDING_SCHEDULE,
      OrderStatus.REJECTED,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.PENDING_SCHEDULE, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
    [OrderStatus.PENDING_SCHEDULE]: [OrderStatus.SCHEDULED, OrderStatus.CANCELLED],
    [OrderStatus.SCHEDULED]: [OrderStatus.PRODUCING, OrderStatus.CANCELLED],
    [OrderStatus.PRODUCING]: [OrderStatus.PRODUCED, OrderStatus.CANCELLED],
    [OrderStatus.PRODUCED]: [OrderStatus.PENDING_SHIPMENT, OrderStatus.CANCELLED],
    [OrderStatus.PENDING_SHIPMENT]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED],
  },
};

const enumToValueEnum = (map: Record<string, { text: string; color?: string }>) =>
  Object.fromEntries(Object.entries(map).map(([value, item]) => [value, item]));

const actionTextMap: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.PENDING_REVIEW]: "转审核",
  [OrderStatus.REJECTED]: "驳回",
  [OrderStatus.CONFIRMED]: "确认",
  [OrderStatus.PROCESSING]: "处理",
  [OrderStatus.STOCK_LOCKED]: "锁库",
  [OrderStatus.OUT_OF_STOCK]: "缺货",
  [OrderStatus.PENDING_SCHEDULE]: "排期",
  [OrderStatus.SCHEDULED]: "已排期",
  [OrderStatus.PRODUCING]: "生产",
  [OrderStatus.PRODUCED]: "生产完成",
  [OrderStatus.PENDING_SHIPMENT]: "待发货",
  [OrderStatus.SHIPPED]: "发货",
  [OrderStatus.COMPLETED]: "完成",
  [OrderStatus.CANCELLED]: "取消",
};

const needFlowFormStatuses = new Set<OrderStatus>([
  OrderStatus.SCHEDULED,
]);

const dangerStatuses = new Set<OrderStatus>([
  OrderStatus.REJECTED,
  OrderStatus.CANCELLED,
  OrderStatus.OUT_OF_STOCK,
]);

export default function OrdersPage() {
  const tableRef = useRef<ProDataTableRef>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [flowVisible, setFlowVisible] = useState(false);
  const [logsVisible, setLogsVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderRecord | null>(null);
  const [flowLoading, setFlowLoading] = useState(false);
  const [logs, setLogs] = useState<OrderFlowLog[]>([]);
  const { hasBtnAuth } = useBtnAuth();
  const canCreate = hasBtnAuth("tenant:order:create");
  const canUpdate = hasBtnAuth("tenant:order:update");
  const canDelete = hasBtnAuth("tenant:order:delete");
  const canFlow = hasBtnAuth("tenant:order:flow");

  const columns: ProColumnType<OrderRecord>[] = [
    {
      title: "订单号",
      dataIndex: "orderNumber",
      valueType: "text",
      width: 170,
    },
    {
      title: "来源",
      dataIndex: "source",
      valueType: "select",
      valueEnum: enumToValueEnum(sourceMap),
      render: (source: OrderSource) => (
        <Tag color={sourceMap[source]?.color as any}>{sourceMap[source]?.text || source}</Tag>
      ),
    },
    {
      title: "类型",
      dataIndex: "orderType",
      valueType: "select",
      valueEnum: enumToValueEnum(typeMap),
      render: (type: OrderType) => (
        <Tag color={typeMap[type]?.color as any}>{typeMap[type]?.text || type}</Tag>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      valueType: "select",
      valueEnum: enumToValueEnum(statusMap),
      render: (status: OrderStatus) => (
        <Tag color={statusMap[status]?.color as any}>
          {statusMap[status]?.text || status}
        </Tag>
      ),
    },
    {
      title: "客户",
      dataIndex: "customerKeyword",
      render: (_: unknown, record) => record.customerName || record.customerPhone || "-",
    },
    {
      title: "金额",
      dataIndex: "totalAmount",
      hideInSearch: true,
      render: (value: number) => `¥${Number(value || 0).toFixed(2)}`,
    },
    {
      title: "期望交期",
      dataIndex: "expectedDeliveryDate",
      hideInSearch: true,
      render: (value: string) => (value ? dayjs(value).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      hideInSearch: true,
      render: (value: string) => dayjs(value).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "操作",
      dataIndex: "action",
      hideInSearch: true,
      width: 360,
      render: (_: unknown, record) => {
        const nextStatuses = getNextStatuses(record);
        return (
        <Space wrap>
          <Button theme="borderless" onClick={() => openLogs(record)}>
            日志
          </Button>
          {nextStatuses.slice(0, 3).map((status) => (
            <Button
              key={status}
              theme="borderless"
              type={dangerStatuses.has(status) ? "danger" : "primary"}
              disabled={!canFlow}
              onClick={() => handleQuickFlow(record, status)}
            >
              {actionTextMap[status] || statusMap[status]?.text || status}
            </Button>
          ))}
          {nextStatuses.length > 3 && (
            <Button
              theme="borderless"
              disabled={!canFlow}
              onClick={() => {
                setCurrentOrder(record);
                setFlowVisible(true);
              }}
            >
              更多
            </Button>
          )}
          <Button
            theme="borderless"
            disabled={!canUpdate}
            onClick={() => {
              setCurrentOrder(record);
              setEditVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            theme="borderless"
            type="danger"
            disabled={!canDelete}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
        );
      },
    },
  ];

  function getNextStatuses(order: OrderRecord) {
    const next = nextStatusMap[order.orderType]?.[order.status] || [];
    if (order.source === OrderSource.MINIAPP) {
      return next.filter((status) => status !== OrderStatus.OUT_OF_STOCK);
    }
    return next;
  }

  function openCreate() {
    setCurrentOrder(null);
    setEditVisible(true);
  }

  async function openLogs(order: OrderRecord) {
    setCurrentOrder(order);
    const res = await OrderApi.getOrderLogs(order.id);
    setLogs(res.data || []);
    setLogsVisible(true);
  }

  async function handleDelete(order: OrderRecord) {
    Modal.confirm({
      title: `删除订单「${order.orderNumber}」？`,
      content: "仅待确认、待审核、已驳回或已取消的订单可删除。",
      onOk: async () => {
        await OrderApi.deleteOrder(order.id);
        Toast.success("删除成功");
        tableRef.current?.reload();
      },
    });
  }

  async function handleSave(values: any) {
    const payload = {
      ...values,
      expectedDeliveryDate: values.expectedDeliveryDate
        ? dayjs(values.expectedDeliveryDate).format("YYYY-MM-DD")
        : undefined,
    };
    if (currentOrder?.id) {
      await OrderApi.updateOrder(currentOrder.id, payload);
    } else {
      await OrderApi.saveOrder(payload);
    }
    Toast.success("保存成功");
    setEditVisible(false);
    tableRef.current?.reload();
  }

  async function handleFlow(values: any) {
    if (!currentOrder) return;
    setFlowLoading(true);
    try {
      await OrderApi.updateOrderStatus(currentOrder.id, {
        status: values.status,
        remark: values.remark,
        scheduledStartDate: values.scheduledStartDate
          ? dayjs(values.scheduledStartDate).format("YYYY-MM-DD")
          : undefined,
        scheduledEndDate: values.scheduledEndDate
          ? dayjs(values.scheduledEndDate).format("YYYY-MM-DD")
          : undefined,
      });
      Toast.success("流转成功");
      setFlowVisible(false);
      tableRef.current?.reload();
    } finally {
      setFlowLoading(false);
    }
  }

  async function doFlow(order: OrderRecord, status: OrderStatus, extra?: {
    remark?: string;
    scheduledStartDate?: string;
    scheduledEndDate?: string;
  }) {
    await OrderApi.updateOrderStatus(order.id, {
      status,
      remark: extra?.remark,
      scheduledStartDate: extra?.scheduledStartDate,
      scheduledEndDate: extra?.scheduledEndDate,
    });
    Toast.success("流转成功");
    tableRef.current?.reload();
  }

  function handleQuickFlow(order: OrderRecord, status: OrderStatus) {
    if (needFlowFormStatuses.has(status)) {
      setCurrentOrder(order);
      setFlowVisible(true);
      return;
    }

    const actionText = actionTextMap[status] || statusMap[status]?.text || status;
    if (dangerStatuses.has(status) || status === OrderStatus.COMPLETED) {
      Modal.confirm({
        title: `${actionText}订购单「${order.orderNumber}」？`,
        content: status === OrderStatus.CANCELLED || status === OrderStatus.REJECTED
          ? "该操作会释放小程序订购单已锁定库存。"
          : "请确认订单状态流转无误。",
        onOk: () => doFlow(order, status),
      });
      return;
    }

    doFlow(order, status);
  }

  return (
    <>
      <ProDataTable
        ref={tableRef}
        title="订购管理"
        api={OrderApi.getOrderPage}
        columns={columns}
        toolBarRender={() => (
          <Button icon={<IconPlus />} theme="solid" disabled={!canCreate} onClick={openCreate}>
            新增订购单
          </Button>
        )}
      />

      <Modal
        title={currentOrder ? "编辑订购单" : "新增订购单"}
        visible={editVisible}
        onCancel={() => setEditVisible(false)}
        footer={null}
        width={620}
      >
        <Form
          labelPosition="left"
          labelWidth={100}
          initValues={
            currentOrder
              ? {
                  ...currentOrder,
                  expectedDeliveryDate: currentOrder.expectedDeliveryDate
                    ? new Date(currentOrder.expectedDeliveryDate)
                    : undefined,
                }
              : {
                  source: OrderSource.ADMIN,
                  orderType: OrderType.STANDARD,
                }
          }
          onSubmit={handleSave}
        >
          <Form.Input field="orderNumber" label="订单号" placeholder="不填则自动生成" />
          <Form.Select field="source" label="订单来源" style={{ width: "100%" }}>
            {Object.entries(sourceMap).map(([value, item]) => (
              <Form.Select.Option key={value} value={value}>
                {item.text}
              </Form.Select.Option>
            ))}
          </Form.Select>
          <Form.Select field="orderType" label="订单类型" style={{ width: "100%" }}>
            {Object.entries(typeMap).map(([value, item]) => (
              <Form.Select.Option key={value} value={value}>
                {item.text}
              </Form.Select.Option>
            ))}
          </Form.Select>
          <Form.Input field="customerName" label="客户名称" placeholder="请输入客户名称" />
          <Form.Input field="customerPhone" label="联系电话" placeholder="请输入联系电话" />
          <Form.Input field="customerEmail" label="邮箱" placeholder="请输入邮箱" />
          <Form.Input field="customerAddress" label="地址" placeholder="请输入地址" />
          <Form.InputNumber field="totalAmount" label="订单金额" min={0} style={{ width: "100%" }} />
          <Form.DatePicker field="expectedDeliveryDate" label="期望交期" style={{ width: "100%" }} />
          <Form.TextArea field="remark" label="备注" rows={3} />
          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={() => setEditVisible(false)}>取消</Button>
              <Button theme="solid" type="primary" htmlType="submit">
                保存
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <Modal
        title={`订单流转${currentOrder ? `：${currentOrder.orderNumber}` : ""}`}
        visible={flowVisible}
        onCancel={() => setFlowVisible(false)}
        footer={null}
        width={560}
      >
        <Form labelPosition="left" labelWidth={100} onSubmit={handleFlow}>
          <Form.Select
            field="status"
            label="下一状态"
            rules={[{ required: true, message: "请选择下一状态" }]}
            style={{ width: "100%" }}
          >
            {(currentOrder ? getNextStatuses(currentOrder) : []).map((status) => (
              <Form.Select.Option key={status} value={status}>
                {statusMap[status]?.text || status}
              </Form.Select.Option>
            ))}
          </Form.Select>
          <Form.DatePicker field="scheduledStartDate" label="计划开始" style={{ width: "100%" }} />
          <Form.DatePicker field="scheduledEndDate" label="计划结束" style={{ width: "100%" }} />
          <Form.TextArea field="remark" label="流转备注" rows={3} />
          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={() => setFlowVisible(false)}>取消</Button>
              <Button theme="solid" type="primary" htmlType="submit" loading={flowLoading}>
                确认流转
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <Modal
        title={`流转日志${currentOrder ? `：${currentOrder.orderNumber}` : ""}`}
        visible={logsVisible}
        onCancel={() => setLogsVisible(false)}
        footer={null}
        width={640}
      >
        <Timeline>
          {logs.map((log) => (
            <Timeline.Item
              key={log.id}
              time={dayjs(log.createdAt).format("YYYY-MM-DD HH:mm")}
            >
              <div>
                {log.fromStatus ? `${statusMap[log.fromStatus]?.text || log.fromStatus} -> ` : ""}
                {statusMap[log.toStatus]?.text || log.toStatus}
              </div>
              {log.remark ? <div style={{ color: "#666", marginTop: 4 }}>{log.remark}</div> : null}
            </Timeline.Item>
          ))}
        </Timeline>
      </Modal>
    </>
  );
}

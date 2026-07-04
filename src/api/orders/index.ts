import request, { getDownload } from "@/utils/request";
import {
  OrderFlowLog,
  OrderRecord,
  OrderStatus,
  QueryOrder,
  SaveOrder,
} from "./types";

const orderExportFileName = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `order-list-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.xlsx`;
};

const OrderApi = {
  getOrderPage: (params: QueryOrder) =>
    request.get<{
      list: OrderRecord[];
      total: number;
      page: number;
      pageSize: number;
    }>("orders", { params }),

  getOrderDetail: (id: string) => request.get<OrderRecord>(`orders/${id}`),

  saveOrder: (data: SaveOrder) => request.post<OrderRecord>("orders", data),

  updateOrder: (id: string, data: SaveOrder) =>
    request.patch<OrderRecord>(`orders/${id}`, data),

  updateOrderStatus: (
    id: string,
    data: {
      status: OrderStatus;
      remark?: string;
      scheduledStartDate?: string;
      scheduledEndDate?: string;
    },
  ) => request.post<OrderRecord>(`orders/${id}/status`, data),

  getOrderLogs: (id: string) => request.get<OrderFlowLog[]>(`orders/${id}/logs`),

  deleteOrder: (id: string) => request.delete(`orders/${id}`),

  exportOrderItems: (params: QueryOrder) =>
    getDownload("orders/export", params, orderExportFileName()),
};

export default OrderApi;

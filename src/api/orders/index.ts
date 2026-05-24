import request from "@/utils/request";
import {
  OrderFlowLog,
  OrderRecord,
  OrderStatus,
  QueryOrder,
  SaveOrder,
} from "./types";

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
};

export default OrderApi;

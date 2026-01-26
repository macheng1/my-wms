import request from "@/utils/request";
import { IInventoryAlert, IQueryAlert } from "./types";

/**
 * 库存预警 (Alerts) API 服务
 */
const AlertApi = {
  /**
   * 查询库存预警列表
   */
  getAlerts: (params: IQueryAlert) =>
    request.get<{
      list: IInventoryAlert[];
      total: number;
      page: number;
      pageSize: number;
    }>("inventory/alerts", { params }),

  /**
   * 标记预警为已解决
   */
  resolveAlert: (id: string) => request.post("inventory/alerts/resolve", { id }),

  /**
   * 批量标记预警为已解决
   */
  batchResolveAlerts: (ids: string[]) => request.post("inventory/alerts/resolve-batch", { ids }),
};

export default AlertApi;

import request from "@/utils/request";
import {
  IOutboundRequest,
  IBatchOutboundRequest,
  IOutboundRecord,
  IOutboundResponse,
  IQueryOutboundRecord,
} from "./types";

/**
 * 出库管理 (Outbound) API 服务
 */
const OutboundApi = {
  /**
   * 单个出库操作
   */
  outbound: (data: IOutboundRequest) =>
    request.post<IOutboundResponse>("inventory/outbound", data),

  /**
   * 批量出库操作
   */
  batchOutbound: (data: IBatchOutboundRequest) =>
    request.post<IOutboundResponse[]>("inventory/outbound/batch", data),

  /**
   * 查询出库记录
   */
  getOutboundLogs: (params: IQueryOutboundRecord) =>
    request.get<{
      list: IOutboundRecord[];
      total: number;
      page: number;
      pageSize: number;
    }>("inventory/outbound", { params }),
};

export default OutboundApi;

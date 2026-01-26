import request from "@/utils/request";
import {
  IInboundRequest,
  IBatchInboundRequest,
  IInboundRecord,
  IInboundResponse,
  IQueryInboundRecord,
} from "./types";

/**
 * 入库管理 (Inbound) API 服务
 */
const InboundApi = {
  /**
   * 单个入库操作
   */
  inbound: (data: IInboundRequest) =>
    request.post<IInboundResponse>("inventory/inbound", data),

  /**
   * 批量入库操作
   */
  batchInbound: (data: IBatchInboundRequest) =>
    request.post<IInboundResponse[]>("inventory/inbound/batch", data),

  /**
   * 查询入库记录
   */
  getInboundLogs: (params: IQueryInboundRecord) =>
    request.get<{
      list: IInboundRecord[];
      total: number;
      page: number;
      pageSize: number;
    }>("inventory/inbound", { params }),
};

export default InboundApi;

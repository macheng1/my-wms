import request from "@/utils/request";
import {
  IInventory,
  IQueryInventory,
  IAdjustRequest,
  IAdjustResponse,
  IAvailableOutboundProduct,
  IQueryAvailableOutbound,
} from "./types";

/**
 * 库存管理 (Inventory) API 服务
 */
const InventoryApi = {
  /**
   * 分页查询库存列表
   */
  getInventoryPage: (params: IQueryInventory) =>
    request.get<{
      list: IInventory[];
      total: number;
      page: number;
      pageSize: number;
    }>("inventory/page", { params }),

  /**
   * 获取库存详情
   */
  getInventoryDetail: (sku: string) =>
    request.get<IInventory>("inventory/detail", { params: { sku } }),

  /**
   * 按SKU获取库存
   */
  getInventoryBySku: (sku: string) =>
    request.get<IInventory>(`inventory/sku/${sku}`),

  /**
   * 库存调整
   * @param data 调整参数（正数增加，负数减少）
   */
  adjust: (data: IAdjustRequest) =>
    request.post<IAdjustResponse>("inventory/adjust", data),

  /**
   * 获取可用于出库的产品列表
   */
  getAvailableForOutbound: (params?: IQueryAvailableOutbound) =>
    request.get<IAvailableOutboundProduct[]>("inventory/available-for-outbound", {
      params,
    }),
};

export default InventoryApi;

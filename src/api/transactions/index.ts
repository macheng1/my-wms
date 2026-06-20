import request, { getDownload } from "@/utils/request";
import { IInventoryTransaction, IQueryTransaction } from "./types";

/**
 * 库存交易记录 (Transactions) API 服务
 */
const TransactionApi = {
  /**
   * 查询库存流水
   */
  getTransactions: (params: IQueryTransaction) =>
    request.get<{
      list: IInventoryTransaction[];
      total: number;
      page: number;
      pageSize: number;
    }>("inventory/transactions", { params }),

  /**
   * 按SKU查询库存流水
   */
  getTransactionsBySku: (sku: string, params?: { page?: number; pageSize?: number }) =>
    request.get<IInventoryTransaction[]>(`inventory/${sku}/transactions`, { params }),

  /**
   * 导出库存流水 Excel（按当前筛选条件，下载文件）
   */
  exportTransactions: (params: IQueryTransaction) =>
    getDownload("inventory/transactions/export", params),
};

export default TransactionApi;

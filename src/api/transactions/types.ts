/**
 * 交易类型枚举
 */
export enum TransactionType {
  // 入库类型
  INBOUND_PURCHASE = "INBOUND_PURCHASE",
  INBOUND_RETURN = "INBOUND_RETURN",
  INBOUND_TRANSFER = "INBOUND_TRANSFER",
  INBOUND_PRODUCTION = "INBOUND_PRODUCTION",
  // 出库类型
  OUTBOUND_SALES = "OUTBOUND_SALES",
  OUTBOUND_MATERIAL = "OUTBOUND_MATERIAL",
  OUTBOUND_TRANSFER = "OUTBOUND_TRANSFER",
  OUTBOUND_SCRAP = "OUTBOUND_SCRAP",
  // 调整类型
  ADJUSTMENT_IN = "ADJUSTMENT_IN",
  ADJUSTMENT_OUT = "ADJUSTMENT_OUT",
}

/**
 * 库存交易记录
 */
export interface IInventoryTransaction {
  id: string;
  tenantId: string;
  sku: string;
  productName?: string;
  transactionType: TransactionType;
  quantity: number;
  unitId: string;
  unitCode?: string;
  unitName?: string;
  beforeQty: number;
  afterQty: number;
  orderNo?: string;
  location?: string;
  remark?: string;
  createdAt: string;
}

/**
 * 交易记录查询参数
 */
export interface IQueryTransaction {
  page?: number;
  pageSize?: number;
  sku?: string;
  keyword?: string;
  transactionType?: TransactionType;
  startDate?: string;
  endDate?: string;
}

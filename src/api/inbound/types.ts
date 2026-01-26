/**
 * 入库类型枚举
 */
export enum InboundType {
  PURCHASE = "INBOUND_PURCHASE", // 采购入库
  RETURN = "INBOUND_RETURN", // 退货入库
  TRANSFER = "INBOUND_TRANSFER", // 调拨入库
  PRODUCTION = "INBOUND_PRODUCTION", // 生产入库
  ADJUSTMENT_IN = "ADJUSTMENT_IN", // 盘盈
}

/**
 * 入库明细项
 */
export interface IInboundItem {
  sku: string;
  quantity: number;
  unitCode: string;
  location?: string;
}

/**
 * 入库请求
 */
export interface IInboundRequest {
  sku?: string;
  quantity: number;
  unitCode: string;
  orderNo?: string;
  location?: string;
  type: InboundType;
  remark?: string;
  items?: IInboundItem[];
}

/**
 * 批量入库请求
 */
export interface IBatchInboundRequest {
  orderNo?: string;
  location?: string;
  type: InboundType;
  remark?: string;
  items: IInboundItem[];
}

/**
 * 单位信息
 */
export interface IUnitInfo {
  id: string;
  code: string;
  name: string;
  category: string;
  baseRatio: number;
  baseUnitCode: string;
  symbol: string;
}

/**
 * 入库响应
 */
export interface IInboundResponse {
  sku: string;
  productName: string;
  beforeQty: number;
  afterQty: number;
  unit: IUnitInfo;
  transactionId: string;
}

/**
 * 入库记录
 */
export interface IInboundRecord {
  id: string;
  tenantId: string;
  orderNo?: string;
  type: InboundType;
  sku: string;
  productName?: string;
  quantity: number;
  unitId: string;
  unitCode?: string;
  location?: string;
  beforeQty: number;
  afterQty: number;
  remark?: string;
  createdAt: string;
}

/**
 * 入库记录查询参数
 */
export interface IQueryInboundRecord {
  page?: number;
  pageSize?: number;
  keyword?: string;
  type?: InboundType;
  startDate?: string;
  endDate?: string;
  sku?: string;
}

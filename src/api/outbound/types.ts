/**
 * 出库类型枚举
 */
export enum OutboundType {
  SALES = "OUTBOUND_SALES", // 销售出库
  MATERIAL = "OUTBOUND_MATERIAL", // 领料出库
  TRANSFER = "OUTBOUND_TRANSFER", // 调拨出库
  SCRAP = "OUTBOUND_SCRAP", // 报废出库
  ADJUSTMENT_OUT = "ADJUSTMENT_OUT", // 盘亏
}

/**
 * 出库明细项
 */
export interface IOutboundItem {
  sku: string;
  quantity: number;
  unitCode?: string;
  locationId?: string;
}

/**
 * 出库请求
 */
export interface IOutboundRequest {
  sku?: string;
  quantity: number;
  unitCode?: string;
  orderNo?: string;
  locationId?: string;
  type: OutboundType;
  remark?: string;
  items?: IOutboundItem[];
  /** 通知的用户 ID 列表（用于发送库存变更通知） */
  notifyUserIds?: string[];
}

/**
 * 批量出库请求
 */
export interface IBatchOutboundRequest {
  orderNo?: string;
  locationId?: string;
  type: OutboundType;
  remark?: string;
  items: IOutboundItem[];
  /** 通知的用户 ID 列表（用于发送库存变更通知） */
  notifyUserIds?: string[];
}

/**
 * 单位信息
 */
export interface IUnitInfo {
  id: string;
  code: string;
  name: string;
  category: string;
  symbol: string;
}

/**
 * 出库响应
 */
export interface IOutboundResponse {
  sku: string;
  productName: string;
  beforeQty: number;
  afterQty: number;
  unit: IUnitInfo;
  transactionId: string;
}

/**
 * 出库记录
 */
export interface IOutboundRecord {
  id: string;
  tenantId: string;
  orderNo?: string;
  type: OutboundType;
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
 * 出库记录查询参数
 */
export interface IQueryOutboundRecord {
  page?: number;
  pageSize?: number;
  keyword?: string;
  type?: OutboundType;
  startDate?: string;
  endDate?: string;
  sku?: string;
}

/**
 * 库存实体接口
 */
export interface IInventory {
  id: string;
  tenantId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitId: string;
  unit?: {
    id: string;
    name: string;
    code: string;
    symbol?: string;
  };
  location?: string;
  multiUnitQty?: Record<string, number>;
  safetyStock?: number;
  isLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 库存调整请求
 */
export interface IAdjustRequest {
  sku: string;
  quantity: number; // 正数增加，负数减少
  unitCode: string;
  reason: string; // 调整原因
  remark?: string; // 可选备注
  locationId?: string; // 可选库位ID
}

/**
 * 库存调整响应
 */
export interface IAdjustResponse {
  sku: string;
  productName: string;
  beforeQty: number;
  afterQty: number;
  unit: {
    id: string;
    code: string;
    name: string;
    category: string;
    baseRatio: number;
    baseUnitCode: string;
    symbol: string;
  };
  transactionId: string;
}

/**
 * 可用于出库的产品
 */
export interface IAvailableOutboundProduct {
  value: string;
  label: string;
  sku: string;
  productName: string;
  quantity: number;
  unitName: string;
  unitSymbol: string;
}

/**
 * 可用于出库的产品查询参数
 */
export interface IQueryAvailableOutbound {
  keyword?: string;
}

/**
 * 库存查询参数
 */
export interface IQueryInventory {
  page?: number;
  pageSize?: number;
  keyword?: string;
  sku?: string;
  categoryId?: string;
  location?: string;
  isLowStock?: boolean;
}

/**
 * 库存实体接口
 */
export interface IInventory {
  id: string;
  tenantId: string;
  sku: string;
  productName: string;
  quantity: number;
  quantityDisplay?: string;
  lockedQuantity?: number;
  lockedQuantityDisplay?: string;
  availableQuantity?: number;
  availableQuantityDisplay?: string;
  unitId: string;
  unitName?: string;
  unitCode?: string;
  unitCategory?: string;
  unitSymbol?: string;
  unit?: {
    id: string;
    name: string;
    code: string;
    symbol?: string;
  };
  location?: string;
  safetyStock?: number;
  isLowStock?: boolean;
  stockStatus?: "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK";
  createdAt: string;
  updatedAt: string;
}

/**
 * 库存调整请求
 */
export interface IAdjustRequest {
  sku: string;
  quantity: number; // 正数增加，负数减少
  unitCode?: string;
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
  unitCode?: string;
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
  stockStatus?: "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK";
  // 是否只查绑定过库位的产品，默认 true；传 false 查全部
  onlyLocationBound?: boolean;
}

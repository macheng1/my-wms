/**
 * 库位类型枚举
 */
export enum LocationType {
  STORAGE = "STORAGE", // 存储区
  PICKING = "PICKING", // 拣货区
  TEMP = "TEMP", // 暂存区
  RECEIVING = "RECEIVING", // 收货区
  SHIPPING = "SHIPPING", // 发货区
  DEFECT = "DEFECT", // 次品区
  RETURN = "RETURN", // 退货区
}

/**
 * 库位状态枚举
 */
export enum LocationStatus {
  AVAILABLE = "AVAILABLE", // 可用
  OCCUPIED = "OCCUPIED", // 已占用
  LOCKED = "LOCKED", // 锁定
  RESERVED = "RESERVED", // 预留
  DISABLED = "DISABLED", // 禁用
}

/**
 * 库位信息
 */
export interface Location {
  id: string;
  tenantId: string;
  code: string; // 库位编码：A01-01-01-03
  name: string; // 库位名称
  warehouse: string; // 仓库编码
  area: string; // 区域编码
  shelf?: string; // 货架号
  level?: string; // 层号
  position?: string; // 位号
  type: LocationType;
  status: LocationStatus;
  capacity?: number; // 容量限制
  capacityUnit?: string; // 容量单位
  dimensions?: {
    // 尺寸（预留硬件集成）
    length: number;
    width: number;
    height: number;
  };
  coordinates?: {
    // 物理坐标（预留硬件集成，AGV导航）
    x: number;
    y: number;
    z: number;
  };
  deviceIds?: string[]; // 绑定的设备ID列表（预留）
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationStockItem {
  sku: string;
  productName: string;
  quantity: number;
  lockedQuantity: number;
  availableQuantity: number;
  unitId?: string;
  unitName?: string;
  unitSymbol?: string;
}

export interface LocationVisualItem extends Location {
  stockItems: LocationStockItem[];
  skuCount: number;
  totalQuantity: number;
  hasStock: boolean;
  matched: boolean;
}

export interface LocationVisualMapResponse {
  warehouses: Array<{ value: string; label: string }>;
  areas: Array<{ value: string; label: string; warehouse: string }>;
  locations: LocationVisualItem[];
  summary: {
    totalLocations: number;
    occupiedLocations: number;
    emptyLocations: number;
    disabledLocations: number;
    matchedLocations: number;
  };
}

export interface LocationVisualMapParams {
  warehouse?: string;
  area?: string;
  keyword?: string;
}

export interface LocationLightTask {
  id: string;
  tenantId: string;
  locationId: string;
  locationCode: string;
  deviceCode?: string;
  deviceUrl?: string;
  ledIndex?: number;
  action: "ON" | "OFF";
  status: "PENDING" | "SUCCESS" | "FAILED";
  duration: number;
  color: string;
  payload?: Record<string, any>;
  errorMessage?: string;
  executedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建库位请求
 */
export interface CreateLocationRequest {
  code: string;
  name: string;
  warehouse: string;
  area: string;
  shelf?: string;
  level?: string;
  position?: string;
  type?: LocationType;
  status?: LocationStatus;
  capacity?: number;
  capacityUnit?: string;
  dimensions?: { length: number; width: number; height: number };
  coordinates?: { x: number; y: number; z: number };
  remark?: string;
}

/**
 * 更新库位请求（所有字段可选）
 */
export type UpdateLocationRequest = Partial<CreateLocationRequest>;

/**
 * 库位查询参数
 */
export interface LocationQueryParams {
  page?: number;
  pageSize?: number;
  code?: string;
  warehouse?: string;
  area?: string;
  type?: LocationType;
  status?: LocationStatus;
  keyword?: string;
}

/**
 * 库位分页列表响应
 */
export interface LocationPageResponse {
  list: Location[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 批量创建库位请求
 */
export interface BatchCreateLocationsRequest {
  warehouse: string;
  area: string;
  shelfStart: number;
  shelfEnd: number;
  levels: number;
  positions: number;
}

/**
 * 下拉选择库位选项
 */
export interface LocationSelectOption {
  value: string; // 库位ID
  label: string; // 显示文本：A01-01-01-03 - A01区01号货架1层3位
  code: string;
  name: string;
  warehouse: string;
  area: string;
  type: LocationType;
  status: LocationStatus;
  capacity?: number;
  usedCapacity?: number;
}

export interface LocationStockOption {
  value: string;
  label: string;
  code: string;
  name: string;
  quantity: number;
}

/**
 * 下拉选择库位请求参数
 */
export interface LocationSelectParams {
  keyword?: string;
  warehouse?: string;
  area?: string;
  type?: LocationType;
  status?: LocationStatus;
  limit?: number;
}

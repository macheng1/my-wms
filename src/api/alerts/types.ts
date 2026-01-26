/**
 * 预警级别枚举
 */
export enum AlertLevel {
  CRITICAL = "CRITICAL", // 严重 - 红色（零库存或库存<=0）
  HIGH = "HIGH", // 高 - 橙色（库存 < 安全库存*20%）
  MEDIUM = "MEDIUM", // 中 - 黄色（库存 < 安全库存*50%）
}

/**
 * 库存预警记录
 */
export interface IInventoryAlert {
  id: string;
  tenantId: string;
  sku: string;
  productName?: string;
  currentQty: number;
  safetyStock: number;
  unitId: string;
  unitCode?: string;
  unitName?: string;
  alertLevel: AlertLevel;
  alertMessage: string;
  location?: string;
  isResolved: 0 | 1;
  createdAt: string;
  updatedAt: string;
}

/**
 * 预警查询参数
 */
export interface IQueryAlert {
  page?: number;
  pageSize?: number;
  keyword?: string;
  alertLevel?: AlertLevel;
  isResolved?: 0 | 1;
}

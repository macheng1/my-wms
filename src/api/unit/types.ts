/**
 * 单位分类枚举
 */
export enum UnitCategory {
  COUNT = "COUNT", // 计数单位：个、根、支、箱、件
  WEIGHT = "WEIGHT", // 重量单位：kg、g、吨、斤、两
  LENGTH = "LENGTH", // 长度单位：m、cm、mm、英寸
  VOLUME = "VOLUME", // 体积单位：L、mL、m³
  AREA = "AREA", // 面积单位：m²、cm²、亩
  TIME = "TIME", // 时间单位：小时、天、月
}

/**
 * 单位实体接口
 */
export interface IUnit {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  category: UnitCategory;
  baseRatio: number;
  baseUnitCode: string;
  symbol?: string;
  description?: string;
  isActive: 1 | 0;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 单位保存/更新接口
 */
export interface ISaveUnit {
  id?: string;
  name: string;
  code?: string;
  category: UnitCategory;
  baseRatio: number;
  baseUnitCode: string;
  symbol?: string;
  description?: string;
  isActive?: 1 | 0;
  sortOrder?: number;
}

/**
 * 单位查询参数
 */
export interface IQueryUnit {
  page?: number;
  pageSize?: number;
  keyword?: string;
  category?: UnitCategory;
  isActive?: 1 | 0;
}

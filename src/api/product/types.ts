/**
 * 产品基础实体接口
 * 对应后端 Product Entity
 */
export interface IProduct {
  id: string;
  name: string;
  /** 自动生成的 SKU 编码 */
  code: string;
  /** 旧产品条形码；新流程使用 skus[].barcode */
  barcode?: string | null;
  categoryId: string;
  unitId?: string | null;
  unit?: string;
  unitCode?: string;
  unitName?: string;
  unitSymbol?: string;
  stockSummary?: {
    inventoryRows: number;
    transactionRows: number;
    quantity: number;
    lockedQuantity: number;
    availableQuantity: number;
    unitId?: string | null;
    unitCode?: string | null;
    unitName?: string | null;
    unitSymbol?: string | null;
  };
  canChangeUnit?: boolean;
  unitChangeLockedReason?: string | null;
  conversionRules?: Array<{
    id?: string;
    fromUnitCode: string;
    fromUnitName?: string;
    fromUnitSymbol?: string;
    toUnitCode: string;
    ratio: number;
  }>;
  /** * 动态规格数据 (MySQL JSON)
   * 结构如: { "ATTR_CZ": "304", "ATTR_ZJ": "1.5" }
   */
  specs?: Record<string, any>;
  skus?: IProductSku[];
  skuCount?: number;
  /** 产品多图数组 (MySQL JSON) */
  images: string[];
  safetyStock: number;
  isActive: 1 | 0;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  /** 关联查询出的类目信息 */
  category?: {
    id: string;
    name: string;
    code: string;
  };
}

/**
 * 产品保存/更新提交对象
 * 对称设计：详情接口返回的数据可直接用于此结构的赋值
 */
export interface ISaveProduct {
  id?: string;
  name: string;
  /** 如果不传，后端将根据类目+规格自动生成 */
  code?: string;
  /** 如果不传，后端默认等于 SKU 编码 */
  barcode?: string;
  categoryId: string;
  unitId?: string;
  unit?: string;
  /** 旧字段；新流程规格在 ProductSku 上维护 */
  specs?: Record<string, any>;
  /** 图片 URL 数组 */
  images?: string[];
  safetyStock?: number;
  isActive?: 1 | 0;
}

/**
 * 产品分页查询参数
 */
export interface IQueryProduct {
  page: number;
  pageSize: number;
  /** 模糊搜索关键词 (名称或编码) */
  keyword?: string;
  /** 类目过滤 */
  categoryId?: string;
  /** 状态过滤 */
  isActive?: 1 | 0;
}

/**
 * 产品下拉选项
 * 用于前端下拉选择组件
 */
export interface IProductSelectOption {
  /** 显示文本，格式：产品名称 (SKU编码) */
  label: string;
  /** SKU ID，用于提交 */
  value: string;
  skuId: string;
  productId: string;
  /** 产品ID（UUID） */
  id: string;
  /** 产品名称 */
  name: string;
  productName: string;
  /** 产品编码/SKU */
  code: string;
  skuCode: string;
  /** 产品条形码 */
  barcode?: string | null;
  specs?: Record<string, any>;
  safetyStock?: number;
  /** 产品库存单位 */
  unitCode?: string | null;
  unitName?: string | null;
  unitSymbol?: string | null;
  unitCategory?: string | null;
}

export interface IProductSku {
  id: string;
  skuId?: string;
  productId: string;
  productName?: string | null;
  skuCode: string;
  sku?: string;
  barcode?: string | null;
  specs: Record<string, any>;
  images?: string[];
  unitId: string;
  unitCode?: string | null;
  unitName?: string | null;
  unitSymbol?: string | null;
  safetyStock: number;
  isActive: 1 | 0;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISaveProductSku {
  id?: string;
  productId: string;
  skuCode?: string;
  barcode?: string;
  unitId: string;
  specs: Record<string, any>;
  images?: string[];
  safetyStock?: number;
  isActive?: 1 | 0;
}

/**
 * 产品下拉查询参数
 */
export interface IQueryProductSelect {
  /** 搜索关键词（产品名称或编码） */
  keyword?: string;
}

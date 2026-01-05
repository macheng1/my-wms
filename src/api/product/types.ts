/**
 * 产品基础实体接口
 * 对应后端 Product Entity
 */
export interface IProduct {
  id: string;
  name: string;
  /** 自动生成的 SKU 编码 */
  code: string;
  categoryId: string;
  unit?: string;
  /** * 动态规格数据 (MySQL JSON)
   * 结构如: { "ATTR_CZ": "304", "ATTR_ZJ": "1.5" }
   */
  specs: Record<string, any>;
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
  categoryId: string;
  unit?: string;
  /** 必填：需包含该类目绑定的所有属性值 */
  specs: Record<string, any>;
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

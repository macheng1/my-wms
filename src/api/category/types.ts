/**
 * @description 类目基础实体接口 (对应数据库 categories 表)
 * 包含基础元数据及多对多绑定的属性对象
 */
export interface ICategory {
  /** 类目唯一标识 (UUID) */
  id: string;
  /** 类目名称，如：引出棒、绝缘件 */
  name: string;
  /** 类目业务编码，用于系统逻辑唯一标识 */
  code: string;
  /** 状态：1 启用，0 禁用 */
  isActive: 1 | 0;
  /** 租户 ID，多租户隔离标识 */
  tenantId: string;
  /** 级联绑定的属性实体列表 (仅在详情或列表关联查询时存在) */
  attributes?: IAttributeBrief[];
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 属性简表接口：用于在类目详情中展示已绑定的属性 */
export interface IAttributeBrief {
  id: string;
  name: string;
  code: string;
  unit?: string;
}
/**
 * @description 类目保存/更新提交对象
 * 继承自 ICategory 的部分字段，并添加核心的 attributeIds 数组
 */
export interface ICategorySave {
  /** 更新时必传，新增时不传 */
  id?: string;
  /** 类目名称 */
  name: string;
  /** 类目编码 */
  code: string;
  /** 状态控制 */
  isActive: 1 | 0;
  /** 核心：绑定的属性 ID 集合，后端据此更新中间表 */
  attributeIds: string[];
}
/** @description 类目分页查询参数 */
export interface ICategoryQuery {
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 按名称模糊搜索 */
  name?: string;
  /** 按状态筛选 */
  isActive?: 1 | 0;
}
/** @description 类目详情返回对象 (完全对称 Save 接口) */
export interface ICategoryDetail extends ICategory {
  /** * 将 attributes 实体数组扁平化为 ID 数组
   * 确保前端 form.setValues(data) 后，属性选择器能直接回显
   */
  attributeIds: string[];
}

// 属性列表项
export interface AttributeListItem {
  /** 属性ID */
  id: string;
  /** 属性名称 */
  name: string;
  /** 属性编码 */
  code: string;
  /** 输入类型 */
  type: string;
  /** 单位（可选） */
  unit?: string;
  /** 状态（1=启用，0=禁用） */
  isActive: number;
}

// 规格选项（如需补充字段请提供后端定义）
export interface AttributeOption {
  /** 选项ID */
  id: string;
  /** 选项名称 */
  name: string;
  /** 选项值 */
  value: string;
  // ...可根据实际后端结构补充字段
}

// 属性详情
export interface AttributeDetail {
  /** 属性ID */
  id: string;
  /** 属性名称 */
  name: string;
  /** 属性编码 */
  code: string;
  /** 输入类型 */
  type: string;
  /** 单位（可选） */
  unit?: string;
  /** 状态（1=启用，0=禁用） */
  isActive: number;
  /** 规格选项列表 */
  options: AttributeOption[];
}

// 属性查询参数
export interface QueryAttribute {
  /** 页码，默认 1 */
  page?: number;
  /** 每页条数，默认 20 */
  pageSize?: number;
  /** 属性名称模糊搜索 */
  name?: string;
  /** 属性编码模糊搜索 */
  code?: string;
  /** 状态筛选 */
  isActive?: number;
}

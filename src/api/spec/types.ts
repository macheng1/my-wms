/**
 * @description 属性简要信息 (用于关联展示)
 * 在规格列表页中，通常需要显示该规格所属的属性名称和单位
 */
export interface IAttributeBrief {
  /** 属性唯一标识 (UUID) */
  id: string;
  /** 属性显示名称，如：材质、直径 */
  name: string;
  /** 业务标识码，用于系统逻辑识别及 JSONB 查询 (如：ATTR_CZ_7A2B) */
  code: string;
  /** 计量单位，如：mm, kg, 支 */
  unit?: string;
}

/**
 * @description 规格值核心实体 (对应数据库 attribute_options 表)
 * 遵循“入参即出参”原则，详情返回结构与保存提交结构高度对称
 */
export interface IAttributeOption {
  /** 规格唯一标识 (UUID)，新增时不传，更新时必传 */
  id: string;
  /** 所属属性 ID，用于建立主从关联 */
  attributeId: string;
  /** 具体规格内容，如 "304"、"12.5" */
  value: string;
  /** 排序号，值越小越靠前，用于前端下拉框或表格展示顺序 */
  sort: number;
  /** 状态：1 启用，0 禁用。禁用后的规格在录入产品时不可见 */
  isActive: 1 | 0;
  /** 租户 ID，用于多厂家数据物理隔离 */
  tenantId: string;
  /** 级联对象：所属属性的简要信息，仅在列表查询 relations 开启时返回 */
  attribute?: IAttributeBrief;
  /** 创建时间，后端统一按此字段正序 (ASC) 返回列表 */
  createdAt: string;
  /** 最后更新时间 */
  updatedAt: string;
}

/**
 * @description 分页查询参数
 * 支持按属性归类筛选及规格值模糊搜索
 */
export interface IOptionQuery {
  /** 当前页码，从 1 开始 */
  page: number;
  /** 每页记录数，建议默认 20 */
  pageSize: number;
  /** 筛选：指定属性 ID，从属性管理页面跳转时必传 */
  attributeId?: string;
  /** 筛选：规格值模糊搜索关键字 */
  value?: string;
  /** 筛选：规格状态 (1-启用, 0-禁用) */
  isActive?: 1 | 0;
}

/**
 * @description 规格保存/更新提交对象
 * 采用 Partial 封装，复用实体定义，确保编辑回显时无损传输
 */
export interface IOptionSave extends Partial<IAttributeOption> {
  /** 关联属性 ID，保存时必传 */
  attributeId: string;
  /** 规格内容，保存时必传 */
  value: string;
}

/**
 * @description 批量保存对象 (工业品快速录入场景)
 * 适用于一次性录入一堆直径、长度等同维规格
 */
export interface IBatchOptionSave {
  /** 目标属性 ID */
  attributeId: string;
  /** 规格值字符串数组，后端负责自动去重并执行插入 */
  values: string[];
}

/**
 * @description 统一 API 响应格式
 */
export interface IApiResponse<T> {
  /** 状态码：200 成功，非 200 失败 */
  code: number;
  /** 响应业务数据 */
  data: T;
  /** 提示消息 */
  message: string;
  /** 服务器响应时间戳 */
  timestamp: string;
}

/**
 * @description 分页响应数据封装
 */
export interface IPageResponse<T> {
  /** 数据列表 */
  list: T[];
  /** 总记录数，用于前端计算分页器 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
}

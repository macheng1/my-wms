/**
 * 全局统一的响应结构
 */
export interface Result<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页数据通用结构（WMS 列表常用）
 */
export interface PageResult<T = any> {
  list: T[];
  total: number;
  pageSize: number;
  current: number;
}

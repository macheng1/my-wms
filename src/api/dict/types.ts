/**
 * 字典选项（用于 Select 组件）
 */
export interface DictOption {
  label: string;
  value: string;
  id: string;
}

/**
 * 字典实体
 */
export interface DictItem {
  id: string;
  tenantId: string | null;
  type: string;
  label: string;
  value: string;
  sort: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 获取字典选项参数
 */
export interface GetDictOptionsParams {
  type: string;
}

/**
 * 保存字典项参数
 */
export interface SaveDictParams {
  id?: string;
  type: string;
  label: string;
  value: string;
  sort?: number;
}

/**
 * 更新字典项参数
 */
export interface UpdateDictParams {
  id: string;
  type?: string;
  label?: string;
  value?: string;
  sort?: number;
  isActive?: number;
}

/**
 * 删除字典项参数
 */
export interface DeleteDictParams {
  id: string;
}

/**
 * 字典类型列表项（用于字典类型管理）
 */
export interface DictTypeItem {
  type: string;
  typeName: string;
  count: number;
}

/**
 * 字典列表查询参数
 */
export interface DictListParams {
  type?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 字典列表返回数据
 */
export interface DictListData {
  data: DictItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

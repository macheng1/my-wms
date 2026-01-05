export interface QueryRolePage {
  /** 当前页码，默认 1 */
  page?: number;
  /** 每页条数，默认 10 */
  pageSize?: number;
  /** 支持按角色名模糊搜索 */
  name?: string;
  isActive: number;
}
export interface CreateRole {
  /** 角色名称 */
  name: string;
  isActive: number;
  /** 备注，可选 */
  remark?: string;
  /** 权限码集合，对应前端 MENU_CONFIG 里的 code */
  permissionCodes: string[];
}

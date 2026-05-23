import request from "@/utils/request";
import { CreateRole, QueryRolePage } from "./types";
import { TenantMenuGrant } from "@/api/tenants/types";

/**
 * 角色 API
 */
const RoleAPI = {
  /** 获取所有激活角色下拉列表 */
  selectRoleList: () => request.post("/roles/selectRoleLists"),
  getOptions: () => request.get("/roles/options"),
  getMenuTree: () => request.get("/roles/menus/tree"),
  /** 更新角色启用状态 */
  updateRoleStatus: (id: string | number, isActive: number) =>
    request.post(`/roles/${id}/status`, { isActive }),
  /** 创建角色 */
  createRole: (data: CreateRole) => request.post("/roles/save", data),

  /** 获取角色列表 */
  getRoles: (params?: QueryRolePage) => request.get("/roles/page", { params }),

  /** 获取角色详情 */
  getRoleById: (id: string | number) => request.get(`/roles/${id}`),

  /** 删除角色 */
  deleteRole: (id: string | number) => request.post("/roles/delete", { id }),

  /** 更新角色 */
  updateRole: (id: string | number, data: CreateRole) =>
    request.post("/roles/save", { ...data, id }),

  /** 当前租户可分配菜单 */
  getTenantMenus: () => request.get<TenantMenuGrant>("/admin/tenant/menus"),
};

export default RoleAPI;

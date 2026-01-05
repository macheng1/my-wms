import request from "@/utils/request";
import { CreateRole, QueryRolePage } from "./types";

/**
 * 角色 API
 */
const RoleAPI = {
  /** 获取所有激活角色下拉列表 */
  selectRoleList: () => request.post("/roles/selectRoleLists"),
  /** 更新角色启用状态 */
  updateRoleStatus: (id: string | number, isActive: number) =>
    request.post(`/roles/${id}/status`, { isActive }),
  /** 创建角色 */
  createRole: (data: CreateRole) => request.post("/roles", data),

  /** 获取角色列表 */
  getRoles: (params?: QueryRolePage) => request.get("/roles", { params }),

  /** 获取角色详情 */
  getRoleById: (id: string | number) => request.get(`/roles/${id}`),

  /** 删除角色 */
  deleteRole: (id: string | number) => request.delete(`/roles/${id}`),

  /** 更新角色 */
  updateRole: (id: string | number, data: CreateRole) =>
    request.post(`/roles/${id}/update`, data),
};

export default RoleAPI;

import request from "@/utils/request";
import {
  PlatformMenu,
  PlatformRole,
  PlatformDashboard,
  TenantDashboard,
  OperationLog,
  QueryAuditLogParams,
  QueryPlatformMenuParams,
  PlatformUser,
  PlatformMenuTreeNode,
  QueryPlatformUserParams,
  SavePlatformMenuParams,
  SavePlatformRoleParams,
  SavePlatformUserParams,
} from "./types";

const AdminPlatformAPI = {
  getPlatformDashboard: () =>
    request.get<PlatformDashboard>("/admin/platform/dashboard"),

  getTenantDashboard: () =>
    request.get<TenantDashboard>("/admin/tenant/dashboard"),

  getMenus: () => request.get<PlatformMenu[]>("/admin/platform/menus"),

  getMenusPage: (params: QueryPlatformMenuParams) =>
    request.post<{
      list: PlatformMenu[];
      total: number;
      page: number;
      pageSize: number;
    }>("/admin/platform/menus/list", params),

  getMenuTree: () =>
    request.get<PlatformMenuTreeNode[]>("/admin/platform/menus/tree"),

  getMenuDetail: (id: string | number) =>
    request.get<PlatformMenu>(`/admin/platform/menus/${id}`),

  getRoles: () => request.get<PlatformRole[]>("/admin/platform/roles"),

  saveRole: (data: SavePlatformRoleParams) =>
    request.post<PlatformRole>("/admin/platform/roles/save", data),

  deleteRole: (id: string | number) =>
    request.post(`/admin/platform/roles/${id}/delete`),

  getUsers: (params: QueryPlatformUserParams) =>
    request.post<{
      list: PlatformUser[];
      total: number;
      page: number;
      pageSize: number;
    }>("/admin/platform/users/list", params),

  getUserDetail: (id: string | number) =>
    request.get<PlatformUser>(`/admin/platform/users/${id}`),

  saveUser: (data: SavePlatformUserParams) =>
    request.post<PlatformUser>("/admin/platform/users/save", data),

  resetUserPassword: (data: { userId: string | number; newPassword: string }) =>
    request.post("/admin/platform/users/reset", data),

  updateUserStatus: (id: string | number, isActive: number) =>
    request.post(`/admin/platform/users/${id}/status`, { isActive }),

  deleteUser: (id: string | number) =>
    request.post(`/admin/platform/users/${id}/delete`),

  saveMenu: (data: SavePlatformMenuParams) =>
    request.post<PlatformMenu>("/admin/platform/menus/save", data),

  deleteMenu: (id: string | number) =>
    request.post(`/admin/platform/menus/${id}/delete`),

  updateTenantLifecycle: (
    id: string | number,
    data: {
      lifecycleStatus?: "pending" | "active" | "rejected" | "disabled" | "expired";
      expiresAt?: string | null;
      auditRemark?: string | null;
      disabledReason?: string | null;
      isActive?: number;
      isApproved?: number;
    },
  ) => request.post(`/admin/platform/tenants/${id}/lifecycle`, data),

  getPlatformAuditLogs: (params: QueryAuditLogParams) =>
    request.post<{
      list: OperationLog[];
      total: number;
      page: number;
      pageSize: number;
    }>("/admin/platform/audit-logs", params),

  getTenantAuditLogs: (params: QueryAuditLogParams) =>
    request.post<{
      list: OperationLog[];
      total: number;
      page: number;
      pageSize: number;
    }>("/admin/tenant/audit-logs", params),
};

export default AdminPlatformAPI;

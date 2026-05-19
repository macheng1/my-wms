import request from "@/utils/request";
import {
  PlatformPermission,
  PlatformRole,
  PlatformDashboard,
  TenantDashboard,
  OperationLog,
  QueryAuditLogParams,
  PlatformUser,
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

  getMenus: () => request.get<PlatformPermission[]>("/admin/platform/menus"),

  getPermissions: () =>
    request.get<PlatformPermission[]>("/admin/platform/permissions"),

  getRoles: () => request.get<PlatformRole[]>("/admin/platform/roles"),

  saveRole: (data: SavePlatformRoleParams) =>
    request.post<PlatformRole>("/admin/platform/roles/save", data),

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

  updateUserStatus: (id: string | number, isActive: number) =>
    request.post(`/admin/platform/users/${id}/status`, { isActive }),

  saveMenu: (data: SavePlatformMenuParams) =>
    request.post<PlatformPermission>("/admin/platform/menus/save", data),

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

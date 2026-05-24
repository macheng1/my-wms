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
  QueryPlatformTemplateParams,
  SavePlatformMenuParams,
  SavePlatformRoleParams,
  SavePlatformUserParams,
  PlatformTemplateAttribute,
  PlatformTemplateCategory,
  PlatformTemplateUnit,
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

  getTemplateCategories: (params: QueryPlatformTemplateParams) =>
    request.post<{
      list: PlatformTemplateCategory[];
      total: number;
      page: number;
      pageSize: number;
    }>("/admin/platform/templates/categories/list", params),

  getTemplateCategoryDetail: (id: string | number) =>
    request.get<PlatformTemplateCategory>(`/admin/platform/templates/categories/${id}`),

  saveTemplateCategory: (data: Partial<PlatformTemplateCategory>) =>
    request.post<PlatformTemplateCategory>("/admin/platform/templates/categories/save", data),

  updateTemplateCategoryStatus: (id: string | number, isActive: number) =>
    request.post(`/admin/platform/templates/categories/${id}/status`, { isActive }),

  deleteTemplateCategory: (id: string | number) =>
    request.post(`/admin/platform/templates/categories/${id}/delete`),

  getTemplateAttributes: (params: QueryPlatformTemplateParams) =>
    request.post<{
      list: PlatformTemplateAttribute[];
      total: number;
      page: number;
      pageSize: number;
    }>("/admin/platform/templates/attributes/list", params),

  getTemplateAttributeDetail: (id: string | number) =>
    request.get<PlatformTemplateAttribute>(`/admin/platform/templates/attributes/${id}`),

  saveTemplateAttribute: (data: Partial<PlatformTemplateAttribute>) =>
    request.post<PlatformTemplateAttribute>("/admin/platform/templates/attributes/save", data),

  updateTemplateAttributeStatus: (id: string | number, isActive: number) =>
    request.post(`/admin/platform/templates/attributes/${id}/status`, { isActive }),

  deleteTemplateAttribute: (id: string | number) =>
    request.post(`/admin/platform/templates/attributes/${id}/delete`),

  getTemplateUnits: (params: QueryPlatformTemplateParams) =>
    request.post<{
      list: PlatformTemplateUnit[];
      total: number;
      page: number;
      pageSize: number;
    }>("/admin/platform/templates/units/list", params),

  getTemplateUnitDetail: (id: string | number) =>
    request.post<PlatformTemplateUnit>("/admin/platform/templates/units/detail", { id }),

  saveTemplateUnit: (data: Partial<PlatformTemplateUnit>) =>
    request.post<PlatformTemplateUnit>("/admin/platform/templates/units/save", data),

  updateTemplateUnitStatus: (id: string | number, isActive: number) =>
    request.post<PlatformTemplateUnit>("/admin/platform/templates/units/save", { id, isActive }),

  deleteTemplateUnit: (id: string | number) =>
    request.post(`/admin/platform/templates/units/${id}/delete`),
};

export default AdminPlatformAPI;

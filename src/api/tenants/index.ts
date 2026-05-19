import request from "@/utils/request";
import type {
  TenantListParams,
  TenantListData,
  TenantDetailParams,
  TenantDetailData,
  TenantDetailRaw,
  UpdateTenantParams,
  RegisterParams,
  TenantMenuGrant,
} from "./types";
import { Result, PageResult } from "../base";
import { flattenTenantDetail } from "./types";
import AdminPlatformAPI from "@/api/adminPlatform";

// 重新导出类型
export type { TenantDetailData };
export type { TenantBasicInfo, TenantIndustryInfo, TenantContactInfo, TenantAddressInfo, TenantFinanceInfo, TenantQualificationInfo, TenantBusinessInfo } from "./types";

/**
 * 租户管理 API
 */
const TenantsAPI = {
  /** 分页查询租户列表 */
  getTenantList: (params: TenantListParams) => {
    return request.post<Result<PageResult<TenantListData["data"]>>>("/admin/platform/tenants/list", {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
    });
  },

  /** 获取租户详情 */
  getTenantDetail: (data: TenantDetailParams) => {
    return request.get<TenantDetailRaw>(`/admin/platform/tenants/${data.id}`);
  },

  /** 当前登录租户的企业资料 */
  getCurrentTenantProfile: () => {
    return request.get<TenantDetailRaw>("/admin/tenant/profile");
  },

  /** 更新租户信息 */
  updateTenant: async (id: string, data: UpdateTenantParams): Promise<void> => {
    const flattened = flattenTenantDetail(data as Partial<TenantDetailData>);
    await request.patch(`/tenants/${id}`, flattened);
  },

  /** 当前登录租户保存自己的企业资料 */
  updateCurrentTenantProfile: async (data: UpdateTenantParams): Promise<void> => {
    const flattened = flattenTenantDetail(data as Partial<TenantDetailData>);
    await request.post("/admin/tenant/profile/save", flattened);
  },

  /** 删除租户 */
  deleteTenant: (id: string) => {
    return request.delete<Result<{ success: boolean }>>(`/tenants/${id}`);
  },

  /** 工厂入驻（注册） */
  onboard: (data: RegisterParams) => {
    return request.post<Result<any>>("/tenants/onboard", data);
  },

  /** 审核通过租户 */
  approveTenant: (id: string) => {
    return AdminPlatformAPI.updateTenantLifecycle(id, { lifecycleStatus: "active" });
  },

  /** 驳回并禁用租户 */
  rejectTenant: (id: string) => {
    return AdminPlatformAPI.updateTenantLifecycle(id, { lifecycleStatus: "rejected" });
  },

  /** 查询租户已授权菜单 */
  getTenantMenus: (id: string) => {
    return request.get<TenantMenuGrant>(`/admin/platform/tenants/${id}/menus`);
  },

  /** 保存租户菜单授权 */
  saveTenantMenus: (id: string, permissionCodes: string[]) => {
    return request.post<TenantMenuGrant>(`/admin/platform/tenants/${id}/menus/save`, {
      permissionCodes,
    });
  },
};

export default TenantsAPI;

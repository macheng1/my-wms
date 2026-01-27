import request from "@/utils/request";
import type {
  TenantListParams,
  TenantListData,
  TenantDetailParams,
  TenantDetailData,
  TenantDetailRaw,
  UpdateTenantParams,
  RegisterParams,
} from "./types";
import { Result, PageResult } from "../base";
import { transformTenantDetail, flattenTenantDetail } from "./types";

// 重新导出类型
export type { TenantDetailData };
export type { TenantBasicInfo, TenantIndustryInfo, TenantContactInfo, TenantAddressInfo, TenantFinanceInfo, TenantQualificationInfo, TenantBusinessInfo } from "./types";

/**
 * 租户管理 API
 */
const TenantsAPI = {
  /** 分页查询租户列表 */
  getTenantList: (params: TenantListParams) => {
    return request.post<Result<PageResult<TenantListData["data"]>>>("/tenants/list", {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
    });
  },

  /** 获取租户详情 */
  getTenantDetail: async (data: TenantDetailParams): Promise<TenantDetailData> => {
    const result = await request.post<any>("/tenants/detail", data);
    return transformTenantDetail(result.data as TenantDetailRaw);
  },

  /** 更新租户信息 */
  updateTenant: async (id: string, data: UpdateTenantParams): Promise<void> => {
    const flattened = flattenTenantDetail(data as Partial<TenantDetailData>);
    await request.patch(`/tenants/${id}`, flattened);
  },

  /** 删除租户 */
  deleteTenant: (id: string) => {
    return request.delete<Result<{ success: boolean }>>(`/tenants/${id}`);
  },

  /** 工厂入驻（注册） */
  onboard: (data: RegisterParams) => {
    return request.post<Result<any>>("/tenants/onboard", data);
  },
};

export default TenantsAPI;

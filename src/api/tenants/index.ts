import request from "@/utils/request";
import type {
  TenantListParams,
  TenantListData,
  TenantDetailParams,
  TenantDetailData,
  UpdateTenantParams,
  RegisterParams,
} from "./types";
import { Result, PageResult } from "../base";

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
  getTenantDetail: (data: TenantDetailParams) => {
    return request.post<Result<TenantDetailData>>("/tenants/detail", data);
  },

  /** 更新租户信息 */
  updateTenant: (id: string, data: UpdateTenantParams) => {
    return request.patch<Result<TenantDetailData>>(`/tenants/${id}`, data);
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

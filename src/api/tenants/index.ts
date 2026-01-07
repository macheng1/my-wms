import request from "@/utils/request";
import { TenantDetailParams, TenantDetailData } from "./types";
import { Result } from "../base";

/**
 * 认证模块 API
 */

const TenantsAPI = {
  /** 获取租户详情 */
  getTenantDetail: (data: TenantDetailParams) => {
    return request
      .post<Result<TenantDetailData>>("/tenants/detail", data)
      .then((res) => res.data);
  },

  /** 更新租户信息 */
  updateTenant: (id: string, data: Partial<TenantDetailData>) => {
    return request
      .patch<Result<TenantDetailData>>(`/tenants/${id}`, data)
      .then((res) => res.data);
  },
};

export default TenantsAPI;

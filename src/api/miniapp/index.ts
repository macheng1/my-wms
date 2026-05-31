import request from "@/utils/request";
import type {
  MiniappBanner,
  MiniappCategory,
  MiniappMember,
  QueryMiniappBannerParams,
  QueryMiniappCategoryParams,
  QueryMiniappMemberParams,
  SaveMiniappBannerParams,
  SaveMiniappCategoryParams,
} from "./types";

const normalizeListParams = (params: QueryMiniappMemberParams) => ({
  ...params,
  platform: params.platform === "all" ? undefined : params.platform,
  isActive: params.isActive === "all" ? undefined : params.isActive,
});

const MiniappAPI = {
  getMembers: (params: QueryMiniappMemberParams) =>
    request.get<{
      list: MiniappMember[];
      total: number;
      page: number;
      pageSize: number;
    }>("/miniapp/members", {
      params: normalizeListParams(params),
    }),

  getMemberDetail: (id: string) =>
    request.get<MiniappMember>(`/miniapp/members/${id}`),

  updateMemberStatus: (id: string, isActive: number) =>
    request.post<MiniappMember>(`/miniapp/members/${id}/status`, { isActive }),

  updateMemberRemark: (id: string, remark?: string) =>
    request.post<MiniappMember>(`/miniapp/members/${id}/remark`, { remark }),

  getCategories: (params: QueryMiniappCategoryParams) =>
    request.get<{
      list: MiniappCategory[];
      total: number;
      page: number;
      pageSize: number;
    }>("/miniapp/categories", {
      params: {
        ...params,
        isActive: params.isActive === "all" ? undefined : params.isActive,
      },
    }),

  saveCategory: (data: SaveMiniappCategoryParams) =>
    request.post<MiniappCategory>("/miniapp/categories/save", data),

  updateCategoryStatus: (id: string, isActive: number) =>
    request.post(`/miniapp/categories/${id}/status`, { isActive }),

  deleteCategory: (id: string) =>
    request.post(`/miniapp/categories/${id}/delete`),

  getBanners: (params: QueryMiniappBannerParams) =>
    request.get<{
      list: MiniappBanner[];
      total: number;
      page: number;
      pageSize: number;
    }>("/miniapp/banners", {
      params: {
        ...params,
        isActive: params.isActive === "all" ? undefined : params.isActive,
      },
    }),

  saveBanner: (data: SaveMiniappBannerParams) =>
    request.post<MiniappBanner>("/miniapp/banners/save", data),

  updateBannerStatus: (id: string, isActive: number) =>
    request.post(`/miniapp/banners/${id}/status`, { isActive }),

  deleteBanner: (id: string) => request.post(`/miniapp/banners/${id}/delete`),
};

export default MiniappAPI;

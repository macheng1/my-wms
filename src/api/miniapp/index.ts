import request from "@/utils/request";
import type { MiniappMember, QueryMiniappMemberParams } from "./types";

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
};

export default MiniappAPI;

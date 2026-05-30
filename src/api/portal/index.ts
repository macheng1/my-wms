import request from "@/utils/request";
import {
  InquiryDetail,
  InquiryListQuery,
  InquiryStatus,
  PortalConfig,
  PortalJob,
  QueryPortalJobParams,
  SavePortalJobParams,
} from "./types";

/**
 * 网站管理 API
 */
const PortalAPI = {
  /** 获取网站配置 */
  getConfig: () => request.get<PortalConfig>("portal/config"),

  /** 更新网站配置 */
  updateConfig: (data: PortalConfig) => request.patch("portal/config", data),

  /** 获取访客询盘列表 */
  getInquiries: (params?: InquiryListQuery) =>
    request.get<{ list: any[]; total: number }>("portal/inquiries", {
      params,
    }),

  /** 获取访客询盘详情 */
  getInquiryDetail: (id: string) => request.get<InquiryDetail>(`portal/inquiries/${id}`),

  /** 更新访客询盘状态 */
  updateInquiryStatus: (id: string, status: InquiryStatus) =>
    request.post<InquiryDetail>(`portal/inquiries/${id}/status`, { status }),

  /** 保存访客询盘后台备注 */
  updateInquiryRemark: (id: string, adminRemark: string) =>
    request.post<InquiryDetail>(`portal/inquiries/${id}/remark`, { adminRemark }),

  /** 获取官网招聘列表 */
  getJobs: (params?: QueryPortalJobParams) =>
    request.get<{ list: PortalJob[]; total: number; page: number; pageSize: number }>(
      "portal/jobs",
      { params },
    ),

  /** 获取官网招聘职位详情 */
  getJobDetail: (id: string) => request.get<PortalJob>(`portal/jobs/${id}`),

  /** 保存官网招聘职位 */
  saveJob: (data: SavePortalJobParams) => request.post<PortalJob>("portal/jobs/save", data),

  /** 删除官网招聘职位 */
  deleteJob: (id: string) => request.post("portal/jobs/delete", { id }),
};

export default PortalAPI;

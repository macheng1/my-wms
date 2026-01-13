import request from "@/utils/request";
import { InquiryListQuery } from "./types";

/**
 * 网站管理 API
 */
const PortalAPI = {
  /** 获取网站配置 */
  getConfig: () => request.get<any>("portal/config"),

  /** 更新网站配置 */
  updateConfig: (data: any) => request.patch("portal/config", data),

  /** 获取访客询盘列表 */
  getInquiries: (params?: InquiryListQuery) =>
    request.get<{ list: any[]; total: number }>("portal/inquiries", {
      params,
    }),
};

export default PortalAPI;

export type InquiryStatus = "unread" | "read" | "replied";

export interface InquiryDetail {
  id: number;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  attachments?: string[];
  status: InquiryStatus;
  reply?: string;
  replyAt?: string;
  createdAt: string;
  updatedAt: string;
  ip?: string;
  source?: string;
}

export interface InquiryListQuery {
  page?: number;
  pageSize?: number;
  name?: string;
  status?: InquiryStatus; // 新增：支持按状态筛选
}

export interface PortalFooterInfo {
  phone?: string;
  address?: string;
  contactPerson?: string;
  icp?: string;
  publicNumber?: string;
  copyright?: string;
  qrCode?: string;
}

export interface PortalSeoConfig {
  keywords?: string;
  description?: string;
}

export interface PortalConfig {
  id?: string;
  tenantId?: string;
  title?: string;
  logo?: string;
  slogan?: string;
  description?: string;
  footerInfo?: PortalFooterInfo;
  seoConfig?: PortalSeoConfig;
  isActive?: 0 | 1;
}

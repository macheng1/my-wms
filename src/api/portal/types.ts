export type InquiryStatus = "unread" | "read" | "replied";

export interface InquiryDetail {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  attachments?: string[] | string;
  status: InquiryStatus;
  adminRemark?: string | null;
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
  status?: InquiryStatus | "all";
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

export interface PortalHomeConfig {
  heroImage?: string;
  productDescription?: string;
  responseTitle?: string;
  responseDescription?: string;
  responseItems?: Array<{
    title?: string;
    description?: string;
  }>;
  jobsDescription?: string;
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
  homeConfig?: PortalHomeConfig;
  isActive?: 0 | 1;
}

export interface PortalJob {
  id: string;
  tenantId: string;
  position: string;
  count: number;
  salary?: string | null;
  location?: string | null;
  experience?: string | null;
  education?: string | null;
  description?: string | null;
  requirement?: string | null;
  sortOrder: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueryPortalJobParams {
  page?: number;
  pageSize?: number;
  position?: string;
  isActive?: number;
}

export interface SavePortalJobParams {
  id?: string;
  position: string;
  count?: number;
  salary?: string | null;
  location?: string | null;
  experience?: string | null;
  education?: string | null;
  description?: string | null;
  requirement?: string | null;
  sortOrder?: number;
  isActive?: number;
}

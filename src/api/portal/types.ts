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

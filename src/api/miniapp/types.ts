export type MiniappPlatform = "wechat" | "toutiao";

export interface MiniappMember {
  id: string;
  platform: MiniappPlatform;
  appId: string;
  openId: string;
  unionId?: string | null;
  nickName?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  gender?: string | null;
  country?: string | null;
  province?: string | null;
  city?: string | null;
  loginCount: number;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  isActive: number;
  remark?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryMiniappMemberParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  platform?: MiniappPlatform | "all";
  isActive?: number | "all";
}

export interface MiniappCategory {
  id: string;
  name: string;
  code: string;
  iconUrl?: string | null;
  linkUrl?: string | null;
  description?: string | null;
  templateFields?: MiniappPostTemplateField[] | null;
  sortOrder: number;
  isActive: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MiniappPostTemplateField {
  field: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "date" | "region";
  required?: boolean;
  options?: Array<{ label: string; value: string } | string>;
  placeholder?: string;
}

export interface QueryMiniappCategoryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  isActive?: number | "all";
}

export interface SaveMiniappCategoryParams {
  id?: string;
  name: string;
  code?: string;
  iconUrl?: string;
  linkUrl?: string;
  description?: string;
  templateFields?: MiniappPostTemplateField[] | string;
  sortOrder?: number;
  isActive?: number;
}

export type MiniappPostStatus = "pending" | "published" | "rejected" | "offline";

export interface MiniappPost {
  id: string;
  categoryId: string;
  categoriesName?: string;
  memberId?: string | null;
  tenantId?: string | null;
  title?: string | null;
  phone?: string | null;
  content: string;
  structuredData?: Record<string, any> | null;
  region?: string | null;
  imgList?: string[] | string | null;
  viewNum: number;
  status: MiniappPostStatus;
  auditRemark?: string | null;
  auditedById?: string | null;
  auditedByName?: string | null;
  auditedAt?: string | null;
  nickName?: string;
  headPic?: string;
  isEnterpriseNo?: string;
  templateFields?: MiniappPostTemplateField[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryMiniappPostParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: string;
  status?: MiniappPostStatus | "all";
  region?: string;
  certifiedOnly?: string | number | boolean;
}

export type MiniappBannerLinkType =
  | "none"
  | "page"
  | "webview"
  | "post"
  | "category";

export interface MiniappBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkType: MiniappBannerLinkType;
  linkValue?: string | null;
  sortOrder: number;
  isActive: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryMiniappBannerParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  isActive?: number | "all";
}

export interface SaveMiniappBannerParams {
  id?: string;
  title: string;
  imageUrl: string;
  linkType?: MiniappBannerLinkType;
  linkValue?: string;
  sortOrder?: number;
  isActive?: number;
}

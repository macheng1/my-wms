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
  sortOrder: number;
  isActive: number;
  createdAt?: string;
  updatedAt?: string;
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
  sortOrder?: number;
  isActive?: number;
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

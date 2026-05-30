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

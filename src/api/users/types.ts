export interface UserInfoResponse {
  id: string | number;
  username: string;
  nickname: string;
  avatar: string;
  isPlatformAdmin: boolean;
  tenantId: string | number;
  tenantName: string;
  permissions: string[];
}

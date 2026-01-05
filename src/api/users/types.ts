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
// 修改密码
export interface ChangePassword {
  oldPassword: string;
  newPassword: string;
}

// 创建用户
export interface CreateUser {
  username: string;
  password: string;
  realName?: string;
  roleIds: string[];
  isActive?: boolean; // 默认为 true
}

// 查询用户
export interface QueryUser {
  username?: string;
  page?: number; // 默认为 1
  pageSize?: number; // 默认为 20
  isActive?: number;
}

// 重置密码
export interface ResetPassword {
  userId: string;
  newPassword: string;
}

// 更新用户状态
export interface UpdateUserStatus {
  id: string;
  isActive: boolean;
}

// 更新用户（继承创建用户，增加 id 字段）
export interface UpdateUser extends Partial<CreateUser> {
  id: string;
}

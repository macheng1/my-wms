export interface UserMenuInfo {
  id?: string | number;
  code?: string;
  name?: string;
  text?: string;
  type?: "DIRECTORY" | "MENU" | "BUTTON" | string;
  routePath?: string | null;
  itemKey?: string;
  icon?: string | null;
  parentId?: string | number | null;
  sortOrder?: number;
  children?: UserMenuInfo[];
}

export interface UserInfoResponse {
  id: string | number;
  username: string;
  nickname?: string;
  avatar: string;
  realName?: string;
  userType: "platform" | "tenant";
  tenantId: string | number | null;
  tenantName?: string;
  deptId?: string | number | null;
  deptName?: string | null;
  postId?: string | number | null;
  postName?: string | null;
  roleIds?: Array<string | number>;
  roleNames?: string[];
  menus?: UserMenuInfo[];
  butAuths?: string[];
}
// 修改密码
export interface ChangePassword {
  oldPassword: string;
  newPassword: string;
}

// 创建用户
export interface CreateUser {
  username: string;
  password?: string;
  realName?: string;
  phone?: string;
  email?: string;
  deptId?: string;
  postId?: string;
  roleIds?: string[];
  isActive?: number; // 默认为 1
}

// 查询用户
export interface QueryUser {
  username?: string;
  realName?: string;
  phone?: string;
  deptId?: string;
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

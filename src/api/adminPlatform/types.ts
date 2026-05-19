export interface PlatformPermission {
  id: string | number;
  code: string;
  name: string;
  description?: string | null;
  type?: string;
  scope?: "platform" | "tenant";
  routePath?: string | null;
  icon?: string | null;
  parentId?: number;
  sortOrder?: number;
  isHidden?: number;
  isMenu?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformRole {
  id: string | number;
  name: string;
  code?: string;
  remark?: string | null;
  isActive: number;
  permissions?: PlatformPermission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformUser {
  id: string | number;
  username: string;
  realName?: string | null;
  avatar?: string | null;
  isActive: number;
  roles?: PlatformRole[];
  roleNames?: string[];
  roleIds?: Array<string | number>;
  createdAt?: string;
  updatedAt?: string;
}

export interface SavePlatformRoleParams {
  id?: string | number;
  name: string;
  code?: string;
  remark?: string;
  isActive?: number;
  permissionCodes?: string[];
}

export interface QueryPlatformUserParams {
  page?: number;
  pageSize?: number;
  username?: string;
  isActive?: number;
}

export interface SavePlatformUserParams {
  id?: string | number;
  username: string;
  password?: string;
  realName?: string;
  avatar?: string;
  isActive?: number;
  roleIds?: Array<string | number>;
}

export interface SavePlatformMenuParams {
  id?: number;
  code: string;
  name: string;
  routePath?: string | null;
  description?: string | null;
  parentId?: number;
  icon?: string | null;
  sortOrder?: number;
  isHidden?: number;
}

export interface PlatformDashboard {
  tenantTotal: number;
  pendingTenants: number;
  activeTenants: number;
  platformUsers: number;
  platformRoles: number;
}

export interface TenantDashboard {
  users: number;
  roles: number;
  menus: number;
  operationLogs: number;
}

export interface OperationLog {
  id: string;
  tenantId?: string | null;
  userId?: string | null;
  username?: string | null;
  scope: "platform" | "tenant";
  module: string;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  description?: string | null;
  ip?: string | null;
  createdAt?: string;
}

export interface QueryAuditLogParams {
  page?: number;
  pageSize?: number;
  module?: string;
  username?: string;
}

export interface PlatformMenu {
  id: string | number;
  code: string;
  name: string;
  description?: string | null;
  type?: "DIRECTORY" | "MENU" | "BUTTON" | "API";
  scope?: "platform" | "tenant";
  routePath?: string | null;
  componentPath?: string | null;
  icon?: string | null;
  parentId?: number;
  sortOrder?: number;
  isHidden?: number;
  isActive?: number;
  isMenu?: boolean;
  createdAt?: string;
  updatedAt?: string;
  children?: PlatformMenu[];
}

export interface PlatformMenuTreeNode extends PlatformMenu {
  children?: PlatformMenuTreeNode[];
}

export interface PlatformRole {
  id: string | number;
  name: string;
  code?: string;
  remark?: string | null;
  isActive: number;
  menus?: PlatformMenu[];
  menuCodes?: string[];
  menuIds?: Array<string | number>;
  dataScope?: "ALL" | "CUSTOM" | "DEPT" | "DEPT_AND_CHILD" | "SELF";
  deptIds?: Array<string | number>;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformUser {
  id: string | number;
  username: string;
  realName?: string | null;
  phone?: string | null;
  email?: string | null;
  avatar?: string | null;
  deptId?: string | null;
  deptName?: string | null;
  postId?: string | null;
  postName?: string | null;
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
  menuCodes?: string[];
  dataScope?: "ALL" | "CUSTOM" | "DEPT" | "DEPT_AND_CHILD" | "SELF";
  deptIds?: Array<string | number>;
}

export interface QueryPlatformUserParams {
  page?: number;
  pageSize?: number;
  username?: string;
  deptId?: string | number;
  isActive?: number;
}

export interface QueryPlatformMenuParams {
  page?: number;
  pageSize?: number;
  type?: "DIRECTORY" | "MENU" | "BUTTON" | "all";
  name?: string;
  code?: string;
  routePath?: string;
  isHidden?: number;
}

export interface SavePlatformUserParams {
  id?: string | number;
  username: string;
  password?: string;
  realName?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  deptId?: string | null;
  postId?: string | null;
  isActive?: number;
  roleIds?: Array<string | number>;
}

export interface SavePlatformMenuParams {
  id?: number;
  type?: "DIRECTORY" | "MENU" | "BUTTON";
  code: string;
  name: string;
  routePath?: string | null;
  componentPath?: string | null;
  description?: string | null;
  parentId?: number;
  icon?: string | null;
  sortOrder?: number;
  isHidden?: number;
  isActive?: number;
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

export interface QueryPlatformTemplateParams {
  page?: number;
  pageSize?: number;
  name?: string;
  code?: string;
  keyword?: string;
  category?: string;
  isActive?: number;
}

export interface PlatformTemplateAttribute {
  id: string;
  name: string;
  code: string;
  type: "select" | "input" | "number";
  unit?: string | null;
  isActive: number;
  options?: Array<{
    id?: string;
    value: string;
    sort?: number;
    isActive?: number;
  }>;
  createdAt?: string;
}

export interface PlatformTemplateCategory {
  id: string;
  name: string;
  code: string;
  isActive: number;
  attributes?: PlatformTemplateAttribute[];
  attributeIds?: string[];
  attributeNames?: string;
  createdAt?: string;
}

export interface PlatformTemplateUnit {
  id: string;
  name: string;
  code: string;
  category: "COUNT" | "WEIGHT" | "LENGTH" | "VOLUME" | "AREA" | "TIME";
  symbol?: string | null;
  description?: string | null;
  isActive: number;
  sortOrder: number;
  createdAt?: string;
}

/**
 * 登录请求参数
 */
export interface LoginParams {
  username: string;
  password?: string;
  remember?: boolean;
}

/**
 * 登录成功返回的数据结构
 */
export interface LoginData {
  access_token: string;
}

/**
 * 注册/申请租户参数
 */
export interface RegisterParams {
  username: string;
  password?: string;
  tenantName: string; // 租户/工厂名称
  industry?: string; // 行业
}

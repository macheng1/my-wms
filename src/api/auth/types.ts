/**
 * 登录请求参数
 */
export interface LoginParams {
  code?: string;
  username: string;
  password?: string;
  remember?: boolean;
}

/**
 * 登录成功返回的数据结构
 */
export interface LoginData {
  access_token: string;
  userType: "platform" | "tenant";
  tenantId?: string | number | null;
}

/**
 * 注册/申请租户参数
 */
export interface RegisterParams {
  code?: string; // 企业唯一编码
  name: string; // 企业全称
  industryCode?: string; // 行业标识
  contactPerson?: string; // 工厂联系人
  contactPhone?: string; // 联系电话
  email?: string; // 联系邮箱
  smsCode?: string; // 短信验证码
  adminUser: string; // 初始管理员账号
  adminPass: string; // 初始管理员密码
}

export interface RegisterResult {
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  adminId: string;
  username: string;
  menuGrantCount?: number;
  roleCount?: number;
}

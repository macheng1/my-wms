/**
 * 注册/申请租户参数
 */
export interface RegisterParams {
  code?: string; // 企业唯一编码（如不填将自动生成）
  name: string; // 企业全称
  smsCode: string; // 手机验证码
  contactPhone: string; // 联系电话（需验证）
  adminUser: string; // 初始管理员账号
  adminPass: string; // 初始管理员密码
  industry?: string; // 行业标识
  contactPerson?: string; // 工厂联系人
  address?: string; // 工厂详细地址
  factoryAddress?: string; // 工厂地址（别名）
  registerAddress?: string; // 公司注册地址
  website?: string; // 官网
  remark?: string; // 备注
  taxNo?: string; // 税号
  taxpayerType?: string; // 纳税人类型
  creditCode?: string; // 统一社会信用代码
  bankName?: string; // 开户行
  bankAccount?: string; // 银行账号
  businessLicenseNo?: string; // 营业执照号
  businessLicenseExpire?: string; // 营业执照有效期
  legalPerson?: string; // 法人代表
  registeredCapital?: string; // 注册资本
  industryType?: string; // 行业分类
  qualificationNo?: string; // 资质证书编号
  qualificationExpire?: string; // 资质证书有效期
  email?: string; // 联系邮箱
  fax?: string; // 传真
  foundDate?: string; // 成立日期
  staffCount?: number; // 员工人数
  mainProducts?: string; // 主要产品
  annualCapacity?: string; // 年产能
  industryCode?: string; // 所属行业代码
  industryName?: string; // 所属行业名称
}

/**
 * 租户列表查询参数
 */
export interface TenantListParams {
  page?: number;
  pageSize?: number;
}

/**
 * 租户列表返回数据
 */
export interface TenantListData {
  data: TenantItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 租户列表项
 */
export interface TenantItem {
  id: string;
  code: string;
  name: string;
  industryCode?: string;
  industryName?: string;
  contactPerson?: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 租户详情参数
 */
export interface TenantDetailParams {
  id: string;
}

/**
 * 租户详情返回数据
 */
export interface TenantDetailData {
  id: string;
  code: string;
  name: string;
  industryCode?: string;
  industryName?: string;
  contactPerson?: string;
  contactPhone?: string;
  address?: string;
  factoryAddress?: string;
  registerAddress?: string;
  website?: string;
  remark?: string;
  taxNo?: string;
  taxpayerType?: string;
  creditCode?: string;
  bankName?: string;
  bankAccount?: string;
  businessLicenseNo?: string;
  businessLicenseExpire?: string;
  legalPerson?: string;
  registeredCapital?: string;
  industryType?: string;
  qualificationNo?: string;
  qualificationExpire?: string;
  email?: string;
  fax?: string;
  foundDate?: string;
  staffCount?: number;
  mainProducts?: string;
  annualCapacity?: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 更新租户参数
 */
export type UpdateTenantParams = Partial<Omit<TenantDetailData, "id" | "code" | "createdAt" | "updatedAt">>;

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
  isApproved?: number;
  lifecycleStatus?: "pending" | "active" | "rejected" | "disabled" | "expired";
  expiresAt?: string | null;
  approvedAt?: string | null;
  auditRemark?: string | null;
  disabledReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantMenu {
  id: string | number;
  code: string;
  name: string;
  description?: string | null;
  type?: string;
  scope?: "tenant";
  routePath?: string | null;
  parentId?: number;
}

export interface TenantMenuGrant {
  tenantId: string;
  tenantName: string;
  menus: TenantMenu[];
  selectedCodes: string[];
}

// ==================== 租户详情分组类型 ====================

/**
 * 基本信息
 */
export interface TenantBasicInfo {
  id: string;
  code: string;
  name: string;
  isActive: number;
  isApproved?: number;
  lifecycleStatus?: "pending" | "active" | "rejected" | "disabled" | "expired";
  expiresAt?: string | null;
  approvedAt?: string | null;
  auditRemark?: string | null;
  disabledReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 行业信息
 */
export interface TenantIndustryInfo {
  industryCode?: string;
  industryName?: string;
  industryType?: string;
}

/**
 * 联系信息
 */
export interface TenantContactInfo {
  contactPerson?: string;
  contactPhone?: string;
  email?: string;
  fax?: string;
}

/**
 * 地址信息
 */
export interface TenantAddressInfo {
  address?: string;
  factoryAddress?: string;
  registerAddress?: string;
  website?: string;
}

/**
 * 财务信息
 */
export interface TenantFinanceInfo {
  taxNo?: string;
  taxpayerType?: string;
  creditCode?: string;
  bankName?: string;
  bankAccount?: string;
  registeredCapital?: string;
}

/**
 * 资质信息
 */
export interface TenantQualificationInfo {
  legalPerson?: string;
  businessLicenseNo?: string;
  businessLicenseExpire?: string;
  qualificationNo?: string;
  qualificationExpire?: string;
}

/**
 * 经营信息
 */
export interface TenantBusinessInfo {
  foundDate?: string;
  staffCount?: number;
  mainProducts?: string;
  annualCapacity?: string;
  remark?: string;
}

/**
 * 租户详情 - API 原始返回结构（扁平）
 * @internal 后端返回的原始格式
 */
export interface TenantDetailRaw {
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
  isApproved?: number;
  lifecycleStatus?: "pending" | "active" | "rejected" | "disabled" | "expired";
  expiresAt?: string | null;
  approvedAt?: string | null;
  auditRemark?: string | null;
  disabledReason?: string | null;
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
 * 租户详情返回数据（分组结构）
 */
export interface TenantDetailData {
  /** 基本信息 */
  basic: TenantBasicInfo;
  /** 行业信息 */
  industry: TenantIndustryInfo;
  /** 联系信息 */
  contact: TenantContactInfo;
  /** 地址信息 */
  address: TenantAddressInfo;
  /** 财务信息 */
  finance: TenantFinanceInfo;
  /** 资质信息 */
  qualification: TenantQualificationInfo;
  /** 经营信息 */
  business: TenantBusinessInfo;
}

/**
 * 将 API 返回的扁平结构转换为分组结构
 */
export function transformTenantDetail(raw: TenantDetailRaw): TenantDetailData {
  return {
    basic: {
      id: raw.id,
      code: raw.code,
      name: raw.name,
      isActive: raw.isActive,
      isApproved: raw.isApproved,
      lifecycleStatus: raw.lifecycleStatus,
      expiresAt: raw.expiresAt,
      approvedAt: raw.approvedAt,
      auditRemark: raw.auditRemark,
      disabledReason: raw.disabledReason,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    },
    industry: {
      industryCode: raw.industryCode,
      industryName: raw.industryName,
      industryType: raw.industryType,
    },
    contact: {
      contactPerson: raw.contactPerson,
      contactPhone: raw.contactPhone,
      email: raw.email,
      fax: raw.fax,
    },
    address: {
      address: raw.address,
      factoryAddress: raw.factoryAddress,
      registerAddress: raw.registerAddress,
      website: raw.website,
    },
    finance: {
      taxNo: raw.taxNo,
      taxpayerType: raw.taxpayerType,
      creditCode: raw.creditCode,
      bankName: raw.bankName,
      bankAccount: raw.bankAccount,
      registeredCapital: raw.registeredCapital,
    },
    qualification: {
      legalPerson: raw.legalPerson,
      businessLicenseNo: raw.businessLicenseNo,
      businessLicenseExpire: raw.businessLicenseExpire,
      qualificationNo: raw.qualificationNo,
      qualificationExpire: raw.qualificationExpire,
    },
    business: {
      foundDate: raw.foundDate,
      staffCount: raw.staffCount,
      mainProducts: raw.mainProducts,
      annualCapacity: raw.annualCapacity,
      remark: raw.remark,
    },
  };
}

/**
 * 将分组结构转换为扁平结构（用于提交更新）
 */
export function flattenTenantDetail(data: Partial<TenantDetailData>): Partial<TenantDetailRaw> {
  const result: Partial<TenantDetailRaw> = {};
  const rawData = data as Partial<TenantDetailRaw>;

  if (
    !data.basic &&
    !data.industry &&
    !data.contact &&
    !data.address &&
    !data.finance &&
    !data.qualification &&
    !data.business
  ) {
    return rawData;
  }

  if (data.basic) {
    Object.assign(result, data.basic);
  }
  if (data.industry) {
    Object.assign(result, data.industry);
  }
  if (data.contact) {
    Object.assign(result, data.contact);
  }
  if (data.address) {
    Object.assign(result, data.address);
  }
  if (data.finance) {
    Object.assign(result, data.finance);
  }
  if (data.qualification) {
    Object.assign(result, data.qualification);
  }
  if (data.business) {
    Object.assign(result, data.business);
  }

  return result;
}

/**
 * 更新租户参数（支持分组结构）
 */
export type UpdateTenantParams =
  | Partial<TenantDetailData>
  | {
      basic?: Partial<TenantBasicInfo>;
      industry?: Partial<TenantIndustryInfo>;
      contact?: Partial<TenantContactInfo>;
      address?: Partial<TenantAddressInfo>;
      finance?: Partial<TenantFinanceInfo>;
      qualification?: Partial<TenantQualificationInfo>;
      business?: Partial<TenantBusinessInfo>;
    };

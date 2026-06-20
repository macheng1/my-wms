/**
 * 租户管理相关常量（生命周期、来源等），统一维护，页面/组件按需引用。
 */
import { type LabelColorMap, mapToOptions } from "@/constants/common";

export type TenantLifecycleStatus =
  | "pending"
  | "active"
  | "rejected"
  | "disabled"
  | "expired";

export type TenantSource = "platform" | "miniapp" | "import" | "api";

/** 生命周期状态 → 文案 + 标签色 */
export const TENANT_LIFECYCLE_MAP: LabelColorMap<TenantLifecycleStatus> = {
  pending: { text: "待审核", color: "orange" },
  active: { text: "运营中", color: "green" },
  rejected: { text: "已驳回", color: "red" },
  disabled: { text: "已禁用", color: "grey" },
  expired: { text: "已到期", color: "blue" },
};

/** 来源 → 文案 + 标签色 */
export const TENANT_SOURCE_MAP: LabelColorMap<TenantSource> = {
  platform: { text: "平台后台", color: "blue" },
  miniapp: { text: "小程序", color: "green" },
  import: { text: "导入", color: "grey" },
  api: { text: "开放接口", color: "orange" },
};

/** 来源筛选下拉项（不含「全部」，清空即不筛选） */
export const TENANT_SOURCE_OPTIONS = mapToOptions(TENANT_SOURCE_MAP);

/**
 * 生命周期合法跃迁（与后端 admin-platform.service.updateTenantLifecycle 一致）。
 * 用于前端按当前状态决定可执行的动作。
 */
export const TENANT_LIFECYCLE_TRANSITIONS: Record<
  TenantLifecycleStatus,
  TenantLifecycleStatus[]
> = {
  pending: ["active", "rejected"],
  active: ["disabled", "expired"],
  rejected: ["active", "pending"],
  disabled: ["active", "expired"],
  expired: ["active"],
};

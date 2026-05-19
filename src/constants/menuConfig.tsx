import React from "react";
import {
  IconAppCenter,
  IconGlobeStroke,
  IconHome,
  IconKanban,
  IconList,
  IconSetting,
  IconUserGroup,
} from "@douyinfe/semi-icons";

/**
 * 菜单项接口定义
 */

export type MenuType = "super_admin" | "tenant" | "all";

export interface MenuItem {
  itemKey: string; // 对应路由路径，如 /warehouse/list
  text: string; // 显示的中文名称
  icon?: React.ReactNode;
  code?: string; // 权限控制码，用于面包屑和侧边栏过滤
  menuType?: MenuType; // 菜单类型
  items?: MenuItem[]; // 子菜单
}

/**
 * 菜单过滤工具函数
 * 根据用户类型和权限过滤菜单
 */
export const filterMenuByUser = (
  items: MenuItem[],
  isPlatformUser: boolean,
  permissions: string[]
): MenuItem[] => {
  return items
    .map((item) => {
      if (item.menuType) {
        if (item.menuType === "all") {
          // 所有人可见，继续检查权限
        } else if (item.menuType === "super_admin" && !isPlatformUser) {
          return null;
        } else if (item.menuType === "tenant" && isPlatformUser) {
          return null;
        }
      }

      const children = item.items
        ? filterMenuByUser(item.items, isPlatformUser, permissions)
        : undefined;
      const hasPermission =
        !item.code ||
        permissions.length === 1 && permissions[0] === "*" ||
        permissions.includes(item.code);

      if (!hasPermission && (!children || children.length === 0)) {
        return null;
      }

      if (children) {
        return { ...item, items: children };
      }

      return item;
    })
    .filter((item): item is MenuItem => Boolean(item));
};

/**
 * WMS 系统菜单配置
 */
export const MENU_CONFIG: MenuItem[] = [
  {
    itemKey: "/",
    text: "仪表盘",
    icon: <IconHome />,
    menuType: "all",
  },
  {
    itemKey: "/base",
    text: "基本信息",
    icon: <IconAppCenter />,
    code: "tenant:base",
    menuType: "tenant",
  },
  // 网站管理菜单
  {
    itemKey: "/website",
    text: "网站管理",
    icon: <IconGlobeStroke />,
    code: "tenant:portal",
    menuType: "tenant",
    items: [
      {
        itemKey: "/website/inquiry",
        text: "询价管理",
        code: "tenant:portal:inquiry:list",
      },
    ],
  },
  // 类目管理
  {
    itemKey: "/category",
    text: "类目管理",
    icon: <IconList />,
    code: "tenant:category:list",
    menuType: "tenant",
    items: [
      {
        itemKey: "/category/list",
        text: "类目列表",
        code: "tenant:category:list",
      },
    ],
  },
  // 产品管理
  {
    itemKey: "/product",
    text: "产品管理",
    icon: <IconKanban />,
    code: "tenant:product",
    menuType: "tenant",
    items: [
      {
        itemKey: "/product/attr",
        text: "属性管理",
        code: "tenant:attribute:list",
      },
      {
        itemKey: "/product/spec",
        text: "规格管理",
        code: "tenant:spec:list",
      },
      {
        itemKey: "/product/list",
        text: "产品列表",
        code: "tenant:product:list",
      },
    ],
  },
  // 仓库管理
  {
    itemKey: "/warehouse",
    text: "仓库管理",
    icon: <IconHome />,
    code: "tenant:warehouse",
    menuType: "tenant",
    items: [
      {
        itemKey: "/warehouse/list",
        text: "仓库列表",
        code: "tenant:location:list",
      },
    ],
  },
  // 库存管理
  {
    itemKey: "/inventory",
    text: "库存管理",
    icon: <IconKanban />,
    code: "tenant:inventory",
    menuType: "tenant",
    items: [
      {
        itemKey: "/inventory/unit",
        text: "单位管理",
        code: "tenant:unit:list",
      },
      {
        itemKey: "/inventory/list",
        text: "库存查询",
        code: "tenant:inventory:list",
      },
      {
        itemKey: "/inventory/inbound",
        text: "入库管理",
        code: "tenant:inventory:inbound",
      },
      {
        itemKey: "/inventory/outbound",
        text: "出库管理",
        code: "tenant:inventory:outbound",
      },
      {
        itemKey: "/inventory/transactions",
        text: "库存流水",
        code: "tenant:inventory:transaction:list",
      },
      {
        itemKey: "/inventory/alerts",
        text: "库存预警",
        code: "tenant:inventory:alert:list",
      },
    ],
  },
  // 员工管理
  {
    itemKey: "/users",
    text: "员工管理",
    icon: <IconUserGroup />,
    code: "tenant:user:list",
    menuType: "tenant",
  },
  // 租户管理（仅平台管理员）
  {
    itemKey: "/tenants",
    text: "租户管理",
    icon: <IconUserGroup />,
    code: "platform:tenant:list",
    menuType: "super_admin",
  },
  // 系统设置
  {
    itemKey: "/settings",
    text: "系统设置",
    icon: <IconSetting />,
    menuType: "all",
    items: [
      {
        itemKey: "/settings/platform-users",
        text: "平台用户",
        code: "platform:user",
        menuType: "super_admin",
      },
      {
        itemKey: "/settings/platform-roles",
        text: "平台角色",
        code: "platform:role",
        menuType: "super_admin",
      },
      {
        itemKey: "/settings/platform-menus",
        text: "平台菜单",
        code: "platform:menu",
        menuType: "super_admin",
      },
      {
        itemKey: "/settings/platform-permissions",
        text: "平台权限",
        code: "platform:permission",
        menuType: "super_admin",
      },
      {
        itemKey: "/settings/dict",
        text: "平台字典",
        code: "platform:config",
        menuType: "super_admin",
      },
      {
        itemKey: "/settings/platform-audit-logs",
        text: "平台审计",
        code: "platform:audit-log",
        menuType: "super_admin",
      },
      {
        itemKey: "/settings/roles",
        text: "租户角色",
        code: "tenant:role:list",
        menuType: "tenant",
      },
      {
        itemKey: "/settings/dict",
        text: "租户字典",
        code: "tenant:dict",
        menuType: "tenant",
      },
      {
        itemKey: "/settings/operation-logs",
        text: "操作日志",
        code: "tenant:audit-log",
        menuType: "tenant",
      },
    ],
  },
];

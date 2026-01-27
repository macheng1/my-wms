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
  isPlatformAdmin: boolean,
  permissions: string[]
): MenuItem[] => {
  return items
    .filter((item) => {
      // 1. menuType 过滤
      if (item.menuType) {
        if (item.menuType === "all") {
          // 所有人可见，继续检查权限
        } else if (item.menuType === "super_admin" && !isPlatformAdmin) {
          return false; // 仅平台管理员可见
        } else if (item.menuType === "tenant" && isPlatformAdmin) {
          return false; // 仅租户管理员可见
        }
      }

      // 2. 权限码过滤（如果没有 code 则视为公共菜单）
      if (!item.code) return true;
      if (permissions.length === 1 && permissions[0] === "*") return true;
      return permissions.includes(item.code);
    })
    .map((item) => {
      // 3. 递归处理子菜单
      if (item.items && item.items.length > 0) {
        return { ...item, items: filterMenuByUser(item.items, isPlatformAdmin, permissions) };
      }
      return item;
    })
    .filter((item) => {
      // 4. 过滤掉没有可见子菜单的父级菜单
      if (item.items && item.items.length === 0) {
        // 如果父级菜单本身没有 code（分组标题），则隐藏
        return !item.code;
      }
      return true;
    });
};

/**
 * WMS 系统菜单配置
 */
export const MENU_CONFIG: MenuItem[] = [
  {
    itemKey: "/",
    text: "仪表盘",
    icon: <IconHome />,
    code: "wms:dashboard",
    menuType: "all",
  },
  {
    itemKey: "/base",
    text: "基本信息",
    icon: <IconAppCenter />,
    code: "wms:base",
    menuType: "tenant",
  },
  // 网站管理菜单
  {
    itemKey: "/website",
    text: "网站管理",
    icon: <IconGlobeStroke />,
    code: "wms:website",
    menuType: "all",
    items: [
      {
        itemKey: "/website/inquiry",
        text: "询价管理",
        code: "wms:website:inquiry",
      },
    ],
  },
  // 类目管理
  {
    itemKey: "/category",
    text: "类目管理",
    icon: <IconList />,
    code: "wms:category",
    menuType: "all",
    items: [
      {
        itemKey: "/category/list",
        text: "类目列表",
        code: "wms:category:list",
      },
    ],
  },
  // 产品管理
  {
    itemKey: "/product",
    text: "产品管理",
    icon: <IconKanban />,
    code: "wms:product",
    menuType: "all",
    items: [
      {
        itemKey: "/product/attr",
        text: "属性管理",
        code: "wms:product:attr",
      },
      {
        itemKey: "/product/spec",
        text: "规格管理",
        code: "wms:product:spec",
      },
      {
        itemKey: "/product/list",
        text: "产品列表",
        code: "wms:product:list",
      },
    ],
  },
  // 仓库管理
  {
    itemKey: "/warehouse",
    text: "仓库管理",
    icon: <IconHome />,
    code: "wms:warehouse",
    menuType: "all",
    items: [
      {
        itemKey: "/warehouse/list",
        text: "仓库列表",
        code: "wms:warehouse:list",
      },
      {
        itemKey: "/warehouse/area",
        text: "库区管理",
        code: "wms:warehouse:area",
      },
    ],
  },
  // 库存管理
  {
    itemKey: "/inventory",
    text: "库存管理",
    icon: <IconKanban />,
    code: "wms:inventory",
    menuType: "all",
    items: [
      {
        itemKey: "/inventory/unit",
        text: "单位管理",
        code: "wms:inventory:unit",
      },
      {
        itemKey: "/inventory/list",
        text: "库存查询",
        code: "wms:inventory:list",
      },
      {
        itemKey: "/inventory/inbound",
        text: "入库管理",
        code: "wms:inventory:inbound",
      },
      {
        itemKey: "/inventory/outbound",
        text: "出库管理",
        code: "wms:inventory:outbound",
      },
      {
        itemKey: "/inventory/transactions",
        text: "库存流水",
        code: "wms:inventory:transactions",
      },
      {
        itemKey: "/inventory/alerts",
        text: "库存预警",
        code: "wms:inventory:alerts",
      },
    ],
  },
  // 员工管理
  {
    itemKey: "/users",
    text: "员工管理",
    icon: <IconUserGroup />,
    code: "wms:users",
    menuType: "all",
  },
  // 租户管理（仅平台管理员）
  {
    itemKey: "/tenants",
    text: "租户管理",
    icon: <IconUserGroup />,
    code: "wms:tenants",
    menuType: "super_admin",
  },
  // 系统设置
  {
    itemKey: "/settings",
    text: "系统设置",
    icon: <IconSetting />,
    code: "wms:settings",
    menuType: "all",
    items: [
      {
        itemKey: "/settings/roles",
        text: "角色管理",
        code: "wms:settings:roles",
      },
      {
        itemKey: "/settings/permissions",
        text: "权限管理",
        code: "wms:settings:permissions",
      },
      {
        itemKey: "/settings/dict",
        text: "字典管理",
        code: "wms:settings:dict",
        menuType: "super_admin",
      },
    ],
  },
];

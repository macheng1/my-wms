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
import type { UserMenuInfo } from "@/api/users/types";

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

      const nextItem =
        item.itemKey === "/"
          ? { ...item, text: isPlatformUser ? "平台工作台" : "租户工作台" }
          : item;

      if (children) {
        return { ...nextItem, items: children };
      }

      return nextItem;
    })
    .filter((item): item is MenuItem => Boolean(item));
};

const flattenMenuConfig = (items: MenuItem[], map = new Map<string, MenuItem>()) => {
  items.forEach((item) => {
    if (item.code) map.set(item.code, item);
    if (item.items?.length) flattenMenuConfig(item.items, map);
  });
  return map;
};

const MENU_ICON_BY_CODE: Record<string, React.ReactNode> = {
  "platform:dashboard": <IconHome />,
  "platform:tenant": <IconUserGroup />,
  "platform:tenant:list": <IconUserGroup />,
  "platform:settings": <IconSetting />,
  "platform:template": <IconList />,
  "platform:template:category": <IconList />,
  "platform:template:attribute": <IconAppCenter />,
  "platform:template:unit": <IconKanban />,
  "tenant:dashboard": <IconHome />,
  "tenant:base": <IconAppCenter />,
  "tenant:portal": <IconGlobeStroke />,
  "tenant:product": <IconKanban />,
  "tenant:order": <IconList />,
  "tenant:warehouse": <IconHome />,
  "tenant:inventory": <IconKanban />,
  "tenant:settings": <IconSetting />,
};

export const buildMenuFromUserMenus = (menus: UserMenuInfo[] = []): MenuItem[] => {
  const localMenuByCode = flattenMenuConfig(MENU_CONFIG);

  const walk = (items: UserMenuInfo[]): MenuItem[] =>
    items
      .filter((item) => item.type !== "BUTTON")
      .map((item) => {
        const localMenu = item.code ? localMenuByCode.get(item.code) : undefined;
        const children = item.children?.length ? walk(item.children) : undefined;
        return {
          ...localMenu,
          itemKey: item.itemKey || item.routePath || localMenu?.itemKey || "",
          text: item.text || item.name || localMenu?.text || "",
          code: item.code || localMenu?.code,
          icon: localMenu?.icon || (item.code ? MENU_ICON_BY_CODE[item.code] : undefined),
          items: children?.length ? children : undefined,
        };
      })
      .filter((item) => item.itemKey && item.text);

  return walk(menus);
};

export const collectUserMenuCodes = (menus: UserMenuInfo[] = []): string[] =>
  Array.from(
    new Set(
      menus.flatMap((menu) => [
        ...(menu.code ? [menu.code] : []),
        ...(menu.children?.length ? collectUserMenuCodes(menu.children) : []),
      ])
    )
  );

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
    text: "基础资料",
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
        itemKey: "/inventory/unit",
        text: "单位管理",
        code: "tenant:unit:list",
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
        itemKey: "/warehouse/visual",
        text: "仓库可视化",
        code: "tenant:location:visual",
      },
      {
        itemKey: "/warehouse/list",
        text: "库位管理",
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
  {
    itemKey: "/orders",
    text: "订单管理",
    icon: <IconList />,
    code: "tenant:order",
    menuType: "tenant",
    items: [
      {
        itemKey: "/orders",
        text: "订单列表",
        code: "tenant:order:list",
      },
    ],
  },
  // 租户管理（仅平台管理员）
  {
    itemKey: "/tenants",
    text: "租户管理",
    icon: <IconUserGroup />,
    code: "platform:tenant:list",
    menuType: "super_admin",
  },
  {
    itemKey: "/settings/platform-templates",
    text: "模板管理",
    icon: <IconList />,
    code: "platform:template",
    menuType: "super_admin",
    items: [
      {
        itemKey: "/settings/platform-templates/categories",
        text: "标准类目",
        code: "platform:template:category",
        menuType: "super_admin",
      },
      {
        itemKey: "/settings/platform-templates/attributes",
        text: "标准属性",
        code: "platform:template:attribute",
        menuType: "super_admin",
      },
      {
        itemKey: "/settings/platform-templates/units",
        text: "标准单位",
        code: "platform:template:unit",
        menuType: "super_admin",
      },
    ],
  },
  // 系统设置
  {
    itemKey: "/settings",
    text: "系统设置",
    icon: <IconSetting />,
    code: "tenant:settings",
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
        itemKey: "/settings/dict",
        text: "平台字典",
        code: "platform:config",
        menuType: "super_admin",
      },
      {
        itemKey: "/settings/dept",
        text: "平台部门",
        code: "platform:dept",
        menuType: "super_admin",
      },
      {
        itemKey: "/settings/post",
        text: "平台岗位",
        code: "platform:post",
        menuType: "super_admin",
      },
      {
        itemKey: "/settings/platform-audit-logs",
        text: "平台审计",
        code: "platform:audit-log",
        menuType: "super_admin",
      },
      {
        itemKey: "/settings/permissions",
        text: "菜单管理",
        code: "tenant:menu:list",
        menuType: "tenant",
      },
      {
        itemKey: "/users",
        text: "员工管理",
        code: "tenant:user:list",
        menuType: "tenant",
      },
      {
        itemKey: "/settings/roles",
        text: "角色管理",
        code: "tenant:role:list",
        menuType: "tenant",
      },
      {
        itemKey: "/settings/dept",
        text: "部门管理",
        code: "tenant:dept",
        menuType: "tenant",
      },
      {
        itemKey: "/settings/post",
        text: "岗位管理",
        code: "tenant:post",
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

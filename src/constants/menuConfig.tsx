import React from "react";
import {
  IconAppCenter,
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
 * WMS 系统菜单配置
 */
export const MENU_CONFIG: MenuItem[] = [
  {
    itemKey: "/",
    text: "仪表盘",
    icon: <IconAppCenter />,
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
      // 可扩展更多子菜单
    ],
  },

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
  {
    itemKey: "/inventory",
    text: "库存管理",
    icon: <IconKanban />,
    code: "wms:inventory",
    menuType: "all",
    items: [
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
    ],
  },
  {
    itemKey: "/users",
    text: "员工管理",
    icon: <IconUserGroup />,
    code: "wms:users",
    menuType: "all",
  },
  {
    itemKey: "/tenants",
    text: "租户管理",
    icon: <IconUserGroup />,
    code: "wms:tenants",
    menuType: "super_admin",
  },
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
    ],
  },
];

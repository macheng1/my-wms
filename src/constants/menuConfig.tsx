import React from "react";
import {
  IconHome,
  IconKanban,
  IconList,
  IconSetting,
  IconShield,
  IconUserGroup,
} from "@douyinfe/semi-icons";

/**
 * 菜单项接口定义
 */
export interface MenuItem {
  itemKey: string; // 对应路由路径，如 /warehouse/list
  text: string; // 显示的中文名称
  icon?: React.ReactNode;
  code?: string; // 权限控制码，用于面包屑和侧边栏过滤
  items?: MenuItem[]; // 子菜单
}

/**
 * WMS 系统菜单配置
 */
export const MENU_CONFIG: MenuItem[] = [
  {
    itemKey: "/",
    text: "工作台",
    icon: <IconList />,
    code: "wms:dashboard",
  },
  {
    itemKey: "/warehouse",
    text: "仓库管理",
    icon: <IconHome />,
    code: "wms:warehouse",
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
  },
  {
    itemKey: "/settings",
    text: "系统设置",
    icon: <IconSetting />,
    code: "wms:settings",
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

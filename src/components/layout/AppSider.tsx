"use client";

import React, { useMemo } from "react";
import { Nav } from "@douyinfe/semi-ui-19";
import { useRouter, usePathname } from "next/navigation";

import { useUserStore } from "@/store/useUserStore";
import { MENU_CONFIG, MenuItem } from "@/constants/menuConfig";
import { IconSemiLogo } from "@douyinfe/semi-icons";

interface AppSiderProps {
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export const AppSider: React.FC<AppSiderProps> = ({
  collapsed,
  onCollapseChange,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  // 从 Store 获取用户权限码列表 (例如: ['wms:dashboard', 'wms:warehouse:list'])
  const userInfo = useUserStore((state) => state.userInfo);
  const permissions = userInfo?.permissions || []; // 💡 从用户信息中提取
  console.log("🚀 ~ AppSider ~ permissions:", permissions);
  /**
   * 核心逻辑：根据权限 code 过滤菜单树
   */
  const authorizedMenu = useMemo(() => {
    // 如果权限为 ["*"], 显示全部菜单
    if (permissions.length === 1 && permissions[0] === "*") {
      return MENU_CONFIG;
    }
    const filterMenu = (items: MenuItem[]): MenuItem[] => {
      return (
        items
          .filter((item) => {
            // 1. 如果没有设置 code，说明是公共菜单，直接显示
            if (!item.code) return true;
            // 2. 检查用户权限列表中是否包含该 code
            return permissions.includes(item.code);
          })
          .map((item) => {
            // 3. 如果有子菜单，递归过滤子菜单
            if (item.items && item.items.length > 0) {
              return { ...item, items: filterMenu(item.items) };
            }
            return item;
          })
          // 4. 过滤掉那些“有子菜单配置但过滤后子菜单为空”的父级（可选逻辑）
          .filter((item) => !item.items || item.items.length > 0 || !item.code)
      );
    };

    return filterMenu(MENU_CONFIG);
  }, [permissions]);

  return (
    <Nav
      style={{ height: "100%" }}
      isCollapsed={collapsed}
      // 当前高亮的菜单项
      onCollapseChange={onCollapseChange}
      selectedKeys={[pathname]}
      header={{
        logo: (
          <IconSemiLogo style={{ fontSize: 36, color: "var(--semi-blue-5)" }} />
        ),
        text: "WMS", // 这里可以改成你的系统名称
      }}
      // 默认展开包含当前路径的父级菜单
      defaultOpenKeys={["/" + pathname.split("/")[1]]}
      items={authorizedMenu}
      onSelect={(data) => {
        const itemKey = data.itemKey as string;
        router.push(itemKey);
      }}
      footer={{
        collapseButton: true,
      }}
    />
  );
};

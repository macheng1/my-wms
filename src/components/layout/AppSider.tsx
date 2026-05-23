"use client";

import React, { useMemo } from "react";
import { Nav } from "@douyinfe/semi-ui-19";
import { useRouter, usePathname } from "next/navigation";

import { useUserStore } from "@/store/useUserStore";
import {
  MENU_CONFIG,
  buildMenuFromUserMenus,
  filterMenuByUser,
} from "@/constants/menuConfig";
import Image from "next/image";

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

  const userInfo = useUserStore((state) => state.userInfo);
  const userMenus = userInfo?.menus;
  const isPlatformUser = userInfo?.userType === "platform";

  /**
   * 核心逻辑：根据权限 code 和 menuType 过滤菜单树
   * 使用统一的 filterMenuByUser 函数处理
   */
  const authorizedMenu = useMemo(() => {
    if (userMenus?.length) {
      return buildMenuFromUserMenus(userMenus);
    }
    return filterMenuByUser(MENU_CONFIG, isPlatformUser, []);
  }, [isPlatformUser, userMenus]);

  return (
    <Nav
      style={{ height: "100%" }}
      isCollapsed={collapsed}
      onCollapseChange={onCollapseChange}
      selectedKeys={[pathname]}
      header={{
        logo: (
          <Image src="/link.png" alt="Logo" width={160} height={60} priority />
        ),
        text: "引智数链",
      }}
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

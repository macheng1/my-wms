"use client";

import React, { useMemo } from "react";
import { Nav } from "@douyinfe/semi-ui-19";
import { useRouter, usePathname } from "next/navigation";

import { useUserStore } from "@/store/useUserStore";
import { MENU_CONFIG, filterMenuByUser } from "@/constants/menuConfig";
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

  // 从 Store 获取用户权限码列表
  const userInfo = useUserStore((state) => state.userInfo);
  const permissions = useMemo(() => userInfo?.permissions || [], [userInfo?.permissions]);
  const isPlatformUser = userInfo?.userType === "platform";

  /**
   * 核心逻辑：根据权限 code 和 menuType 过滤菜单树
   * 使用统一的 filterMenuByUser 函数处理
   */
  const authorizedMenu = useMemo(() => {
    return filterMenuByUser(MENU_CONFIG, isPlatformUser, permissions);
  }, [permissions, isPlatformUser]);

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

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Nav } from "@douyinfe/semi-ui-19";
import { useRouter, usePathname } from "next/navigation";

import { useUserStore } from "@/store/useUserStore";
import {
  MENU_CONFIG,
  buildMenuFromUserMenus,
  filterMenuByUser,
} from "@/constants/menuConfig";
import Image from "next/image";
import type { MenuItem } from "@/constants/menuConfig";

interface AppSiderProps {
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

const findOpenKeysByPath = (
  items: MenuItem[],
  pathname: string,
  ancestors: string[] = []
): string[] => {
  for (const item of items) {
    if (item.itemKey === pathname) return ancestors;

    if (item.items?.length) {
      const matchedKeys = findOpenKeysByPath(item.items, pathname, [
        ...ancestors,
        item.itemKey,
      ]);
      if (matchedKeys.length) return matchedKeys;
    }
  }

  return [];
};

const findTopOpenKey = (items: MenuItem[], itemKey: string): string | null => {
  for (const item of items) {
    if (item.itemKey === itemKey) return item.itemKey;
    if (item.items?.length) {
      const matchedKey = findTopOpenKey(item.items, itemKey);
      if (matchedKey) return item.itemKey;
    }
  }

  return null;
};

export const AppSider: React.FC<AppSiderProps> = ({
  collapsed,
  onCollapseChange,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

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

  useEffect(() => {
    setOpenKeys(findOpenKeysByPath(authorizedMenu, pathname));
  }, [authorizedMenu, pathname]);

  return (
    <Nav
      style={{ height: "100%" }}
      isCollapsed={collapsed}
      onCollapseChange={onCollapseChange}
      selectedKeys={[pathname]}
      openKeys={openKeys}
      header={{
        logo: (
          <Image src="/link.png" alt="Logo" width={160} height={60} priority />
        ),
        text: "引智数链",
      }}
      items={authorizedMenu}
      onOpenChange={({ itemKey, openKeys: nextOpenKeys = [], isOpen }) => {
        if (!isOpen) {
          setOpenKeys(nextOpenKeys.map(String));
          return;
        }

        const currentKey = String(itemKey || "");
        const topOpenKey = findTopOpenKey(authorizedMenu, currentKey);
        setOpenKeys(topOpenKey ? [topOpenKey] : nextOpenKeys.map(String));
      }}
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

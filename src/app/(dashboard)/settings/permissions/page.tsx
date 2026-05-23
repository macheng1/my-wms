"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import RoleAPI from "@/api/role";
import type { PlatformMenu } from "@/api/adminPlatform/types";
import type { TenantMenu } from "@/api/tenants/types";
import PlatformMenuLayout from "../platform-menus/components/PlatformMenuLayout";

type MenuRow = PlatformMenu & { depth?: number };

const normalizeMenus = (menus: TenantMenu[] = []): PlatformMenu[] =>
  menus.map((menu) => ({
    ...menu,
    id: menu.id,
    code: menu.code,
    name: menu.name,
    type: menu.type === "API" ? "BUTTON" : menu.type,
    scope: "tenant",
    parentId: Number(menu.parentId || 0),
    sortOrder: Number(menu.sortOrder || 0),
    isHidden: Number(menu.isHidden || 0),
    isActive: Number(menu.isActive ?? 1),
    children: menu.children?.length ? normalizeMenus(menu.children) : undefined,
  }));

const toMenuRow = (menu: PlatformMenu, depth: number): MenuRow => {
  const { children: _children, ...row } = menu;
  return { ...row, depth };
};

const flattenMenus = (menus: PlatformMenu[] = [], depth = 0): MenuRow[] =>
  menus.flatMap((menu) => [
    toMenuRow(menu, depth),
    ...(menu.children?.length ? flattenMenus(menu.children as PlatformMenu[], depth + 1) : []),
  ]);

export default function TenantPermissionsPage() {
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState<PlatformMenu[]>([]);
  const [selectedTopId, setSelectedTopId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RoleAPI.getTenantMenus();
      const list = normalizeMenus(res.data?.menus || []);
      setMenus(list);
      setSelectedTopId((current) => {
        if (current && list.some((menu) => Number(menu.id) === current)) {
          return current;
        }
        return Number(list.find((menu) => Number(menu.parentId || 0) === 0)?.id || 0) || null;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const flatMenus = useMemo(() => flattenMenus(menus), [menus]);

  const menuById = useMemo(() => {
    const map = new Map<number, MenuRow>();
    flatMenus.forEach((menu) => map.set(Number(menu.id), menu));
    return map;
  }, [flatMenus]);

  const childMap = useMemo(() => {
    const map = new Map<number, MenuRow[]>();
    flatMenus.forEach((menu) => {
      const parentId = Number(menu.parentId || 0);
      if (!map.has(parentId)) map.set(parentId, []);
      map.get(parentId)?.push(menu);
    });
    map.forEach((items) => {
      items.sort(
        (a, b) =>
          Number(a.sortOrder || 0) - Number(b.sortOrder || 0) ||
          Number(a.id) - Number(b.id),
      );
    });
    return map;
  }, [flatMenus]);

  const topMenus = useMemo(
    () =>
      (childMap.get(0) || [])
        .filter((menu) => menu.type !== "BUTTON" && Number(menu.isHidden || 0) !== 1),
    [childMap],
  );

  const getDescendants = useCallback(
    (parentId: number, depth = 0): MenuRow[] => {
      const children = childMap.get(parentId) || [];
      return children.flatMap((menu) => [
        { ...menu, depth },
        ...getDescendants(Number(menu.id), depth + 1),
      ]);
    },
    [childMap],
  );

  const rightData = useMemo(
    () => (selectedTopId ? getDescendants(selectedTopId) : []),
    [getDescendants, selectedTopId],
  );

  const selectedTop = selectedTopId ? menuById.get(selectedTopId) || null : null;

  return (
    <PlatformMenuLayout
      title="菜单管理"
      readonly
      loading={loading}
      topMenus={topMenus}
      selectedTop={selectedTop}
      selectedTopId={selectedTopId}
      dataSource={rightData}
      onSelectTop={setSelectedTopId}
      onRefresh={loadData}
    />
  );
}

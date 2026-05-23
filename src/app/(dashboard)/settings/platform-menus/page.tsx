"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Toast } from "@douyinfe/semi-ui-19";
import AdminPlatformAPI from "@/api/adminPlatform";
import { PlatformPermission, SavePlatformMenuParams } from "@/api/adminPlatform/types";
import PlatformMenuEditModal, { ParentMenuOption } from "./components/PlatformMenuEditModal";
import PlatformMenuLayout, { PlatformMenuQuery } from "./components/PlatformMenuLayout";

const DEFAULT_QUERY: PlatformMenuQuery = {
  name: "",
  code: "",
  routePath: "",
  type: "all",
  isHidden: -1,
};

export default function PlatformMenusPage() {
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState<PlatformPermission[]>([]);
  const [selectedTopId, setSelectedTopId] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<PlatformPermission | null>(null);
  const [defaultParentId, setDefaultParentId] = useState(0);
  const [query, setQuery] = useState<PlatformMenuQuery>(DEFAULT_QUERY);
  const [searchFormApi, setSearchFormApi] = useState<any>(null);

  const menuById = useMemo(() => {
    const map = new Map<number, PlatformPermission>();
    menus.forEach((menu) => map.set(Number(menu.id), menu));
    return map;
  }, [menus]);

  const topMenus = useMemo(
    () =>
      menus
        .filter((menu) => Number(menu.parentId || 0) === 0 && menu.type !== "BUTTON")
        .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0) || Number(a.id) - Number(b.id)),
    [menus],
  );

  const childMap = useMemo(() => {
    const map = new Map<number, PlatformPermission[]>();
    menus.forEach((menu) => {
      const parentId = Number(menu.parentId || 0);
      if (!map.has(parentId)) map.set(parentId, []);
      map.get(parentId)?.push(menu);
    });
    map.forEach((items) => {
      items.sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0) || Number(a.id) - Number(b.id));
    });
    return map;
  }, [menus]);

  const selectedTop = selectedTopId ? menuById.get(selectedTopId) || null : null;

  const getDescendants = useCallback((parentId: number, depth = 0): Array<PlatformPermission & { depth: number }> => {
    const children = childMap.get(parentId) || [];
    return children.flatMap((menu) => [
      { ...menu, depth },
      ...getDescendants(Number(menu.id), depth + 1),
    ]);
  }, [childMap]);

  const rightData = useMemo(() => {
    if (!selectedTopId) return [];
    return getDescendants(selectedTopId).filter((menu) => {
      if (query.name && !menu.name.includes(query.name)) return false;
      if (query.code && !menu.code.includes(query.code)) return false;
      if (query.routePath && !(menu.routePath || "").includes(query.routePath)) return false;
      if (query.type !== "all" && menu.type !== query.type) return false;
      if (query.isHidden === 0 || query.isHidden === 1) return Number(menu.isHidden || 0) === query.isHidden;
      return true;
    });
  }, [childMap, query, selectedTopId]);

  const parentOptions: ParentMenuOption[] = useMemo(
    () =>
      menus
        .filter((menu) => menu.type !== "BUTTON" && Number(menu.id) !== Number(currentMenu?.id || 0))
        .map((menu) => ({
          label: menu.parentId ? `${menuById.get(Number(menu.parentId))?.name || "顶级"} / ${menu.name}` : menu.name,
          value: Number(menu.id),
        })),
    [currentMenu?.id, menuById, menus],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminPlatformAPI.getMenus();
      const list = res.data || [];
      setMenus(list);
      setSelectedTopId((current) => {
        if (current && list.some((menu) => Number(menu.id) === current)) return current;
        return Number(list.find((menu) => Number(menu.parentId || 0) === 0)?.id || 0) || null;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = (parentId: number) => {
    setCurrentMenu(null);
    setDefaultParentId(parentId);
    setVisible(true);
  };

  const handleEdit = async (record: PlatformPermission) => {
    setLoading(true);
    try {
      const res = await AdminPlatformAPI.getMenuDetail(record.id);
      setCurrentMenu(res.data);
      setDefaultParentId(Number(res.data.parentId || 0));
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: SavePlatformMenuParams) => {
    await AdminPlatformAPI.saveMenu({
      ...values,
      id: currentMenu?.id as number | undefined,
    });
    Toast.success("保存成功");
    setVisible(false);
    setCurrentMenu(null);
    await loadData();
  };

  const handleDelete = (record: PlatformPermission) => {
    Modal.confirm({
      title: "确认删除平台菜单",
      content: `确认删除「${record.name}」？如果存在下级菜单或角色绑定，系统会阻止删除。`,
      onOk: async () => {
        await AdminPlatformAPI.deleteMenu(record.id);
        Toast.success("删除成功");
        await loadData();
      },
    });
  };

  const handleSearch = (values: Partial<PlatformMenuQuery>) => {
    setQuery({ ...query, ...values });
  };

  const handleReset = () => {
    const nextQuery = { ...DEFAULT_QUERY };
    searchFormApi?.setValues(nextQuery);
    setQuery(nextQuery);
  };

  return (
    <>
      <PlatformMenuLayout
        loading={loading}
        topMenus={topMenus}
        selectedTop={selectedTop}
        selectedTopId={selectedTopId}
        dataSource={rightData}
        defaultQuery={DEFAULT_QUERY}
        onSelectTop={setSelectedTopId}
        onRefresh={loadData}
        onCreateTop={() => openCreate(0)}
        onCreateChild={openCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSearch={handleSearch}
        onReset={handleReset}
        onSearchFormReady={setSearchFormApi}
      />

      <PlatformMenuEditModal
        visible={visible}
        currentMenu={currentMenu}
        defaultParentId={defaultParentId}
        parentOptions={parentOptions}
        onCancel={() => setVisible(false)}
        onSubmit={handleSave}
      />
    </>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Space, Spin, Toast, Tree, Typography } from "@douyinfe/semi-ui-19";
import TenantsAPI from "@/api/tenants";
import { TenantMenu } from "@/api/tenants/types";

const { Text } = Typography;

type MenuTreeNode = {
  label: string;
  key: string;
  children?: MenuTreeNode[];
};

const toTreeData = (list: TenantMenu[] = []): MenuTreeNode[] => {
  const sortedList = [...list].sort(
    (a, b) =>
      Number(a.sortOrder || 0) - Number(b.sortOrder || 0) ||
      Number(a.id) - Number(b.id),
  );

  return sortedList.map((menu) => ({
    label: menu.name,
    key: menu.code,
    children: menu.children?.length ? toTreeData(menu.children) : undefined,
  }));
};

const buildTreeByParentId = (list: TenantMenu[] = []): TenantMenu[] => {
  const nodeMap = new Map<number, TenantMenu & { children: TenantMenu[] }>();
  const childMap = new Map<number, Array<TenantMenu & { children: TenantMenu[] }>>();

  list.forEach((menu) => {
    const node = { ...menu, children: [] };
    const id = Number(menu.id);
    const parentId = Number(menu.parentId || 0);

    nodeMap.set(id, node);
    if (!childMap.has(parentId)) {
      childMap.set(parentId, []);
    }
    childMap.get(parentId)?.push(node);
  });

  childMap.forEach((children, parentId) => {
    children.sort(
      (a, b) =>
        Number(a.sortOrder || 0) - Number(b.sortOrder || 0) ||
        Number(a.id) - Number(b.id),
    );

    const parent = nodeMap.get(parentId);
    if (parent) {
      parent.children = children;
    }
  });

  const roots = childMap.get(0) || [];
  const rootIds = new Set(roots.map((item) => Number(item.id)));

  childMap.forEach((children, parentId) => {
    if (parentId !== 0 && !nodeMap.has(parentId)) {
      children.forEach((child) => {
        if (!rootIds.has(Number(child.id))) {
          roots.push(child);
          rootIds.add(Number(child.id));
        }
      });
    }
  });

  return roots;
};

const normalizeMenuTree = (list: TenantMenu[] = []): TenantMenu[] => {
  if (list.some((menu) => menu.children?.length)) {
    return list;
  }

  return buildTreeByParentId(list);
};

const collectTreeKeys = (nodes: MenuTreeNode[] = []): string[] =>
  nodes.flatMap((node) => [
    node.key,
    ...(node.children?.length ? collectTreeKeys(node.children) : []),
  ]);

const collectAncestorKeys = (
  nodes: MenuTreeNode[] = [],
  checkedKeySet: Set<string>,
  ancestors: string[] = [],
): string[] =>
  nodes.flatMap((node) => {
    const childAncestorKeys = node.children?.length
      ? collectAncestorKeys(node.children, checkedKeySet, [...ancestors, node.key])
      : [];
    return checkedKeySet.has(node.key)
      ? [...ancestors, ...childAncestorKeys]
      : childAncestorKeys;
  });

interface TenantMenuModalProps {
  visible: boolean;
  tenant?: { id?: string; name?: string } | null;
  onClose: () => void;
}

export default function TenantMenuModal({
  visible,
  tenant,
  onClose,
}: TenantMenuModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menus, setMenus] = useState<TenantMenu[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!visible || !tenant?.id) return;

    setLoading(true);
    TenantsAPI.getTenantMenus(tenant.id)
      .then((res) => {
        setMenus(res.data?.menus || []);
        setCheckedKeys(res.data?.selectedCodes || []);
      })
      .finally(() => setLoading(false));
  }, [visible, tenant?.id]);

  const treeData = useMemo(() => toTreeData(normalizeMenuTree(menus)), [menus]);

  useEffect(() => {
    setExpandedKeys(collectTreeKeys(treeData));
  }, [treeData]);

  const allMenuCodes = useMemo(() => collectTreeKeys(treeData), [treeData]);
  const mergeHalfCheckedMenuCodes = (keys: string[]) =>
    Array.from(
      new Set([
        ...keys,
        ...collectAncestorKeys(treeData, new Set(keys)),
      ]),
    );

  const handleSave = async () => {
    if (!tenant?.id) return;

    setSaving(true);
    try {
      await TenantsAPI.saveTenantMenus(tenant.id, mergeHalfCheckedMenuCodes(checkedKeys));
      Toast.success("租户菜单已保存");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`管理菜单${tenant?.name ? ` - ${tenant.name}` : ""}`}
      visible={visible}
      onCancel={onClose}
      width={680}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 12 }}>
            取消
          </Button>
          <Button theme="solid" type="primary" loading={saving} onClick={handleSave}>
            保存
          </Button>
        </div>
      }
    >
      <Text type="secondary">
        平台在这里配置该租户可使用的统一菜单，租户管理员只能在这些菜单里给角色分配权限。
      </Text>
      <Space style={{ marginTop: 16 }}>
        <Button size="small" onClick={() => setCheckedKeys(allMenuCodes)}>
          全选
        </Button>
        <Button size="small" onClick={() => setCheckedKeys([])}>
          清空
        </Button>
        <Button size="small" onClick={() => setExpandedKeys(allMenuCodes)}>
          展开全部
        </Button>
        <Button size="small" onClick={() => setExpandedKeys([])}>
          收起全部
        </Button>
        <Text type="tertiary" size="small">
          已选 {checkedKeys.length} / {allMenuCodes.length}
        </Text>
      </Space>
      <div
        style={{
          marginTop: 12,
          border: "1px solid var(--semi-color-border)",
          borderRadius: "var(--semi-border-radius-medium)",
          padding: 12,
          minHeight: 320,
          maxHeight: 460,
          overflowY: "auto",
          backgroundColor: "var(--semi-color-fill-0)",
        }}
      >
        {loading ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <Spin />
          </div>
        ) : (
          <Tree
            treeData={treeData}
            multiple
            value={checkedKeys}
            onChange={(values) => setCheckedKeys(Array.isArray(values) ? values : [])}
            expandedKeys={expandedKeys}
            onExpand={(keys) => setExpandedKeys(keys)}
          />
        )}
      </div>
    </Modal>
  );
}

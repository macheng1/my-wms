"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Space, Spin, Toast, Tree, Typography } from "@douyinfe/semi-ui-19";
import TenantsAPI from "@/api/tenants";
import { TenantMenuPermission } from "@/api/tenants/types";

const { Text } = Typography;

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
  const [menus, setMenus] = useState<TenantMenuPermission[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);

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

  const treeData = useMemo(
    () =>
      menus.map((menu) => ({
        label: `${menu.name}（${menu.code}）`,
        key: menu.code,
      })),
    [menus],
  );

  const allMenuCodes = useMemo(() => menus.map((menu) => menu.code), [menus]);

  const handleSave = async () => {
    if (!tenant?.id) return;

    setSaving(true);
    try {
      await TenantsAPI.saveTenantMenus(tenant.id, checkedKeys);
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
            defaultExpandAll
          />
        )}
      </div>
    </Modal>
  );
}

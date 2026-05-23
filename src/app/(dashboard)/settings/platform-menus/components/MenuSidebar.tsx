"use client";

import { Button, Space, Typography } from "@douyinfe/semi-ui-19";
import { IconPlus, IconRefresh } from "@douyinfe/semi-icons";
import { PlatformMenu } from "@/api/adminPlatform/types";

const { Text } = Typography;

interface MenuSidebarProps {
  loading?: boolean;
  menus: PlatformMenu[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onRefresh: () => void;
  onCreateTop: () => void;
}

export default function MenuSidebar({
  menus,
  selectedId,
  onSelect,
  onRefresh,
  onCreateTop,
}: MenuSidebarProps) {
  return (
    <div style={{ borderRight: "1px solid var(--semi-color-border)", paddingRight: 12 }}>
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text strong>顶级菜单</Text>
        <Space>
          <Button size="small" icon={<IconRefresh />} onClick={onRefresh} />
          <Button size="small" icon={<IconPlus />} theme="solid" onClick={onCreateTop} />
        </Space>
      </div>

      <Space vertical align="start" style={{ width: "100%" }}>
        {menus.map((menu) => (
          <Button
            key={menu.id}
            theme={Number(menu.id) === selectedId ? "solid" : "borderless"}
            type={Number(menu.id) === selectedId ? "primary" : "tertiary"}
            onClick={() => onSelect(Number(menu.id))}
            style={{ width: "100%", justifyContent: "flex-start" }}
          >
            {menu.name}
          </Button>
        ))}
      </Space>
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import {
  Layout,
  Breadcrumb,
  Button,
  Avatar,
  Dropdown,
  Space,
  Typography,
} from "@douyinfe/semi-ui-19";
import {
  IconBell,
  IconHelpCircle,
  IconUser,
  IconSetting,
} from "@douyinfe/semi-icons";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { MENU_CONFIG, MenuItem } from "@/constants/menuConfig";

const { Header } = Layout;
const { Text } = Typography;

export const AppHeader: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  // 💡 修正 1: 从 userInfo 中解构 permissions，或者直接从 store 获取
  const { userInfo, logout } = useUserStore();
  const permissions = userInfo?.permissions || [];

  /**
   * 递归查找匹配项，增加对通配符权限的健壮判断
   */
  const findItemByPath = (
    items: MenuItem[],
    targetKey: string
  ): MenuItem | null => {
    for (const item of items) {
      if (item.itemKey === targetKey) return item;
      if (item.items) {
        const result = findItemByPath(item.items, targetKey);
        if (result) return result;
      }
    }
    return null;
  };

  /**
   * 💡 修正 2: 动态面包屑优化 - 即使找不到配置也显示路径名，保证 404 时布局不崩
   */
  const breadcrumbItems = useMemo(() => {
    const items = [
      <Breadcrumb.Item
        key="home"
        onClick={() => router.push("/")}
        style={{ cursor: "pointer" }}
      >
        首页
      </Breadcrumb.Item>,
    ];

    if (pathname === "/" || pathname === "") return items;

    const pathSnippets = pathname.split("/").filter(Boolean);
    const isSuperAdmin = permissions.includes("*"); // 💡 修正超级权限判断逻辑

    pathSnippets.forEach((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const menuItem = findItemByPath(MENU_CONFIG, url);

      if (menuItem) {
        // 权限检查
        const hasAuth =
          isSuperAdmin || !menuItem.code || permissions.includes(menuItem.code);
        if (hasAuth) {
          items.push(
            <Breadcrumb.Item key={url}>{menuItem.text}</Breadcrumb.Item>
          );
        }
      } else {
        // 💡 优化 3: 容错处理。如果路径在菜单里找不到（如 404 页面），显示原始路径名
        // 这样可以确保你在 warehouse/area 找不到页面时，面包屑依然显示“area”
        items.push(
          <Breadcrumb.Item key={url}>{pathSnippets[index]}</Breadcrumb.Item>
        );
      }
    });

    return items;
  }, [pathname, permissions, router]);

  const handleLogout = () => {
    // 💡 修正 4: logout 内部已处理清理，这里只需执行并跳转
    logout();
    // 使用 replace 防止后退回到已登录状态
    router.replace("/login");
  };

  return (
    <Header
      style={{
        backgroundColor: "var(--semi-color-bg-1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 24px",
        height: "60px",
        borderBottom: "1px solid var(--semi-color-border)",
        zIndex: 10, // 💡 提高层级，确保在滚动时处于最上方
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Breadcrumb>{breadcrumbItems}</Breadcrumb>
      </div>

      <Space spacing="medium">
        <Button
          theme="borderless"
          icon={<IconBell size="large" />}
          style={{ color: "var(--semi-color-text-2)" }}
        />
        <Button
          theme="borderless"
          icon={<IconHelpCircle size="large" />}
          style={{ color: "var(--semi-color-text-2)" }}
        />

        <Dropdown
          position="bottomRight"
          render={
            <Dropdown.Menu style={{ width: 200 }}>
              <div
                style={{
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <Avatar color="blue" size="small">
                  {userInfo?.username?.toUpperCase() || ""}
                </Avatar>
                <div>
                  <Text strong style={{ display: "block" }}>
                    {userInfo?.username || "未登录"}
                  </Text>
                  <Text type="secondary" size="small">
                    {/* 💡 这里根据你 WMS 的实际角色显示 */}
                    {userInfo?.role === "admin" ? "超级管理员" : "仓库操作员"}
                  </Text>
                </div>
              </div>
              <Dropdown.Divider />
              <Dropdown.Item icon={<IconUser />}>个人信息</Dropdown.Item>
              <Dropdown.Item icon={<IconSetting />}>系统设置</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item
                type="danger"
                // icon={<IconSignOut />}
                onClick={handleLogout}
              >
                退出登录
              </Dropdown.Item>
            </Dropdown.Menu>
          }
        >
          {/* 💡 增加加载态展示，防止 userInfo 还没拿到时显示 U */}
          <span
            style={{
              cursor: "pointer",
              marginLeft: 8,
              display: "inline-block",
            }}
          >
            <Avatar color="blue" size="small">
              {userInfo ? userInfo.username : "..."}
            </Avatar>
          </span>
        </Dropdown>
      </Space>
    </Header>
  );
};

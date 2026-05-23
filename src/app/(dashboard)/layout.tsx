"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Layout, Empty, Button } from "@douyinfe/semi-ui-19"; // 引入 Spin
import { usePathname, useRouter } from "next/navigation";
import { AppSider } from "@/components/layout/AppSider";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthInitializer } from "@/components/layout/AuthInitializer";
import { useUserStore } from "@/store/useUserStore";
import { collectUserMenuCodes, MENU_CONFIG, MenuItem } from "@/constants/menuConfig";
import { IllustrationNoAccess } from "@douyinfe/semi-illustrations";

const { Sider, Content } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // 1. 直接从 Store 获取信息
  const { userInfo } = useUserStore();

  // 💡 派生状态：不再使用 useState + useEffect
  // 假设初始状态 userInfo 为 null，获取到数据后 userInfo.id 存在
  const isUserLoaded = !!userInfo?.id;
  const menuCodes = useMemo(
    () => collectUserMenuCodes(userInfo?.menus || []),
    [userInfo?.menus]
  );

  /**
   * 💡 2. 递归查找当前路径对应的权限码
   */
  const currentPageCode = useMemo(() => {
    const findCode = (items: MenuItem[]): string | undefined => {
      for (const item of items) {
        if (item.itemKey === pathname) return item.code;
        if (item.items) {
          const code = findCode(item.items);
          if (code) return code;
        }
      }
      return undefined;
    };
    return findCode(MENU_CONFIG);
  }, [pathname]);

  /**
   * 💡 3. 核心权限校验逻辑
   */
  const hasPermission = useMemo(() => {
    // 如果还没加载完，默认不放行（显示 loading）
    if (!isUserLoaded) return false;
    // 首页放行
    if (pathname === "/") return true;
    // 如果页面没配置 code，默认放行
    if (!currentPageCode) return true;
    return menuCodes.includes(currentPageCode);
  }, [pathname, currentPageCode, menuCodes, isUserLoaded]);

  /**
   * 💡 4. 处理无权限时的弹窗拦截 (可选)
   * 如果你已经有了 Empty 占位图，其实弹窗可以去掉，体验会更丝滑
   */
  useEffect(() => {
    if (isUserLoaded && !hasPermission && pathname !== "/") {
      // 仅在明确加载完成且没权限时才提示
      console.warn("Menu denied for:", pathname);
    }
  }, [isUserLoaded, hasPermission, pathname]);

  return (
    <Layout style={{ height: "100vh" }}>
      {/* 负责静默获取用户信息和 Token 校验 */}
      <AuthInitializer />

      <Sider
        style={{
          backgroundColor: "var(--semi-color-bg-1)",
          width: collapsed ? 60 : 240,
          transition: "width 0.2s",
          borderRight: "1px solid var(--semi-color-border)",
        }}
      >
        <AppSider collapsed={collapsed} onCollapseChange={setCollapsed} />
      </Sider>

      <Layout>
        <AppHeader />
        <Content
          style={{
            padding: "20px",
            backgroundColor: "var(--semi-color-bg-0)",
            overflowY: "auto",
          }}
        >
          {!isUserLoaded ? (
            /* 💡 优化 1：加载中的 Vibe 体验 */
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            ></div>
          ) : hasPermission ? (
            /* 💡 优化 2：有权限，正常显示 */
            <div
              style={{
                backgroundColor: "var(--semi-color-bg-1)",
                padding: "24px",
                borderRadius: "12px",
                minHeight: "100%",
                border: "1px solid var(--semi-color-border)",
              }}
            >
              {children}
            </div>
          ) : (
            /* 💡 优化 3：无权限，显示 Empty 而不是直接 null */
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--semi-color-bg-1)",
                borderRadius: "12px",
              }}
            >
              <Empty
                image={
                  <IllustrationNoAccess style={{ width: 150, height: 150 }} />
                }
                title="访问受限"
                description="您暂无权限查看此页面，请联系管理员分配权限。"
              >
                <Button theme="solid" onClick={() => router.back()}>
                  返回上一页
                </Button>
                <Button
                  variant="tertiary"
                  onClick={() => router.replace("/login")}
                  style={{ marginLeft: 8 }}
                >
                  切换账号
                </Button>
              </Empty>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}

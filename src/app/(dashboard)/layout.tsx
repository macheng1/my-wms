"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Layout, Modal, Empty, Button } from "@douyinfe/semi-ui-19";
import { usePathname, useRouter } from "next/navigation";
import { AppSider } from "@/components/layout/AppSider";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthInitializer } from "@/components/layout/AuthInitializer";
import { useUserStore } from "@/store/useUserStore";
import { MENU_CONFIG, MenuItem } from "@/constants/menuConfig";
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

  // 从 Store 中获取用户信息和权限
  const { userInfo, logout } = useUserStore();
  const [userInfoLoaded, setUserInfoLoaded] = useState(false);
  const permissions = userInfo?.permissions || [];

  // 监听 userInfo 变化，判断是否已加载完成
  useEffect(() => {
    // userInfo 存在且有 id 字段才算加载完成
    setUserInfoLoaded(!!userInfo && !!userInfo.id);
  }, [userInfo]);

  /**
   * 💡 1. 递归查找当前路径对应的权限码
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
   * 💡 2. 核心权限校验逻辑：增加超级管理员判断
   */
  const hasPermission = useMemo(() => {
    // 未加载完 userInfo 时不做权限判断
    if (!userInfoLoaded) return false;
    // 首页放行
    if (pathname === "/") return true;
    // 超级管理员拥有所有权限
    if (permissions.includes("*")) return true;
    // 如果页面没配置 code，默认放行，否则检查用户是否拥有该 code
    if (!currentPageCode) return true;
    return permissions.includes(currentPageCode);
  }, [pathname, currentPageCode, permissions, userInfoLoaded]);

  /**
   * 💡 3. 拦截无权限访问
   */
  useEffect(() => {
    // 只有在 userInfo 加载完成且确定没有权限时才弹窗
    if (userInfoLoaded && !hasPermission) {
      Modal.warning({
        title: "权限提示",
        content: "您当前暂无权访问此页面，请尝试重新登录或联系管理员。",
        okText: "去登录",
        onOk: () => {
          logout();
          router.replace("/login");
        },
      });
    }
  }, [userInfoLoaded, hasPermission, logout, router]);

  return (
    <Layout style={{ height: "100vh" }}>
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
          {/* 只有 userInfo 加载完成后才渲染内容，否则可加 loading 占位 */}
          {userInfoLoaded ? (
            hasPermission ? (
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
              /* 💡 无权限占位 UI */
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
                  style={{ textAlign: "center" }}
                  title="暂无权限访问"
                  description="超级管理员拥有最高权限，请检查账号登录状态。"
                >
                  <Button theme="solid" onClick={() => router.back()}>
                    返回上一页
                  </Button>
                </Empty>
              </div>
            )
          ) : null}
        </Content>
      </Layout>
    </Layout>
  );
}

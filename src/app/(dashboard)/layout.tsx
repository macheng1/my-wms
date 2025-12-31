'use client';

import React, { useState } from 'react';
import { Layout } from '@douyinfe/semi-ui-19';
import { AppSider } from '@/components/layout/AppSider';
import { AppHeader } from '@/components/layout/AppHeader';
import { AuthInitializer } from '@/components/layout/AuthInitializer';

const { Sider, Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ height: '100vh' }}>
      <AuthInitializer />
      <Sider style={{ backgroundColor: 'var(--semi-color-bg-1)' }}>
        <AppSider collapsed={collapsed} onCollapseChange={setCollapsed} />
      </Sider>

      <Layout>
        <AppHeader />
        <Content style={{ 
          padding: '20px', 
          backgroundColor: 'var(--semi-color-bg-0)', 
          overflowY: 'auto' 
        }}>
          {/* 这里是页面内容的容器，增加一个内边距背景卡片感 */}
          <div style={{ 
            backgroundColor: 'var(--semi-color-bg-1)', 
            padding: '24px', 
            borderRadius: '12px',
            minHeight: '100%',
            border: '1px solid var(--semi-color-border)'
          }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
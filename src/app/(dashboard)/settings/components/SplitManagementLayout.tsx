"use client";

import React from "react";
import { Typography } from "@douyinfe/semi-ui-19";

const { Title } = Typography;

interface SplitManagementLayoutProps {
  title: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  sidebarWidth?: number;
}

export default function SplitManagementLayout({
  title,
  sidebar,
  children,
  sidebarWidth = 240,
}: SplitManagementLayoutProps) {
  return (
    <div style={{ padding: 4 }}>
      <Title heading={5} style={{ margin: "0 0 16px" }}>
        {title}
      </Title>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `${sidebarWidth}px minmax(0, 1fr)`,
          gap: 16,
          alignItems: "start",
        }}
      >
        {sidebar}
        <div style={{ minWidth: 0 }}>{children}</div>
      </div>
    </div>
  );
}

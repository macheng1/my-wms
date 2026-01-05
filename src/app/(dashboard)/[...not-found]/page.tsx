"use client";

import React from "react";
import { Empty, Button } from "@douyinfe/semi-ui-19";
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from "@douyinfe/semi-illustrations";
import { useRouter } from "next/navigation";

export default function NotFoundInsideLayout() {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: "400px",
      }}
    >
      <Empty
        image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
        darkModeImage={
          <IllustrationNoResultDark style={{ width: 150, height: 150 }} />
        }
        title="页面找不到了"
        description="抱歉，您访问的功能模块可能正在开发中或已被移除。"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button theme="solid" type="primary" onClick={() => router.push("/")}>
            返回工作台
          </Button>
        </div>
      </Empty>
    </div>
  );
}

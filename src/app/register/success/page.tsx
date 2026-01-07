// src/app/register/success/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Typography,
  Descriptions,
  Banner,
  Toast,
  Spin,
} from "@douyinfe/semi-ui-19";
import { IconTickCircle, IconArrowRight } from "@douyinfe/semi-icons";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

type RegSuccessInfo = {
  tenantName: string;
  tenantCode: string;
  username?: string;
  adminUser?: string;
};

export default function RegisterSuccessPage() {
  const router = useRouter();
  const [info, setInfo] = useState<RegSuccessInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("reg_success_data");
      if (raw) {
        setInfo(JSON.parse(raw));
      }
    } catch (e) {
      console.error("解析 reg_success_data 失败", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    Toast.success("已复制到剪贴板");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card style={{ borderRadius: 12 }}>
          <Banner
            type="warning"
            title="未获取到注册信息"
            description="请返回重新提交入驻申请"
          />
          <Button
            className="mt-4"
            theme="solid"
            type="primary"
            onClick={() => router.push("/register")}
          >
            返回注册
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card
        className="w-full max-w-lg shadow-xl"
        style={{ borderRadius: 12 }}
        bodyStyle={{ padding: 40 }}
      >
        {/* 成功头 */}
        <div className="text-center mb-8">
          <IconTickCircle
            style={{
              color: "var(--semi-color-success)",
              fontSize: 64,
              marginBottom: 16,
            }}
          />
          <Title heading={2} style={{ marginBottom: 8 }}>
            入驻申请提交成功
          </Title>
          <Text type="secondary">企业空间已创建完成，请使用以下信息登录</Text>
        </div>

        <Banner
          fullMode={false}
          type="info"
          bordered
          title="请妥善保管以下登录凭证（建议截图保存）"
          className="mb-6"
        />

        <Descriptions
          align="center"
          size="medium"
          column={1}
          data={[
            { key: "企业名称", value: info.tenantName },
            {
              key: "企业编码",
              value: (
                <Text
                  strong
                  copyable={{ onCopy: () => handleCopy(info.tenantCode) }}
                >
                  {info.tenantCode}
                </Text>
              ),
            },
            {
              key: "管理员账号",
              value: info.username || info.adminUser || "-",
            },
          ]}
        />

        <div className="mt-10 flex flex-col gap-3">
          <Button
            theme="solid"
            type="primary"
            size="large"
            block
            icon={<IconArrowRight />}
            onClick={() => {
              sessionStorage.removeItem("reg_success_data");
              router.push("/login");
            }}
          >
            立即前往登录
          </Button>

          <Text type="tertiary" size="small" className="text-center">
            如有疑问，请联系平台技术支持
          </Text>
        </div>
      </Card>
    </div>
  );
}

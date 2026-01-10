"use client";

import React, { useState } from "react";
import { Form, Button, Typography, Toast } from "@douyinfe/semi-ui-19";
import { IconUser, IconLock, IconApartment } from "@douyinfe/semi-icons";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import AuthAPI from "@/api/auth";
import { UserAPI } from "@/api";

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { setToken, setUserInfo } = useUserStore();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // 调用登录接口
      const res = await AuthAPI.login({
        code: values.code,
        username: values.username,
        password: values.password,
        remember: values.remember,
      });

      // 保存 token
      setToken(res.access_token);

      // 3. 异步获取用户信息
      const userRes = await UserAPI.getUserInfo();
      setUserInfo(userRes.data);

      Toast.success("登录成功，欢迎回来");

      router.replace("/");
    } catch (error: any) {
      Toast.error(error?.message || "登录失败，请检查账号密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-slate-50">
      {/* ==================== 左侧：品牌视觉区 (仅在PC端显示) ==================== */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-blue-900 relative flex-col justify-between p-12 text-white">
        {/* 背景图层：建议找一张高质量的数控机床、自动化车间或数据连接的图片 */}
        <div
          className="absolute inset-0 z-0 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: "url(/images/industrial-bg.jpg)", // 💡 请替换为你的实际图片路径
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(30%) contrast(1.2)",
          }}
        ></div>

        {/* 渐变遮罩：确保文字清晰 */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-blue-900/50 to-indigo-950/90"></div>

        {/* 顶部 Logo */}
        <div className="relative z-20 flex items-center gap-3">
          {/* 这里用一个简单的占位符代替你的复杂 Logo，实际请用 Image 组件 */}
          <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center border border-white/20">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <Title
              heading={4}
              style={{ color: "white", fontWeight: 700, lineHeight: 1 }}
            >
              引智数链
            </Title>
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "12px",
                letterSpacing: "1px",
              }}
            >
              PINLINK PLATFORM
            </Text>
          </div>
        </div>

        {/* 中间 Slogan */}
        <div className="relative z-20 mb-20">
          <Title
            heading={1}
            style={{
              color: "white",
              fontWeight: 800,
              fontSize: "42px",
              lineHeight: 1.2,
              marginBottom: "24px",
            }}
          >
            赋能制造律动
            <br />
            链接工业未来
          </Title>
          <Text className="text-blue-100 text-lg" style={{ color: "#fff" }}>
            深耕戴南时堰，打造精密制造产业的数智化底座。
          </Text>
        </div>

        {/* 底部版权 */}
        <div className="relative z-20 text-blue-200/60 text-sm">
          © 2026 PinLink Industrial IoT. All rights reserved.
        </div>
      </div>

      {/* ==================== 右侧：登录表单区 ==================== */}
      <div className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-4 sm:p-8 md:p-12 bg-white">
        <div className="w-full max-w-[440px] space-y-8">
          {/* 移动端显示的简化头部 */}
          <div className="md:hidden text-center mb-8">
            <Title heading={3}>引智数链 PinLink</Title>
          </div>

          <div className="mb-8">
            <Title heading={2} style={{ fontWeight: 700, marginBottom: "8px" }}>
              欢迎回来
            </Title>
            <Text type="tertiary" size="normal">
              请使用企业编码和账号登录您的工业空间
            </Text>
          </div>

          <Form onSubmit={handleSubmit} className="w-full" labelPosition="top">
            <Form.Input
              field="code"
              label="企业编码"
              placeholder="输入企业编码"
              prefix={<IconApartment className="text-slate-400" />}
              size="large"
              rules={[{ required: true, message: "请输入企业编码" }]}
              style={{ borderRadius: "8px" }}
            />

            <Form.Input
              field="username"
              label="账号"
              placeholder="输入用户名/手机号"
              prefix={<IconUser className="text-slate-400" />}
              size="large"
              rules={[{ required: true, message: "请输入账号" }]}
              style={{ marginTop: 20, borderRadius: "8px" }}
            />

            <Form.Input
              field="password"
              label="密码"
              type="password"
              placeholder="输入密码"
              prefix={<IconLock className="text-slate-400" />}
              size="large"
              rules={[{ required: true, message: "请输入密码" }]}
              style={{ marginTop: 20, borderRadius: "8px" }}
            />

            <div className="flex justify-between items-center mt-6 mb-8">
              <Form.Checkbox field="remember" noLabel>
                <Text type="secondary">记住我</Text>
              </Form.Checkbox>
              <Text
                link
                className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                忘记密码？
              </Text>
            </div>

            <Button
              htmlType="submit"
              type="primary"
              theme="solid"
              block
              size="large"
              loading={loading}
              style={{
                height: "50px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "16px",
                background: "linear-gradient(to right, #2563eb, #3b82f6)",
                border: "none",
              }}
            >
              登录
            </Button>
          </Form>

          <div className="mt-8 text-center">
            <Text type="tertiary">
              还没有加入引智数链？
              <Text
                link
                onClick={() => router.push("/register")}
                style={{
                  fontWeight: 600,
                  marginLeft: "8px",
                  cursor: "pointer",
                  color: "#2563eb",
                }}
              >
                立即注册新工厂
              </Text>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}

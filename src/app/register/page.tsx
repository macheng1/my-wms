"use client";

import React, { useState } from "react";
import {
  Form,
  Button,
  Card,
  Typography,
  Toast,
  Select,
  Divider,
} from "@douyinfe/semi-ui-19";
import {
  IconUser,
  IconLock,
  IconHome,
  IconBriefcase,
  IconArrowLeft,
  IconPhone,
  IconIdCard,
} from "@douyinfe/semi-icons";
import { useRouter } from "next/navigation";
import { AuthAPI } from "@/api";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    // 前端二次确认密码校验
    if (values.adminPass !== values.confirmPass) {
      Toast.error("两次输入的管理员密码不一致");
      return;
    }

    setLoading(true);
    try {
      await AuthAPI.register({
        code: values.code,
        name: values.name,
        industry: values.industry,
        contactPerson: values.contactPerson,
        contactPhone: values.contactPhone,
        adminUser: values.adminUser,
        adminPass: values.adminPass,
      });

      Toast.success("企业入驻成功，请登录管理员账号");
      router.push("/login");
    } catch (error) {
      // 错误提示由 request 拦截器统一处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* 科技感背景装饰 */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/40 blur-3xl"></div>

      <Card
        className="w-full max-w-2xl z-10 shadow-2xl border-0"
        style={{
          borderRadius: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.98)",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <Button
          theme="borderless"
          icon={<IconArrowLeft />}
          onClick={() => router.back()}
          style={{ marginBottom: 16 }}
        >
          返回登录
        </Button>

        <div className="mb-8">
          <Title heading={3} style={{ fontWeight: 700 }}>
            新工厂/租户入驻
          </Title>
          <Text type="tertiary">
            请完善企业及管理员信息以开通 WMS 智能仓储服务
          </Text>
        </div>

        <Form onSubmit={handleSubmit} labelPosition="top">
          {/* 区块一：企业身份信息 */}
          <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold">
            <IconHome /> <span>企业身份信息</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Input
              field="code"
              label="企业唯一编码"
              placeholder="如：XH001 (用于登录)"
              prefix={<IconIdCard />}
              rules={[
                { required: true, message: "企业编码不能为空" },
                { pattern: /^[a-zA-Z0-9]+$/, message: "只能包含字母和数字" },
                { min: 3, message: "至少3位" },
              ]}
            />
            <Form.Input
              field="name"
              label="企业全称"
              placeholder="请输入工商登记全称"
              prefix={<IconHome />}
              rules={[{ required: true, message: "企业名称不能为空" }]}
            />
            <Form.Select
              field="industry"
              label="所属行业"
              initValue="heating_element"
              prefix={<IconBriefcase />}
              style={{ width: "100%" }}
            >
              <Select.Option value="heating_element">
                电热元件制造
              </Select.Option>
              <Select.Option value="cnc_machining">数控加工</Select.Option>
              <Select.Option value="other">其他制造业</Select.Option>
            </Form.Select>
          </div>

          <Divider style={{ margin: "24px 0" }} />

          {/* 区块二：联系人信息 */}
          <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold">
            <IconUser /> <span>商务联系信息</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Input
              field="contactPerson"
              label="工厂联系人"
              placeholder="如：张经理"
              prefix={<IconUser />}
            />
            <Form.Input
              field="contactPhone"
              label="联系电话"
              placeholder="请输入手机或座机"
              prefix={<IconPhone />}
            />
          </div>

          <Divider style={{ margin: "24px 0" }} />

          {/* 区块三：初始管理员设置 */}
          <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold">
            <IconLock /> <span>初始管理员设置</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Input
              field="adminUser"
              label="管理员账号"
              placeholder="不少于4位"
              prefix={<IconUser />}
              rules={[
                { required: true, message: "必填" },
                { min: 4, message: "至少4位" },
              ]}
            />
            <Form.Input
              field="adminPass"
              label="初始密码"
              type="password"
              placeholder="不少于6位"
              prefix={<IconLock />}
              rules={[
                { required: true, message: "必填" },
                { min: 6, message: "至少6位" },
              ]}
            />
            <Form.Input
              field="confirmPass"
              label="确认密码"
              type="password"
              placeholder="请再次输入"
              prefix={<IconLock />}
              rules={[{ required: true, message: "必填" }]}
            />
          </div>

          <div className="mt-10">
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
                background: "linear-gradient(to right, #2563eb, #4f46e5)",
                border: "none",
              }}
            >
              提交入驻申请
            </Button>
            <div className="mt-4 text-center">
              <Text type="tertiary" style={{ fontSize: "12px" }}>
                点击提交即代表您同意本系统的服务协议与隐私条款
              </Text>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
}

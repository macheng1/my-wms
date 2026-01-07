"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDictOptions } from "@/hooks/useDictOptions";
import {
  Form,
  Button,
  Card,
  Typography,
  Toast,
  Divider,
} from "@douyinfe/semi-ui-19";
import {
  IconUser,
  IconHome,
  IconArrowLeft,
  IconShield,
} from "@douyinfe/semi-icons";
import { useRouter } from "next/navigation";
import { AuthAPI } from "@/api";
import CommonAPI from "@/api/common";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const formApi = useRef<any>(null); // 用于受控操作表单

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsCountdown, setSmsCountdown] = useState(0);
  const smsTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * 优化后的短信发送逻辑
   * 告别 querySelector，直接通过 FormApi 获取数据
   */
  const handleSendSMS = async () => {
    const phone = formApi.current.getValue("contactPhone");

    // 1. 基础格式校验
    if (!/^1\d{10}$/.test(phone)) {
      formApi.current.setError("contactPhone", "请输入正确的11位手机号");
      formApi.current.scrollToField("contactPhone");
      return;
    }

    setSmsLoading(true);
    try {
      // 2. 调用发送接口
      await CommonAPI.sendSMS({ phone });
      Toast.success("验证码已发送");

      // 3. 启动倒计时
      setSmsCountdown(60);
      smsTimer.current = setInterval(() => {
        setSmsCountdown((prev) => {
          if (prev <= 1) {
            if (smsTimer.current) clearInterval(smsTimer.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      // 错误提示由拦截器统一处理
    } finally {
      setSmsLoading(false);
    }
  };

  /**
   * 提交入驻申请
   */
  const handleSubmit = async (values: any) => {
    if (values.adminPass !== values.confirmPass) {
      formApi.current.setError("confirmPass", "两次输入的密码不一致");
      return;
    }
    // 验证码校验
    if (!values.smsCode || !/^\d{6}$/.test(values.smsCode)) {
      formApi.current.setError("smsCode", "请输入6位短信验证码");
      formApi.current.scrollToField("smsCode");
      return;
    }

    setLoading(true);
    try {
      // 1. 发起注册请求并接收返回数据
      const res: any = await AuthAPI.register({
        name: values.name,
        industry: values.industry,
        contactPerson: values.contactPerson,
        contactPhone: values.contactPhone,

        adminUser: values.adminUser,
        adminPass: values.adminPass,
      });

      // 2. 将返回的成功数据（如 tenantId, tenantName 等）存入 session
      // 存入 session 可以在页面刷新后依然存在，比 URL 传参更安全整洁
      sessionStorage.setItem("reg_success_data", JSON.stringify(res.data));

      Toast.success("企业入驻成功！");

      // 3. 跳转到成功提示页
      router.push("/register/success");
    } catch (error) {
      // 拦截器已处理错误提示
    } finally {
      setLoading(false);
    }
  };
  // 动态获取行业字典
  const industryOptions = useDictOptions("INDUSTRY");

  // 组件卸载时清除计时器，防止内存泄漏
  useEffect(() => {
    return () => {
      if (smsTimer.current) clearInterval(smsTimer.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* 科技感装饰背景 */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/40 blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-indigo-100/40 blur-3xl"></div>

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
            新工厂入驻
          </Title>
          <Text type="tertiary">
            请完善企业及管理员信息，开启引出棒智能仓储数字化管理
          </Text>
        </div>

        <Form
          getFormApi={(api) => (formApi.current = api)}
          onSubmit={handleSubmit}
          labelPosition="top"
        >
          {/* 区块一：企业身份信息 */}
          <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold">
            <IconHome /> <span>企业身份信息</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Input
              field="name"
              label="企业全称"
              placeholder="请输入工商登记全称"
              rules={[{ required: true, message: "企业名称不能为空" }]}
            />
            <Form.Select
              field="industry"
              label="所属行业"
              placeholder="请选择"
              style={{ width: "100%" }}
              optionList={industryOptions} // 直接透传 {label, value} 格式
            />
          </div>

          <Divider style={{ margin: "24px 0" }} />

          {/* 区块二：联系人与短信验证 */}
          <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold">
            <IconUser /> <span>商务联系信息</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Input
              field="contactPerson"
              label="工厂联系人"
              placeholder="如：张经理"
            />
            <Form.Input
              field="contactPhone"
              label="联系人手机号"
              placeholder="请输入11位手机号"
              rules={[
                { required: true, message: "手机号不能为空" },
                { pattern: /^1\d{10}$/, message: "格式不正确" },
              ]}
              addonAfter={
                <Button
                  size="small"
                  type="primary"
                  theme="borderless"
                  disabled={smsCountdown > 0 || smsLoading}
                  loading={smsLoading}
                  onClick={handleSendSMS}
                  style={{ width: 100 }}
                >
                  {smsCountdown > 0 ? `${smsCountdown}s` : "获取验证码"}
                </Button>
              }
            />
            <Form.Input
              field="smsCode"
              label="短信验证码"
              placeholder="6位验证码"
              rules={[{ required: true, message: "验证码不能为空" }]}
            />
          </div>

          <Divider style={{ margin: "24px 0" }} />

          {/* 区块三：管理员设置 */}
          <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold">
            <IconShield /> <span>初始管理员设置</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Input
              field="adminUser"
              label="管理员账号"
              placeholder="不少于4位"
              rules={[
                { required: true, message: "必填" },
                { min: 4, message: "太短" },
              ]}
            />
            <Form.Input
              field="adminPass"
              label="初始密码"
              type="password"
              rules={[
                { required: true, message: "必填" },
                { min: 6, message: "至少6位" },
              ]}
            />
            <Form.Input
              field="confirmPass"
              label="确认密码"
              type="password"
              rules={[{ required: true, message: "请确认密码" }]}
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
              }}
            >
              提交入驻申请
            </Button>
            <div className="mt-4 text-center">
              <Text type="tertiary" size="small">
                点击提交代表您同意《WMS 服务协议》与《隐私条款》
              </Text>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
}

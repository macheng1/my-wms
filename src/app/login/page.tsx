'use client';

import React, { useState } from 'react';
// 💡 直接使用支持 React 19 的包，静态 Toast 即可生效
import { Form, Button, Card, Typography, Toast } from '@douyinfe/semi-ui-19';
import { IconUser, IconLock, IconArrowRight,IconApartment } from '@douyinfe/semi-icons';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { AuthAPI, UserAPI } from '@/api';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 💡 对应你 Store 中拆分后的方法名
  const { setToken, setUserInfo } = useUserStore();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // 1. 获取登录凭证
      const loginRes = await AuthAPI.login(values);
      console.log("🚀 ~ handleSubmit ~ loginRes:", loginRes)
      const token = loginRes.access_token; // 💡 使用 access_token 字段

      if (token) {
        // 2. 存储 Token (Store 内部会处理 Cookie)
        setToken(token);

        // 3. 异步获取用户信息
        const userRes = await UserAPI.getUserInfo();
        setUserInfo(userRes);

        // ✅ 在 @douyinfe/semi-ui-19 中，静态调用不再报错
        Toast.success('登录成功，欢迎回来'); 
        
        router.replace('/');
      }
    } catch (error) {
      // 错误已由 request.ts 拦截器处理
      console.error('Login Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* 背景装饰保持不变 */}
      <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-3xl z-0 pointer-events-none"></div>

      <Card
        className="w-full max-w-md mx-4 z-10 shadow-2xl border-0"
        style={{ borderRadius: '16px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
        bodyStyle={{ padding: '40px 32px' }}
      >
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white text-2xl">
            <IconLock />
          </div>
          <Title heading={3} style={{ fontWeight: 700, marginBottom: 8 }}>WMS 智能仓储系统</Title>
          <Text type="tertiary">高效 · 精准 · 智能</Text>
        </div>

        <Form onSubmit={handleSubmit} className="w-full">
             <Form.Input
            field="code"
            label="企业编码"
            placeholder="请输入企业编码"
            prefix={<IconApartment style={{ color: 'var(--semi-color-text-2)' }} />}
            size="large"
          />
          <Form.Input
            field="username"
            label="账号"
            placeholder="请输入工号/用户名"
            prefix={<IconUser style={{ color: 'var(--semi-color-text-2)' }} />}
            size="large"
            rules={[{ required: true, message: '请输入账号' }]}
          />
          
          <Form.Input
            field="password"
            label="密码"
            type="password"
            placeholder="请输入密码"
            prefix={<IconLock style={{ color: 'var(--semi-color-text-2)' }} />}
            size="large"
            rules={[{ required: true, message: '请输入密码' }]}
            style={{ marginTop: 16 }}
          />

          <div className="flex justify-between items-center mt-4 mb-8">
            <Form.Checkbox field="remember" noLabel>记住我</Form.Checkbox>
            <Text link className="cursor-pointer text-blue-600">忘记密码？</Text>
          </div>

          <Button
            htmlType="submit"
            type="primary"
            theme="solid"
            block
            size="large"
            loading={loading}
            style={{ 
                height: '48px',
                borderRadius: '8px', 
                fontWeight: 600,
                border: 'none'
            }}
          >
            立即登录
          </Button>
        </Form>

        <div className="mt-8 flex items-center justify-center gap-1 border-t border-gray-100 pt-6">
          <Text type="tertiary" style={{ fontSize: '14px' }}>还没有租户账号？</Text>
          <Text 
            link 
            onClick={() => router.push('/register')}
            style={{ 
              fontSize: '14px', 
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: 'var(--semi-blue-5)'
            }}
          >
            立即申请开通
            <IconArrowRight size="small" style={{ marginLeft: 4 }} />
          </Text>
        </div>
      </Card>
    </div>
  );
}
/**
 * 通知系统调试页面
 */
"use client";

import { useState, useEffect } from 'react';
import { Button, Card, Typography, Toast, Tag, Descriptions } from '@douyinfe/semi-ui-19';
import Cookies from 'js-cookie';

const { Title, Text, Paragraph } = Typography;

export default function NotificationDebugPage() {
  const [token, setToken] = useState<string>('');
  const [sseStatus, setSseStatus] = useState<string>('disconnected');
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // 获取当前 token
    const currentToken = Cookies.get('wms_token');
    setToken(currentToken || '未找到 token');
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  };

  const testSSEConnection = () => {
    const currentToken = Cookies.get('wms_token');
    if (!currentToken) {
      Toast.error({
        content: '未找到 token，请先登录',
      });
      return;
    }

    addLog(`开始测试 SSE 连接...`);
    addLog(`Token: ${currentToken.substring(0, 20)}...`);

    // 构建连接 URL
    const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
    const url = `${baseURL}/notifications/subscribe`;

    addLog(`连接 URL: ${url}`);

    // 创建 EventSource
    const es = new EventSource(url, {
      withCredentials: true,
    });

    setEventSource(es);
    setSseStatus('connecting');

    // 监听连接成功
    es.addEventListener('connected', (event: MessageEvent) => {
      addLog(`✅ 连接成功: ${event.data}`);
      setSseStatus('connected');
      Toast.success({
        content: 'SSE 连接成功！',
      });
    });

    // 监听消息
    es.addEventListener('message', (event: MessageEvent) => {
      addLog(`📨 收到消息: ${event.data}`);
      try {
        const data = JSON.parse(event.data);
        addLog(`📨 解析后: ${JSON.stringify(data, null, 2)}`);
      } catch (e) {
        // ignore
      }
    });

    // 监听心跳
    es.addEventListener('heartbeat', (event: MessageEvent) => {
      addLog(`💓 心跳: ${event.data}`);
    });

    // 监听错误
    es.onerror = (error) => {
      addLog(`❌ 连接错误: ${JSON.stringify(error)}`);
      addLog(`EventSource 状态: ${es.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSED)`);
      setSseStatus('error');

      if (es.readyState === EventSource.CLOSED) {
        addLog(`🔌 连接已关闭`);
        es.close();
      }
    };
  };

  const disconnectSSE = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setSseStatus('disconnected');
      addLog(`🔌 手动断开连接`);
      Toast.info({
        content: '已断开 SSE 连接',
      });
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title heading={2}>通知系统调试工具</Title>

      <Card title="认证信息" style={{ marginBottom: '16px' }}>
        <Descriptions>
          <Descriptions.Item itemKey="Token">
            <Text code>{token.substring(0, 50)}...</Text>
          </Descriptions.Item>
          <Descriptions.Item itemKey="API URL">
            <Text code>{process.env.NEXT_PUBLIC_API_URL || '/api'}</Text>
          </Descriptions.Item>
          <Descriptions.Item itemKey="SSE URL">
            <Text code>{process.env.NEXT_PUBLIC_API_URL || '/api'}/notifications/subscribe</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="SSE 连接测试" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <Button
            theme="solid"
            onClick={testSSEConnection}
            disabled={sseStatus === 'connected' || sseStatus === 'connecting'}
          >
            测试 SSE 连接
          </Button>
          <Button
            onClick={disconnectSSE}
            disabled={!eventSource}
          >
            断开连接
          </Button>
          <Button onClick={clearLogs}>
            清空日志
          </Button>
        </div>

        <div>
          状态:{' '}
          <Tag
            color={
              sseStatus === 'connected'
                ? 'green'
                : sseStatus === 'connecting'
                  ? 'blue'
                  : sseStatus === 'error'
                    ? 'red'
                    : 'grey'
            }
          >
            {sseStatus === 'connected'
              ? '已连接'
              : sseStatus === 'connecting'
                ? '连接中'
                : sseStatus === 'error'
                  ? '错误'
                  : '未连接'}
          </Tag>
        </div>
      </Card>

      <Card title="连接日志">
        <div
          style={{
            background: 'var(--semi-color-fill-0)',
            padding: '12px',
            borderRadius: '4px',
            height: '400px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px',
          }}
        >
          {logs.length === 0 ? (
            <Text type="secondary">暂无日志</Text>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </Card>

      <Card title="使用说明" style={{ marginTop: '16px' }}>
        <Paragraph>
          <ul>
            <li>确保已登录（token 存在）</li>
            <li>点击"测试 SSE 连接"按钮</li>
            <li>查看日志输出，确认连接状态</li>
            <li>如果连接失败，检查：
              <ul>
                <li>后端服务是否启动</li>
                <li>CORS 配置是否正确</li>
                <li>后端是否支持 cookie 认证</li>
              </ul>
            </li>
          </ul>
        </Paragraph>
      </Card>
    </div>
  );
}

/**
 * SSE 订阅代理
 *
 * 代理前端的 SSE 连接到后端，解决 CORS 问题
 */
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 获取后端 URL
function getBackendUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  // 移除末尾的 /api，获取基础 URL
  return apiUrl.replace(/\/api$/, '');
}

export async function GET(request: NextRequest) {
  const backendUrl = getBackendUrl();
  const token = request.cookies.get('wms_token')?.value;

  if (!token) {
    console.error('[SSE Proxy] No token found in cookies');
    return new Response('Unauthorized: No token', { status: 401 });
  }

  console.log('[SSE Proxy] Connecting to backend:', backendUrl);
  console.log('[SSE Proxy] Token (first 20 chars):', token.substring(0, 20) + '...');

  // 创建一个可读流
  let isClosed = false;
  let abortController: AbortController | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // 构建后端 SSE URL
      const sseUrl = `${backendUrl}/api/notifications/subscribe`;

      // 获取 cookie 字符串
      const cookieHeader = request.headers.get('cookie') || '';

      // 创建 AbortController 用于取消请求
      abortController = new AbortController();

      // 使用 fetch 发起请求到后端
      fetch(sseUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'cookie': cookieHeader,
          'x-source-type': 'admin-web',
        },
        signal: abortController.signal,
      })
        .then((response) => {
          if (isClosed) {
            // 如果在连接建立前就已经关闭，直接返回
            return;
          }

          if (!response.ok) {
            console.error('[SSE Proxy] Backend error:', response.status, response.statusText);
            // 尝试读取错误响应体
            response.clone().text().then(body => {
              console.error('[SSE Proxy] Backend error body:', body);
            }).catch(() => {});
            if (!isClosed) {
              isClosed = true;
              controller.error(new Error(`Backend error: ${response.status}`));
            }
            return;
          }

          console.log('[SSE Proxy] Connection established');

          const body = response.body;
          if (!body) {
            if (!isClosed) {
              isClosed = true;
              controller.error(new Error('No response body'));
            }
            return;
          }

          const reader = body.getReader();

          // 读取并转发每个数据块
          async function read() {
            try {
              while (true) {
                // 检查是否已关闭
                if (isClosed) {
                  console.log('[SSE Proxy] Stream marked as closed, stopping read');
                  break;
                }

                const { done, value } = await reader.read();

                if (done) {
                  console.log('[SSE Proxy] Stream ended naturally');
                  if (!isClosed) {
                    isClosed = true;
                    try {
                      controller.close();
                    } catch {
                      // 忽略已关闭错误
                    }
                  }
                  break;
                }

                // 直接转发数据块
                try {
                  controller.enqueue(value);
                } catch {
                  // Controller 已关闭，停止读取
                  console.log('[SSE Proxy] Controller closed, stopping read');
                  break;
                }
              }
            } catch (error) {
              if (isClosed || (error as Error).name === 'AbortError') {
                console.log('[SSE Proxy] Read loop stopped');
                return;
              }
              console.error('[SSE Proxy] Read loop error:', error);
              isClosed = true;
              try {
                controller.error(error);
              } catch {
                // 忽略已关闭错误
              }
            }
          }

          read();
        })
        .catch((error) => {
          // 忽略 AbortError
          if (error.name === 'AbortError') {
            console.log('[SSE Proxy] Request aborted');
            return;
          }
          console.error('[SSE Proxy] Fetch error:', error);
          if (!isClosed) {
            isClosed = true;
            try {
              controller.error(error);
            } catch {
              // 忽略已关闭错误
            }
          }
        });
    },
    cancel() {
      console.log('[SSE Proxy] Stream cancelled');
      isClosed = true;
      if (abortController) {
        try {
          abortController.abort();
        } catch (e) {
          // AbortError is expected during cleanup, ignore it
          if ((e as Error).name !== 'AbortError') {
            console.error('[SSE Proxy] Cancel error:', e);
          }
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

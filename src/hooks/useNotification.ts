/**
 * 通知系统 Hook
 *
 * 使用 SSE (Server-Sent Events) 实现实时消息推送
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import { useUserStore } from '@/store/useUserStore';
import { getUnreadCount, markAsRead, getSubscribeUrl, getNotifications } from '@/api/notifications';
import type {
  NotificationMessage,
  UnreadCountResponse,
  NotificationEventHandler,
  ConnectedEventHandler,
  ErrorHandler,
} from '@/api/notifications/types';

export interface UseNotificationOptions {
  /** 收到通知时的回调 */
  onMessage?: NotificationEventHandler;
  /** 连接成功时的回调 */
  onConnected?: ConnectedEventHandler;
  /** 连接错误时的回调 */
  onError?: ErrorHandler;
  /** 是否自动连接（默认 true） */
  autoConnect?: boolean;
}

export interface UseNotificationReturn {
  /** SSE 连接状态 */
  isConnected: boolean;
  /** 未读消息数量 */
  unreadCount: number;
  /** 未读统计信息 */
  unreadStats: UnreadCountResponse | null;
  /** 手动连接 SSE */
  connect: () => void;
  /** 断开 SSE 连接 */
  disconnect: () => void;
  /** 标记已读 */
  markAsRead: (notificationId?: string) => Promise<{ message: string }>;
  /** 刷新未读数量 */
  refreshUnreadCount: () => Promise<void>;
  /** 获取通知列表 */
  fetchNotifications: () => Promise<void>;
  /** 通知列表 */
  notifications: NotificationMessage[];
  /** 添加通知到列表 */
  addNotification: (notification: NotificationMessage) => void;
}

// 全局 EventSource 引用，确保只有一个 SSE 连接
let globalEventSource: EventSource | null = null;
const globalListeners = new Set<{
  onMessage?: NotificationEventHandler;
  onConnected?: ConnectedEventHandler;
  onError?: ErrorHandler;
}>();
// 全局已提示的通知 ID，确保整个应用只提示一次
const globalNotifiedIds = new Set<string>();

/**
 * 通知系统 Hook
 *
 * @example
 * ```tsx
 * const { isConnected, unreadCount, markAsRead } = useNotification({
 *   onMessage: (notification) => {
 *     console.log('收到通知:', notification);
 *   },
 *   onConnected: () => {
 *     console.log('SSE 已连接');
 *   },
 * });
 * ```
 */
export function useNotification(options: UseNotificationOptions = {}): UseNotificationReturn {
  const { onMessage, onConnected, onError, autoConnect = true } = options;
  const userInfo = useUserStore((state) => state.userInfo);

  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadStats, setUnreadStats] = useState<UnreadCountResponse | null>(null);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  const localEventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const errorLoggedRef = useRef(false);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;
  const canUseTenantSse = userInfo?.userType === 'tenant' && Boolean(userInfo.tenantId);

  // 获取未读数量
  const refreshUnreadCount = useCallback(async () => {
    if (!canUseTenantSse) {
      setUnreadCount(0);
      setUnreadStats(null);
      return;
    }

    try {
      const stats = await getUnreadCount();
      setUnreadCount(stats.total);
      setUnreadStats(stats);
    } catch (error) {
      console.error('获取未读数量失败:', error);
    }
  }, [canUseTenantSse]);

  // 建立 SSE 连接
  const connect = useCallback(() => {
    if (!canUseTenantSse) {
      return;
    }

    const token = Cookies.get('wms_token');
    if (!token) {
      console.warn('[SSE] 未找到 token，无法连接 SSE');
      return;
    }

    // 如果已经存在全局连接，直接复用
    if (globalEventSource && globalEventSource.readyState === EventSource.OPEN) {
      setIsConnected(true);
      return;
    }

    // 清理旧连接
    if (globalEventSource) {
      globalEventSource.close();
    }

    // 构建 SSE URL
    // 注意：EventSource 不支持自定义请求头，需要使用 withCredentials 发送 cookie
    let url = getSubscribeUrl();

    // 如果是同域请求，使用相对路径
    if (url.startsWith('http')) {
      try {
        const urlObj = new URL(url);
        // 如果是跨域，确保 withCredentials 正确设置
        console.log('[SSE] 连接到:', urlObj.origin);
      } catch (e) {
        console.error('[SSE] 无效的 URL:', url);
      }
    }

    console.log('[SSE] 正在连接到:', url);

    const eventSource = new EventSource(url, {
      withCredentials: true, // 自动发送 cookie
    });

    localEventSourceRef.current = eventSource;
    globalEventSource = eventSource;

    // 连接成功
    eventSource.addEventListener('connected', (event: MessageEvent) => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      errorLoggedRef.current = false;
      onConnected?.();
      console.log('[SSE] 连接已建立');

      // 连接成功后获取未读数量
      refreshUnreadCount();
    });

    // 收到通知
    eventSource.addEventListener('message', (event: MessageEvent) => {
      try {
        console.log('[SSE] 原始数据:', event.data);
        const notification: NotificationMessage = JSON.parse(event.data);
        console.log('[SSE] 解析后的通知:', notification);
        console.log('[SSE] title:', notification.title, 'message:', notification.message);

        // 全局去重：如果这个通知已经提示过，跳过
        if (notification.id && globalNotifiedIds.has(notification.id)) {
          console.log('[SSE] 通知已处理过，跳过:', notification.id);
          return;
        }

        // 记录已处理的通知 ID
        if (notification.id) {
          globalNotifiedIds.add(notification.id);
        }

        setUnreadCount(prev => prev + 1);
        setNotifications(prev => [notification, ...prev]);

        // 通知所有监听者
        globalListeners.forEach(listener => {
          listener.onMessage?.(notification);
        });

        onMessage?.(notification);
      } catch (error) {
        console.error('[SSE] 解析消息失败:', error);
      }
    });

    // 心跳
    eventSource.addEventListener('heartbeat', (event: MessageEvent) => {
      // 可用于检测连接状态
      console.debug('[SSE] 心跳:', event.data);
    });

    // 错误处理
    eventSource.onerror = (error) => {
      const readyState = eventSource.readyState;
      setIsConnected(false);
      onError?.(error);

      const readyStateText =
        readyState === EventSource.CONNECTING
          ? 'CONNECTING'
          : readyState === EventSource.OPEN
            ? 'OPEN'
            : readyState === EventSource.CLOSED
              ? 'CLOSED'
              : 'UNKNOWN';

      if (!errorLoggedRef.current) {
        console.warn('[SSE] 连接失败，通知实时推送暂不可用', {
          readyState,
          readyStateText,
          url,
          reconnectAttempts: reconnectAttemptsRef.current,
        });
        errorLoggedRef.current = true;
      }

      // 检查 EventSource 状态
      if (readyState === EventSource.CLOSED) {
        console.warn('[SSE] 连接已关闭');
        // 如果连接被关闭，不尝试重连
        return;
      }

      if (readyState === EventSource.CONNECTING) {
        reconnectAttemptsRef.current += 1;
        if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          console.warn('[SSE] 达到最大重连次数，关闭实时通知连接');
          eventSource.close();
        }
        return;
      }

      // 自动重连
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`[SSE] 尝试重连 (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
          connect();
        }, RECONNECT_DELAY);
      } else {
        console.warn('[SSE] 达到最大重连次数，停止重连');
      }
    };
  }, [canUseTenantSse, onMessage, onConnected, onError, refreshUnreadCount]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (localEventSourceRef.current) {
      localEventSourceRef.current.close();
      localEventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // 标记已读
  const handleMarkAsRead = useCallback(async (notificationId?: string) => {
    const result = await markAsRead({ notificationId });
    if (!notificationId) {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } else {
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    }
    await refreshUnreadCount();
    return result;
  }, [refreshUnreadCount]);

  // 添加通知到列表
  const addNotification = useCallback((notification: NotificationMessage) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  // 获取通知列表
  const fetchNotifications = useCallback(async () => {
    try {
      const result = await getNotifications({
        page: 1,
        pageSize: 10,
      });
      setNotifications(result.list || []);
    } catch (error) {
      console.error('获取通知列表失败:', error);
    }
  }, []);

  // 注册监听器
  useEffect(() => {
    const listener = { onMessage, onConnected, onError };
    globalListeners.add(listener);

    return () => {
      globalListeners.delete(listener);
    };
  }, [onMessage, onConnected, onError]);

  // 组件挂载时连接，卸载时断开
  useEffect(() => {
    if (autoConnect && canUseTenantSse) {
      connect();
    }

    return () => {
      // 只清理本地引用，不关闭全局连接
      localEventSourceRef.current = null;
    };
  }, [connect, autoConnect, canUseTenantSse]);

  return {
    isConnected,
    unreadCount,
    unreadStats,
    connect,
    disconnect,
    markAsRead: handleMarkAsRead,
    refreshUnreadCount,
    fetchNotifications,
    notifications,
    addNotification,
  };
}

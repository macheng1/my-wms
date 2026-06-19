/**
 * 货位灯（PTL）通知 Hook
 *
 * 复用全局 SSE 连接，过滤出 PTL 找货确认事件（硬件按钮 / 其他端确认时实时回推）
 */
import { useNotification } from "./useNotification";
import type { NotificationMessage } from "@/api/notifications/types";

export interface PtlConfirmedPayload {
  taskId: string;
  itemId: string;
  locationId: string;
  locationCode: string;
  taskStatus: string;
}

export interface UsePtlNotificationOptions {
  /** 收到某库位确认事件时回调 */
  onConfirmed?: (payload: PtlConfirmedPayload) => void;
}

export function usePtlNotification(options: UsePtlNotificationOptions = {}) {
  const { onConfirmed } = options;

  const { isConnected } = useNotification({
    onMessage: (notification: NotificationMessage) => {
      const data = (notification.data || {}) as Record<string, any>;
      if (data.event === "ptl_confirmed") {
        onConfirmed?.(data as unknown as PtlConfirmedPayload);
      }
    },
  });

  return { isConnected };
}

export default usePtlNotification;

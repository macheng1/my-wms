/**
 * 通知系统 API 接口
 */
import request from "@/utils/request";
import type {
  QueryNotificationsRequest,
  PaginatedResponse,
  NotificationWithStatus,
  MarkAsReadRequest,
  UnreadCountResponse,
} from "./types";

/**
 * 查询通知列表
 *
 * POST /api/notifications/list
 *
 * @param request - 查询参数
 * @returns 分页的通知列表
 */
export const getNotifications = async (
  params: QueryNotificationsRequest = {},
): Promise<PaginatedResponse<NotificationWithStatus>> => {
  const res = await request.post("/notifications/list", params);
  return res.data;
};

/**
 * 标记已读
 *
 * POST /api/notifications/read
 *
 * @param request - 标记参数
 */
export const markAsRead = async (
  params: MarkAsReadRequest = {},
): Promise<{ message: string }> => {
  const res = await request.post("/notifications/read", params);
  return res.data;
};

/**
 * 获取未读数量
 *
 * GET /api/notifications/unread-count
 *
 * @returns 未读统计
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const res = await request.get("/notifications/unread-count");
  return res.data;
};

/**
 * 获取 SSE 订阅 URL
 *
 * @returns SSE 订阅的完整 URL
 */
export const getSubscribeUrl = (): string => {
  // 使用相对路径，通过 Next.js API route 代理
  // 这样可以避免 CORS 问题
  return "/api/notifications/subscribe";
};

/**
 * 获取 token（用于 SSE 认证）
 * EventSource 不支持自定义请求头，需要通过其他方式传递
 */
export const getSSEToken = (): string | null => {
  if (typeof window === "undefined") return null;

  // 从 cookie 中获取 token
  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((c) => c.trim().startsWith("wms_token="));
  if (tokenCookie) {
    return tokenCookie.split("=")[1]?.trim();
  }

  return null;
};

const NotificationAPI = {
  getNotifications,
  markAsRead,
  getUnreadCount,
  getSubscribeUrl,
};

export default NotificationAPI;

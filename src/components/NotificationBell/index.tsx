"use client";

import React, { useState } from "react";
import { Popover, List, Button, Tag, Empty, Toast } from "@douyinfe/semi-ui-19";
import { IconBell, IconCheckCircleStroked } from "@douyinfe/semi-icons";
import { useNotification } from "@/hooks/useNotification";
import type {
  NotificationMessage,
  NotificationPriority,
} from "@/api/notifications/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

// 优先级配置
const PRIORITY_CONFIG: Record<
  NotificationPriority,
  { color: string; label: string }
> = {
  URGENT: { color: "red", label: "紧急" },
  HIGH: { color: "orange", label: "重要" },
  NORMAL: { color: "blue", label: "普通" },
  LOW: { color: "grey", label: "低" },
};

export interface NotificationBellProps {
  /** 是否显示通知图标 */
  showIcon?: boolean;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  showIcon = true,
  style,
  className,
}) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    unreadCount,
    notifications,
    isConnected,
    markAsRead,
    refreshUnreadCount,
    fetchNotifications,
  } = useNotification({
    onMessage: handleNewNotification,
    onConnected: () => {
      console.log("[NotificationBell] SSE 已连接");
    },
    onError: (error) => {
      // 静默处理错误，不打印日志
      // 详细日志已在 useNotification 中打印
    },
  });

  // 处理新通知
  function handleNewNotification(notification: NotificationMessage) {
    // 显示通知提示
    showNotificationToast(notification);
  }

  // 显示通知 Toast
  function showNotificationToast(notification: NotificationMessage) {
    // 打印调试日志
    console.log("[NotificationBell] 收到通知:", notification);

    let title = notification.title;
    let message = notification.message;
    const { priority, data } = notification;

    // 如果没有 title 和 message，根据 data 生成
    if (!title && !message && data) {
      // 处理库存变更通知
      if (data.transactionType || data.direction) {
        const productName = data.productName || "";
        const direction = data.direction || "";
        const quantity = data.quantity ?? 1;
        const unitSymbol = data.unitSymbol || "";
        const typeDisplayName = data.typeDisplayName || "库存变更通知";

        title = String(typeDisplayName);
        message = `${productName} ${direction} ${quantity}${unitSymbol}`;
      }
    }

    // 检查字段是否存在
    if (!title || !message) {
      console.warn("[NotificationBell] 通知数据不完整:", {
        title,
        message,
        notification,
      });
      Toast.error({
        content: "收到新通知",
        duration: 4.5,
      });
      return;
    }

    // 根据优先级选择 Toast 类型
    if (priority === "URGENT" || priority === "HIGH") {
      Toast.success({
        content: `${title}: ${message}`,
        duration: priority === "URGENT" ? 0 : 4.5,
      });
    } else {
      Toast.success({
        content: `${title}: ${message}`,
        duration: 4.5,
      });
    }
  }

  // 渲染通知列表项
  function renderNotificationItem(
    item: NotificationMessage & { isRead?: boolean },
  ) {
    const { title, message, createdAt, isRead, priority } = item;
    const priorityConfig = PRIORITY_CONFIG[priority];

    return (
      <List.Item
        key={item.id}
        style={{
          background: isRead ? "transparent" : "var(--semi-color-fill-0)",
          padding: "12px 16px",
          cursor: "pointer",
        }}
        onClick={() => handleNotificationClick(item)}
      >
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          {/* 未读指示器 */}
          {!isRead && (
            <div
              style={{
                width: "4px",
                background: "var(--semi-color-primary)",
                borderRadius: "2px",
                flexShrink: 0,
              }}
            />
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* 标题和优先级标签 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <span style={{ fontWeight: 500 }}>{title}</span>
              {priority !== "NORMAL" && (
                <Tag size="small">{priorityConfig.label}</Tag>
              )}
            </div>

            {/* 内容 */}
            <div
              style={{
                fontSize: "13px",
                color: "var(--semi-color-text-2)",
                marginBottom: "6px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {message}
            </div>

            {/* 时间和操作 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{ fontSize: "12px", color: "var(--semi-color-text-3)" }}
              >
                {dayjs(createdAt).fromNow()}
              </span>
              {!isRead && (
                <Button
                  type="tertiary"
                  size="small"
                  icon={<IconCheckCircleStroked />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(item.id);
                  }}
                >
                  标为已读
                </Button>
              )}
            </div>
          </div>
        </div>
      </List.Item>
    );
  }

  // 处理通知点击
  function handleNotificationClick(item: NotificationMessage) {
    // 可以根据通知类型跳转到不同页面
    console.log("点击通知:", item);
    // TODO: 实现跳转逻辑
  }

  // 标记单个已读
  async function handleMarkAsRead(notificationId: string) {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error("标记已读失败:", error);
    }
  }

  // 一键全部已读
  async function handleMarkAllAsRead() {
    try {
      setLoading(true);
      await markAsRead();
      await refreshUnreadCount();
      Toast.success({
        content: "已全部标记为已读",
      });
    } catch (error) {
      console.error("标记全部已读失败:", error);
      Toast.error({
        content: "操作失败，请稍后重试",
      });
    } finally {
      setLoading(false);
    }
  }

  // 打开下拉框时刷新未读数量和通知列表
  async function handleDropdownOpenChange(open: boolean) {
    if (open) {
      setVisible(open);
      await refreshUnreadCount();
      await fetchNotifications();
    } else {
      setVisible(false);
    }
  }

  return (
    <Popover
      trigger="click"
      position="bottomRight"
      visible={visible}
      onVisibleChange={handleDropdownOpenChange}
      showArrow
      autoAdjustOverflow
      clickToHide
      content={
        <div
          style={{
            width: "380px",
            maxHeight: "500px",
            overflow: "auto",
          }}
        >
          {/* 头部 */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--semi-color-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 500, fontSize: "14px" }}>消息通知</span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {!isConnected && (
                <Tag color="red" size="small">
                  未连接
                </Tag>
              )}
              {unreadCount > 0 && (
                <Button
                  type="tertiary"
                  size="small"
                  onClick={handleMarkAllAsRead}
                  loading={loading}
                >
                  全部已读
                </Button>
              )}
            </div>
          </div>

          {/* 通知列表 */}
          {notifications.length === 0 ? (
            <Empty
              title="暂无通知"
              description="您还没有收到任何通知"
              style={{ padding: "40px 0" }}
            />
          ) : (
            <List
              dataSource={notifications}
              renderItem={renderNotificationItem}
              style={{ maxHeight: "400px", overflow: "auto" }}
            />
          )}

          {/* 底部 */}
          {notifications.length > 0 && (
            <div
              style={{
                padding: "8px 16px",
                borderTop: "1px solid var(--semi-color-border)",
                textAlign: "center",
              }}
            >
              <Button
                type="tertiary"
                size="small"
                onClick={() => {
                  // TODO: 跳转到通知列表页
                  console.log("查看全部通知");
                }}
              >
                查看全部通知
              </Button>
            </div>
          )}
        </div>
      }
    >
      <div style={{ position: "relative", display: "inline-block" }}>
        <Button
          theme="borderless"
          icon={
            showIcon ? (
              <IconBell
                size="large"
                style={{
                  color: isConnected
                    ? "var(--semi-color-text-2)"
                    : "var(--semi-color-danger)",
                }}
              />
            ) : null
          }
          style={{
            color: "var(--semi-color-text-2)",
            ...style,
          }}
          className={className}
        />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              backgroundColor: "var(--semi-color-danger)",
              color: "white",
              fontSize: "12px",
              minWidth: "18px",
              height: "18px",
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 5px",
              fontWeight: 500,
              lineHeight: "1",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>
    </Popover>
  );
};

export default NotificationBell;

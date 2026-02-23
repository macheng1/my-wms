/**
 * 库存通知 Hook
 *
 * 专门处理库存相关的通知
 */
import { useNotification } from "./useNotification";
import { Modal, Toast } from "@douyinfe/semi-ui-19";
import type {
  NotificationMessage,
  InventoryNotificationData,
  InventoryChangeData,
} from "@/api/notifications/types";

export interface UseInventoryNotificationOptions {
  /** 是否启用库存预警通知 */
  enableWarning?: boolean;
  /** 是否启用库存变更通知 */
  enableChange?: boolean;
  /** 收到库存预警时的回调 */
  onStockWarning?: (notification: NotificationMessage) => void;
  /** 收到库存变更时的回调 */
  onStockChange?: (notification: NotificationMessage) => void;
}

/**
 * 库存通知 Hook
 *
 * @example
 * ```tsx
 * useInventoryNotification({
 *   enableWarning: true,
 *   enableChange: true,
 *   onStockWarning: (notification) => {
 *     console.log('库存预警:', notification);
 *   },
 * });
 * ```
 */
export function useInventoryNotification(
  options: UseInventoryNotificationOptions = {},
) {
  const {
    enableWarning = true,
    enableChange = true,
    onStockWarning,
    onStockChange,
  } = options;

  const { isConnected } = useNotification({
    onMessage: handleInventoryNotification,
  });

  // 处理库存通知
  function handleInventoryNotification(notification: NotificationMessage) {
    const { category } = notification;

    if (category === "INVENTORY_WARNING" && enableWarning) {
      handleStockWarning(notification);
      onStockWarning?.(notification);
    } else if (category === "INVENTORY_CHANGE" && enableChange) {
      handleStockChange(notification);
      onStockChange?.(notification);
    }
  }

  // 处理库存预警
  function handleStockWarning(notification: NotificationMessage) {
    const { title, message, data, priority } = notification;
    const inventoryData = (data || {}) as InventoryNotificationData;
    const { productName, sku, currentQty, alertLevel } = inventoryData;

    // 根据预警级别展示不同效果
    if (alertLevel === "CRITICAL" || currentQty <= 0) {
      // 严重预警：零库存
      Toast.error({
        content: `${productName}(${sku}) 已零库存！`,
        duration: 0,
      });

      // 触发弹窗
      Modal.warning({
        title: "库存严重预警",
        content: `${productName}(${sku}) 当前库存为 ${currentQty}，请及时补货！`,
        okText: "我知道了",
      });
    } else {
      // 普通预警
      Toast.warning({
        content: message || title,
      });
    }
  }

  // 处理库存变更
  function handleStockChange(notification: NotificationMessage) {
    const { title, message, data } = notification;
    const inventoryData = (data || {}) as InventoryChangeData;
    const { productName, sku, direction, quantity, unitSymbol } = inventoryData;

    // 库存变更提示
    Toast.info({
      content: `${productName}(${sku}) ${direction} ${quantity}${unitSymbol || ""}`,
    });
  }

  return {
    isConnected,
  };
}

export default useInventoryNotification;

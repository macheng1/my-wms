export enum OrderSource {
  MINIAPP = "MINIAPP",
  WEBSITE = "WEBSITE",
  ADMIN = "ADMIN",
}

export enum OrderType {
  STANDARD = "STANDARD",
  CUSTOM = "CUSTOM",
}

export enum OrderStatus {
  PENDING_CONFIRM = "PENDING_CONFIRM",
  PENDING_REVIEW = "PENDING_REVIEW",
  REJECTED = "REJECTED",
  CONFIRMED = "CONFIRMED",
  STOCK_LOCKED = "STOCK_LOCKED",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  PENDING_SCHEDULE = "PENDING_SCHEDULE",
  SCHEDULED = "SCHEDULED",
  PRODUCING = "PRODUCING",
  PRODUCED = "PRODUCED",
  PENDING_SHIPMENT = "PENDING_SHIPMENT",
  SHIPPED = "SHIPPED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface OrderItem {
  id: string;
  productName: string;
  sku?: string | null;
  quantity: number;
  unitName?: string | null;
  price: number;
  amount: number;
  customRequirement?: string | null;
}

export interface OrderRecord {
  id: string;
  tenantId: string;
  orderNumber: string;
  source: OrderSource;
  orderType: OrderType;
  status: OrderStatus;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  totalAmount: number;
  remark?: string | null;
  reviewRemark?: string | null;
  rejectReason?: string | null;
  expectedDeliveryDate?: string | null;
  scheduledStartDate?: string | null;
  scheduledEndDate?: string | null;
  producedAt?: string | null;
  shippedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface QueryOrder {
  page?: number;
  pageSize?: number;
  orderNumber?: string;
  status?: OrderStatus;
  orderType?: OrderType;
  source?: OrderSource;
  customerKeyword?: string;
}

export interface SaveOrder {
  orderNumber?: string;
  source?: OrderSource;
  orderType?: OrderType;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  totalAmount?: number;
  remark?: string;
  expectedDeliveryDate?: string;
}

export interface OrderFlowLog {
  id: string;
  orderId: string;
  fromStatus?: OrderStatus | null;
  toStatus: OrderStatus;
  action: string;
  remark?: string | null;
  createdAt: string;
}

export type PtlControllerStatus =
  | "ONLINE"
  | "OFFLINE"
  | "ERROR"
  | "MAINTENANCE"
  | "DISABLED";

export interface PtlController {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  deviceUid?: string;
  type: "PTL_CONTROLLER";
  status: PtlControllerStatus;
  locationId?: string;
  config?: Record<string, any>;
  lastHeartbeat?: string;
  metadata?: Record<string, any>;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavePtlControllerRequest {
  id?: string;
  code: string;
  name: string;
  deviceUid?: string;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
  remark?: string;
}

export interface PtlLocationBinding {
  id: string;
  tenantId: string;
  locationId: string;
  deviceId: string;
  ledIndex: number;
  defaultColor: string;
  enabled: number;
  remark?: string;
  location?: {
    id: string;
    code: string;
    name: string;
    warehouse: string;
    area: string;
    shelf?: string;
    level?: string;
    position?: string;
  };
  device?: PtlController;
  createdAt: string;
  updatedAt: string;
}

export interface SavePtlBindingRequest {
  id?: string;
  locationId: string;
  deviceId: string;
  ledIndex: number;
  defaultColor?: string;
  enabled?: boolean;
  remark?: string;
}

export interface PtlTaskItem {
  id: string;
  taskId: string;
  locationId: string;
  locationCode: string;
  deviceId?: string;
  ledIndex?: number;
  status:
    | "PENDING"
    | "LIGHTING"
    | "ACTIVE"
    | "CONFIRMED"
    | "CANCELLED"
    | "EXPIRED"
    | "FAILED"
    | "SKIPPED";
  quantity?: number;
  availableQuantity?: number;
  batchNo?: string;
  expiryDate?: string;
  errorMessage?: string;
}

export interface PtlPickTask {
  id: string;
  taskNo?: string;
  sku: string;
  productName?: string;
  status:
    | "CREATED"
    | "LIGHTING"
    | "ACTIVE"
    | "PARTIAL_CONFIRMED"
    | "COMPLETED"
    | "CANCELLED"
    | "EXPIRED"
    | "FAILED";
  totalLocations: number;
  confirmedLocations: number;
  expiresAt: string;
  items?: PtlTaskItem[];
}

export interface PtlLightUpResponse {
  reused?: boolean;
  taskId: string;
  task: PtlPickTask;
  items: PtlTaskItem[];
  skipped?: Array<{
    locationId: string;
    reason: string;
    occupiedByTaskId?: string;
  }>;
}

export interface InventoryLocationPtlInfo {
  bound: boolean;
  bindingId?: string;
  controllerId?: string;
  controllerCode?: string;
  controllerName?: string;
  controllerStatus?: PtlControllerStatus;
  ledIndex?: number | null;
  defaultColor?: string;
}

export interface InventoryLocationBySkuItem {
  inventoryLocationId: string;
  locationId: string;
  locationCode: string;
  locationName: string;
  locationType: string;
  locationStatus: string;
  quantity: number;
  lockedQuantity: number;
  availableQuantity: number;
  unitId?: string;
  unitName?: string;
  unitSymbol?: string;
  batchNo?: string;
  productionDate?: string;
  expiryDate?: string;
  ptl: InventoryLocationPtlInfo;
}

export interface InventoryLocationsBySkuResponse {
  sku: string;
  productName: string;
  unitId?: string;
  unitName?: string;
  unitSymbol?: string;
  totalQuantity: number;
  totalLockedQuantity: number;
  totalAvailableQuantity: number;
  locations: InventoryLocationBySkuItem[];
}

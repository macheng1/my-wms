import request from "@/utils/request";
import {
  InventoryLocationsBySkuResponse,
  PtlController,
  PtlLightUpResponse,
  PtlLocationBinding,
  PtlPickTask,
  SavePtlBindingRequest,
  SavePtlControllerRequest,
} from "./types";

const PtlApi = {
  getInventoryLocations: (params: { sku: string; onlyAvailable?: boolean }) =>
    request.get<InventoryLocationsBySkuResponse>("inventory/locations", {
      params,
    }),

  lightUp: (data: {
    sku?: string;
    locationIds?: string[];
    color?: string;
    ttlSeconds?: number;
  }) => request.post<PtlLightUpResponse>("ptl/light-up", data),

  lightOff: (taskId: string) => request.post("ptl/light-off", { taskId }),

  confirm: (data: {
    taskId: string;
    locationId?: string;
    locationCode?: string;
    skuOrBarcode?: string;
  }) => request.post("ptl/confirm", data),

  getTask: (id: string) => request.get<PtlPickTask>(`ptl/tasks/${id}`),

  getControllers: () => request.get<PtlController[]>("ptl/controllers"),

  saveController: (data: SavePtlControllerRequest) =>
    request.post<PtlController>("ptl/controllers", data),

  removeController: (id: string) => request.delete(`ptl/controllers/${id}`),

  getControllerStatus: () => request.get<PtlController[]>("ptl/controllers/status"),

  calibrate: (
    id: string,
    data: { ledIndex: number; color?: string; duration?: number },
  ) => request.post(`ptl/controllers/${id}/calibrate`, data),

  getBindings: (params?: { locationId?: string; deviceId?: string }) =>
    request.get<PtlLocationBinding[]>("ptl/devices", { params }),

  saveBinding: (data: SavePtlBindingRequest) =>
    request.post<PtlLocationBinding>("ptl/devices", data),

  removeBinding: (id: string) => request.delete(`ptl/devices/${id}`),
};

export default PtlApi;

import request from "@/utils/request";
import {
  Location,
  CreateLocationRequest,
  UpdateLocationRequest,
  LocationQueryParams,
  LocationPageResponse,
  BatchCreateLocationsRequest,
  LocationSelectOption,
  LocationSelectParams,
} from "./types";

/**
 * 库位管理 (Location) API 服务
 */
const LocationApi = {
  /**
   * 分页查询库位列表
   */
  getLocationPage: (params: LocationQueryParams) =>
    request.get<LocationPageResponse>("locations", { params }),

  /**
   * 获取库位详情
   */
  getLocationDetail: (id: string) =>
    request.get<Location>(`locations/${id}`),

  /**
   * 根据编码查询库位
   */
  getLocationByCode: (code: string) =>
    request.get<Location>(`locations/code/${code}`),

  /**
   * 创建库位
   */
  createLocation: (data: CreateLocationRequest) =>
    request.post<Location>("locations", data),

  /**
   * 批量创建库位
   */
  batchCreateLocations: (data: BatchCreateLocationsRequest) =>
    request.post<Location[]>("locations/batch", data),

  /**
   * 更新库位
   */
  updateLocation: (id: string, data: UpdateLocationRequest) =>
    request.put<Location>(`locations/${id}`, data),

  /**
   * 删除库位
   */
  deleteLocation: (id: string) =>
    request.delete(`locations/${id}`),

  /**
   * 获取可选择的库位列表（下拉选择）
   */
  getLocationSelect: (params?: LocationSelectParams) =>
    request.get<LocationSelectOption[]>("locations/available-for-selection", { params }),
};

export default LocationApi;

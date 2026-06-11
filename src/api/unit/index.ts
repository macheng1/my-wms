import request from "@/utils/request";
import { IUnit, ISaveUnit, IQueryUnit } from "./types";

/**
 * 单位管理 (Unit) API 服务
 */
const UnitApi = {
  /**
   * 分页查询单位列表
   */
  getUnitPage: (params: IQueryUnit) =>
    request.get<{
      list: IUnit[];
      total: number;
      page: number;
      pageSize: number;
    }>("units/page", { params }),

  /**
   * 获取所有单位列表（不分页，用于下拉选择）
   */
  getUnitList: (params?: { category?: string; isActive?: 1 | 0 }) =>
    request.get<IUnit[]>("units", { params }),

  /**
   * 获取启用的单位列表
   */
  getActiveUnits: async (category?: string) => {
    const res = await request.get<IUnit[]>("units/active", {
      params: category ? { category } : undefined,
    });
    if (category) {
      res.data = (res.data || []).filter((item) => item.category === category);
    }
    return res;
  },

  /**
   * 按分类获取单位
   */
  getUnitsByCategory: (category: string) =>
    request.get<IUnit[]>("units", { params: { category } }),

  /**
   * 获取单位详情 (POST)
   */
  getUnitDetail: (id: string) => request.post<IUnit>("units/detail", { id }),

  /**
   * 新增单位
   */
  saveUnit: (data: ISaveUnit) => request.post<IUnit>("units/save", data),

  /**
   * 更新单位
   */
  updateUnit: (data: ISaveUnit) => request.post<IUnit>("units/update", data),

  /**
   * 修改单位启用状态
   */
  updateUnitStatus: (id: string, isActive: 1 | 0) =>
    request.post("units/update", { id, isActive }),

  /**
   * 删除单位
   */
  deleteUnit: (id: string) => request.post("units/delete", { id }),
};

export default UnitApi;

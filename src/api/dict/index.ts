import request from "@/utils/request";
import type {
  DictOption,
  DictItem,
  GetDictOptionsParams,
  SaveDictParams,
  UpdateDictParams,
  DeleteDictParams,
  DictListParams,
  DictListData,
} from "./types";
import { Result, PageResult } from "../base";

/**
 * 字典管理 API
 */
const DictAPI = {
  /**
   * 获取字典选项（用于 Select 组件）
   */
  getDictOptions: (params: GetDictOptionsParams) => {
    return request.get<Result<DictOption[]>>(`/dicts/options`, {
      params: { type: params.type },
    });
  },

  /**
   * 分页查询字典列表
   */
  getDictList: (params: DictListParams) => {
    return request.get<Result<PageResult<DictListData["data"]>>>("/dicts/list", {
      params: {
        type: params.type,
        scope: params.scope,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
      },
    });
  },

  /**
   * 保存字典项
   */
  saveDict: (data: SaveDictParams) => {
    return request.post<Result<DictItem>>("/dicts/save", data);
  },

  /**
   * 更新字典项
   */
  updateDict: (data: UpdateDictParams) => {
    return request.post<Result<DictItem>>("/dicts/update", data);
  },

  /**
   * 删除字典项
   */
  deleteDict: (data: DeleteDictParams) => {
    return request.post<Result<{ raw: []; affected: number }>>("/dicts/delete", data);
  },

  /**
   * 获取所有字典类型（用于字典类型管理）
   */
  getDictTypes: () => {
    return request.get<Result<DictTypeItem[]>>("/dicts/types");
  },
};

export default DictAPI;

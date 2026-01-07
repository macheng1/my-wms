import request from "@/utils/request";
import { Result } from "../base";

// 字典相关 API
const DictAPI = {
  /** 获取字典选项 */
  getOptions: (type: string) => {
    return request.get<Result<any[]>>("/dicts/options", { params: { type } });
  },
  /** 新增字典 */
  save: (data: any) => {
    return request.post<Result<any>>("/dicts/save", data);
  },
  /** 删除字典 */
  delete: (data: any) => {
    return request.post<Result<any>>("/dicts/delete", data);
  },
  /** 更新字典 */
  update: (data: any) => {
    return request.post<Result<any>>("/dicts/update", data);
  },
};

export default DictAPI;

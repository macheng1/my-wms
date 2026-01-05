import request from "@/utils/request";
import type {
  IOptionQuery,
  IAttributeOption,
  IOptionSave,
  IBatchOptionSave,
  IPageResponse,
} from "./types";

/**
 * 规格值 (Option) API
 * 遵循 Action-Driven 设计，确保入参出参对称
 */
const OptionApi = {
  /** * 分页查询规格值
   * 后端默认按 createdAt: ASC 排序
   */

  getOptionPage: (params: IOptionQuery) =>
    request.get<IPageResponse<IAttributeOption>>("options/page", { params }),

  /** * 新增规格值
   * 结构对称，提交后可直接回显
   */
  saveOption: (data: IOptionSave) =>
    request.post<IAttributeOption>("options/save", data),

  /** * 更新规格值
   * 使用 POST 统一处理，解决 attributeId 必填校验问题
   */
  updateOption: (data: Partial<IOptionSave>) =>
    request.post<IAttributeOption>("options/update", data),

  /** * 批量新增规格值 (工业品多规格快速录入专用)
   * values 为字符串数组，后端自动去重插入
   */
  batchSaveOptions: (data: IBatchOptionSave) =>
    request.post("options/batchSave", data),

  /** * 获取规格详情
   * 返回结构与 OptionDetail 完全一致，支持 form.setValues
   */
  getOptionDetail: (id: string) =>
    request.get<IAttributeOption>("options/detail", { params: { id } }),

  /** * 删除规格 (伪删除)
   * 后端执行 softRemove 保留轨迹
   */
  deleteOption: (id: string) => request.post("options/delete", { id }),

  /** * 修改规格状态 (1:启用, 0:禁用)
   * 切换 Switch 时调用
   */
  updateOptionStatus: (id: string, isActive: number) =>
    request.post("options/status", { id, isActive }),
};

export default OptionApi;

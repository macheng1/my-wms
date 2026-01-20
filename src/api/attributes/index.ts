import request, { getDownload } from "@/utils/request";
import { QueryAttribute, AttributeListItem, AttributeDetail } from "./types";

/**
 * 属性 API
 */
const AttributeAPI = {
  /** 分页查询属性 */
  getAttributePage: (params: QueryAttribute) =>
    request.get<{ list: AttributeListItem[]; total: number }>(
      "attributes/page",
      { params },
    ),

  /** 新增属性 */
  saveAttribute: (data: Partial<AttributeDetail>) =>
    request.post("attributes/save", data),

  /** 更新属性 */
  updateAttribute: (data: Partial<AttributeDetail>) => {
    console.log("🚀 ~ data:", data);
    return request.post("attributes/update", data);
  },

  /** 获取属性详情 */
  getAttributeDetail: (id: string) =>
    request.get<AttributeDetail>("attributes/detail", { params: { id } }),
  /** 删除属性 */
  deleteAttribute: (id: string) => request.post("attributes/delete", { id }),

  /** 批量删除属性 */
  batchDeleteAttributes: (ids: string[]) => request.post("attributes/batchDelete", { ids }),

  /** 修改属性状态 */
  updateAttributeStatus: (id: string, isActive: number) =>
    request.post("attributes/status", { id, isActive }),

  /** 下载属性导入模板 */
  downloadTemplate: () => getDownload("attributes/template", undefined, "属性导入模板.xlsx"),

  /** 导入属性数据 */
  importAttributes: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request.post("attributes/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default AttributeAPI;

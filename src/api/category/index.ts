import request from "@/utils/request";
import {
  ICategoryQuery,
  ICategory,
  ICategorySave,
  ICategoryDetail,
} from "./types";

/**
 * 类目管理 (Category) API
 * 负责产品分类定义及属性绑定关系维护
 */
const CategoryApi = {
  /** 类目下拉 */
  getCategorySelect: (params?: { keyword?: string; isActive?: 1 | 0 }) =>
    request.get<Array<{
      label: string;
      value: string;
      id: string;
      name: string;
      code: string;
      isActive: 1 | 0;
      tenantId: string | null;
    }>>("categories/select", { params }),

  /** * 分页查询类目
   * 后端默认按 createdAt: ASC 排序，确保列表稳定性
   */
  getCategoryPage: (params: ICategoryQuery) =>
    request.get<{
      list: ICategory[];
      total: number;
      page: number;
      pageSize: number;
    }>("categories/page", { params }),

  /** * 新增类目
   * 包含基础信息及初始 attributeIds 绑定
   */
  saveCategory: (data: ICategorySave) =>
    request.post<ICategoryDetail>("categories/save", data),

  /** * 更新类目 (显式动作)
   * 支持全量覆盖 attributeIds，同步中间表关联
   */
  updateCategory: (data: ICategorySave) => {
    console.log("🚀 更新类目数据:", data);
    return request.post<ICategoryDetail>("categories/update", data);
  },

  /** * 获取类目详情
   * 返回结构包含 attributeIds 数组，支持 Form 一键回显
   */
  getCategoryDetail: (id: string) =>
    request.get<ICategoryDetail>("categories/detail", { params: { id } }),

  /** * 删除类目 (伪删除)
   * 后端执行 softRemove，保留业务数据轨迹
   */
  deleteCategory: (id: string) => request.post("categories/delete", { id }),

  /** * 修改类目状态 (1:启用, 0:禁用)
   * 禁用类目后，录入产品时将无法选择该分类
   */
  updateCategoryStatus: (id: string, isActive: 1 | 0) =>
    request.post("categories/status", { id, isActive }),
};

export default CategoryApi;

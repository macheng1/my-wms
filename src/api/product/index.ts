import request from "@/utils/request";
import { IProduct, ISaveProduct, IQueryProduct } from "./types";

/**
 * 产品管理 (Product) API 服务
 * 适配引出棒 WMS 物料体系
 */
const ProductApi = {
  /**
   * 分页查询产品列表
   * 返回包含关联类目信息的数据
   */
  getProductPage: (params: IQueryProduct) =>
    request.get<{
      list: IProduct[];
      total: number;
      page: number;
      pageSize: number;
    }>("products/page", { params }),

  /**
   * 获取产品详情
   * 用于编辑页面的 Form 回显
   */
  getProductDetail: (id: string) =>
    request.get<IProduct>("products/detail", { params: { id } }),

  /**
   * 新增产品
   * 后端会执行 SKU 自动生成逻辑
   */
  saveProduct: (data: ISaveProduct) =>
    request.post<IProduct>("products/save", data),

  /**
   * 更新产品
   * 支持修改基础信息、动态规格及多张图片
   */
  updateProduct: (data: ISaveProduct) =>
    request.post<IProduct>("products/update", data),

  /**
   * 修改产品启用状态
   * 切换表格中的 Switch 时调用
   */
  updateProductStatus: (id: string, isActive: 1 | 0) =>
    request.post("products/status", { id, isActive }),

  /**
   * 删除产品 (伪删除)
   * 后端执行 softRemove，保留业务轨迹
   */
  deleteProduct: (id: string) => request.post("products/delete", { id }),
};

export default ProductApi;

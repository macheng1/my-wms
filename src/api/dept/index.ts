import request from "@/utils/request";
import { DeptItem, QueryDeptParams, SaveDeptParams } from "./types";

const DeptAPI = {
  getList: (params?: QueryDeptParams) => request.get<DeptItem[]>("/departments/list", { params }),
  getTree: (params?: QueryDeptParams) => request.get<DeptItem[]>("/departments/tree", { params }),
  getOptions: () => request.get<DeptItem[]>("/departments/options"),
  save: (data: SaveDeptParams) => request.post<DeptItem>("/departments/save", data),
  delete: (id: string) => request.post("/departments/delete", { id }),
};

export default DeptAPI;

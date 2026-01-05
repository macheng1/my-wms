import request from "@/utils/request";
import {
  UserInfoResponse,
  CreateUser,
  UpdateUser,
  ChangePassword,
  ResetPassword,
  UpdateUserStatus,
  QueryUser,
} from "./types";

/**
 * 用户 API
 */

const UserAPI = {
  /** 获取用户信息 */
  getUserInfo: () => request.get<UserInfoResponse>("/users/getUserInfo"),

  getUserDetail: (id: string) => request.post("/users/detail", { id }),

  /** 分页查询用户 */
  getUserPage: (params: QueryUser) => request.get("/users/page", { params }),

  /** 新增用户 */
  saveUser: (data: CreateUser) => request.post("/users/save", data),

  /** 更新用户 */
  updateUser: (data: UpdateUser) => request.post("/users/update", data),

  /** 个人修改密码 */
  changePassword: (data: ChangePassword) =>
    request.post("/users/password", data),

  /** 管理员重置密码 */
  resetPassword: (data: ResetPassword) => request.post("/users/reset", data),

  /** 启用/禁用用户 */
  updateUserStatus: (data: UpdateUserStatus) =>
    request.post("/users/status", data),

  /** 删除用户 */
  deleteUser: (id: string) => request.post("/users/delete", { id }),
};

export default UserAPI;

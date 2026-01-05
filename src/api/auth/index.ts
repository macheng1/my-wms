import request from "@/utils/request";
import { LoginParams, LoginData, RegisterParams } from "./types";

/**
 * 认证模块 API
 */
const AuthAPI = {
  /** 登录 */
  login: async (data: LoginParams) => {
    // 直接返回后端数据部分，避免外部还要 .data
    const res = await request.post<LoginData>("/auth/login", data);
    return res.data;
  },

  /** 申请开通/注册 */
  register: (data: RegisterParams) => {
    return request.post<RegisterParams>("/tenants/onboard", data);
  },

  /** 退出登录 */
  logout: () => {
    return request.post("/auth/logout");
  },
};

export default AuthAPI;

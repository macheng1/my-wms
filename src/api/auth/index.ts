import request from "@/utils/request";
import { Result } from "../base";
import { LoginParams, LoginData, RegisterParams, RegisterResult } from "./types";

/**
 * 认证模块 API
 */
const AuthAPI = {
  /** 登录 */
  login: async (data: LoginParams) => {
    // 直接返回后端数据部分，避免外部还要 .data
    const res = await request.post<LoginData>("/user/login", data);
    if (!res?.data?.access_token) {
      throw new Error(res?.message || "登录失败，未获取到访问凭证");
    }
    return res.data;
  },

  /** 申请开通/注册 */
  register: (data: RegisterParams) => {
    return request.post<Result<RegisterResult>>("/tenants/onboard", data);
  },

  /** 退出登录 */
  logout: () => {
    return Promise.resolve();
  },
};

export default AuthAPI;

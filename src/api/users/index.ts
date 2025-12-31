import request from "@/utils/request";
import { UserInfoResponse } from "./types";
import { Result } from "../base";

/**
 * 用户 API
 */
const UserAPI = {
  /** 2. 获取用户信息 */
  getUserInfo: () => {
    // 对应路径: http://localhost:3001/api/users/getUserInfo
    return request.get<UserInfoResponse>("/users/getUserInfo");
  },
};

export default UserAPI;

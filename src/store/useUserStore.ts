import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { UserAPI } from "@/api"; // 💡 引入你之前创建的 UserAPI

interface UserInfo {
  id?: string;
  username: string;
  avatar?: string;
  role: "admin" | "staff";
}

interface UserState {
  userInfo: (UserInfo & { permissions?: string[] }) | null;
  token: string | null;
  setToken: (token: string) => void;
  setUserInfo: (info: UserInfo) => void;
  // 💡 新增：异步获取用户信息的方法
  fetchUserInfo: () => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userInfo: null,
      token: null,

      setToken: (token) => {
        set({ token });
        Cookies.set("wms_token", token, { expires: 1, path: "/" });
      },

      setUserInfo: (info) => set({ userInfo: info }),

      // 💡 核心逻辑：刷新后补全用户信息
      fetchUserInfo: async () => {
        const { token, userInfo } = get();
        // 如果有 token 但没用户信息，说明刚刷新完页面
        if (token && !userInfo) {
          try {
            const res = await UserAPI.getUserInfo();
            set({ userInfo: res.data });
          } catch (error) {
            console.error("自动补全用户信息失败:", error);
            // 如果 Token 失效，可以选择直接登出
            // get().logout();
          }
        }
      },

      logout: () => {
        set({ userInfo: null, token: null });
        Cookies.remove("wms_token");
        localStorage.removeItem("wms-user-storage");
        window.location.href = "/login";
      },
    }),
    {
      name: "wms-user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
    }
  )
);

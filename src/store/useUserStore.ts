import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";

interface UserInfo {
  id?: string;
  username: string;
  avatar?: string;
  role: "admin" | "staff";
}

interface UserState {
  userInfo: UserInfo | null;
  token: string | null;
  // 操作方法
  setToken: (token: string) => void;
  setUserInfo: (info: UserInfo) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userInfo: null,
      token: null,

      // 存储 Token 并同步到 Cookie
      setToken: (token) => {
        set({ token });
        // 同步到 Cookie 供中间件使用，有效期 1 天
        Cookies.set("wms_token", token, { expires: 1, path: "/" });
      },

      // 存储用户信息
      setUserInfo: (info) => set({ userInfo: info }),

      // 登出：清理所有缓存
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
      // 💡 关键：只持久化 token。userInfo 不持久化，刷新页面即消失，触发重新获取
      partialize: (state) => ({ token: state.token }),
    }
  )
);

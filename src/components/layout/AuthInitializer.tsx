"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";

export const AuthInitializer = () => {
  const fetchUserInfo = useUserStore((state) => state.fetchUserInfo);
  const token = useUserStore((state) => state.token);

  useEffect(() => {
    // 💡 只要组件加载（比如刷新页面），就尝试同步一次用户信息
    if (token) {
      fetchUserInfo();
    }
  }, [token, fetchUserInfo]);

  return null; // 这个组件不需要渲染任何 UI
};

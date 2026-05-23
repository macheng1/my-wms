"use client";

import { useCallback, useMemo } from "react";
import { useUserStore } from "@/store/useUserStore";

export type BtnAuthCode = string | string[] | undefined | null;
export type BtnAuthMode = "all" | "any";

export const checkBtnAuth = (
  butAuths: string[] | undefined,
  code: BtnAuthCode,
  mode: BtnAuthMode = "all"
) => {
  if (!code || (Array.isArray(code) && code.length === 0)) return true;

  const auths = butAuths || [];
  if (auths.includes("*")) return true;

  const codes = Array.isArray(code) ? code : [code];
  return mode === "any"
    ? codes.some((item) => auths.includes(item))
    : codes.every((item) => auths.includes(item));
};

export function useBtnAuth() {
  const butAuths = useUserStore((state) => state.userInfo?.butAuths);

  const authSet = useMemo(() => new Set(butAuths || []), [butAuths]);

  const hasBtnAuth = useCallback(
    (code: BtnAuthCode, mode: BtnAuthMode = "all") => {
      if (!code || (Array.isArray(code) && code.length === 0)) return true;
      if (authSet.has("*")) return true;

      const codes = Array.isArray(code) ? code : [code];
      return mode === "any"
        ? codes.some((item) => authSet.has(item))
        : codes.every((item) => authSet.has(item));
    },
    [authSet]
  );

  return {
    butAuths: butAuths || [],
    hasBtnAuth,
  };
}

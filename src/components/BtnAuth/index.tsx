"use client";

import type { ReactNode } from "react";
import { useBtnAuth, type BtnAuthCode, type BtnAuthMode } from "@/hooks/useBtnAuth";

interface BtnAuthProps {
  code: BtnAuthCode;
  mode?: BtnAuthMode;
  fallback?: ReactNode;
  children: ReactNode;
}

export default function BtnAuth({
  code,
  mode = "all",
  fallback = null,
  children,
}: BtnAuthProps) {
  const { hasBtnAuth } = useBtnAuth();

  return hasBtnAuth(code, mode) ? <>{children}</> : <>{fallback}</>;
}

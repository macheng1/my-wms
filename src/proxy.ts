// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 获取 Token
  const token = request.cookies.get("wms_token")?.value;

  // 2. 定义公开路由前缀
  // 将 /register 改为包含子路径的逻辑
  const publicPaths = ["/login", "/register"];

  // 判断当前路径是否在公开白名单中 (支持子路径，如 /register/success)
  const isPublicRoute = publicPaths.some((path) => pathname.startsWith(path));

  // 3. 核心逻辑逻辑

  // 情况 A：访问受保护页面（如 /dashboard, /products）但没登录 -> 去登录
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 情况 B：已登录但想回登录/注册页 -> 去首页
  // 注意：成功页不需要拦截，让用户看完后再手动点返回
  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

/**
 * 过滤器配置：保持现状，已经很专业了
 */
export const config = {
  matcher: ["/((?!api|_next|static|.*\\..*).*)"],
};

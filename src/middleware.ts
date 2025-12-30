// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 中间件逻辑：每次路由跳转都会触发
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 获取 Cookie 中的 Token
  const token = request.cookies.get("wms_token")?.value;
  console.log("🚀 ~ middleware ~ token:", token);

  // 2. 定义公开路由（不需要登录也能访问）
  const isPublicRoute = pathname === "/login" || pathname === "/register";

  // 3. 逻辑判断
  // 情况 A：访问受保护页面，但没有 Token -> 强制跳转到登录页
  if (!token && !isPublicRoute) {
    // 这里的 URL 会变成 http://localhost:3000/login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 情况 B：已经登录（有 Token），但又想访问登录页 -> 强制跳转到首页/工作台
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 情况 C：其他情况（如已登录访问首页）-> 放行
  return NextResponse.next();
}

/**
 * 配置过滤器：决定哪些路径会触发中间件
 * 我们排除掉静态资源（图片、JS、CSS）和 favicon
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * 1. /api (API 路由)
     * 2. /_next (Next.js 内部静态资源)
     * 3. /static (你放在 public 下的静态文件)
     * 4. 所有包含点（.）的文件 (如 favicon.ico, logo.png)
     */
    "/((?!api|_next|static|.*\\..*).*)",
  ],
};

# Copilot Instructions for my-wms

## 项目架构与核心约定

- **技术栈**：Next.js (App Router)，TypeScript，Semi UI（@douyinfe/semi-ui-19），Axios。
- **目录结构**：
  - `src/app/`：页面与布局，采用 Next.js App Router，支持嵌套路由与布局。
  - `src/api/`：前端 API 封装，按业务模块分文件夹（如 attributes, users, role 等），统一导出于 `src/api/index.ts`。
  - `src/constants/menuConfig.tsx`：系统菜单与权限码配置，权限控制依赖 `code` 字段。
  - `src/components/`：全局可复用组件（如 AppHeader, AppSider, ProDataTable）。
  - `src/utils/request.ts`：全局 axios 实例，自动注入 token，支持本地/开发环境日志输出。
  - `src/lib/store/useUserStore.ts`：用户信息与权限的全局状态管理。

## 权限与菜单

- 菜单与权限码强绑定，所有页面权限控制依赖 `MENU_CONFIG` 的 `code` 字段。
- 用户权限通过 `userInfo.permissions` 字段判定，超级管理员为 `*`。
- 递归查找当前路由对应权限码，见 `src/app/(dashboard)/layout.tsx`。

## 业务数据结构

- 统一 API 响应结构见 `src/api/base.ts`，分页结构为 `PageResult<T>`。
- 角色、用户等核心实体类型定义于各自模块的 `types.ts` 文件。

## 组件与表单

- 表单与弹窗组件集中于各业务模块的 `components/` 子目录。
- 表单校验、初始值、选项等均通过 props 传递，示例见 `UserEditModal.tsx`、`RoleEditModal.tsx`。
- 表格统一使用 `ProDataTable` 组件，支持 valueEnum、render、hideInSearch 等配置。

## 开发与调试

- 启动开发环境：`npm run dev`（或 `yarn dev`/`pnpm dev`/`bun dev`）。
- 主要开发入口：`src/app/(dashboard)/` 下的各业务页面。
- 环境变量通过 `.env` 文件配置，API 基础路径为 `NEXT_PUBLIC_API_URL`。
- 代码风格：遵循 Next.js + TypeScript + Semi UI 组合，ESLint 配置见 `.eslintrc.js`、`.eslintrc.cjs`。
- 禁用未用类型报错，允许 `any`，详见 `.eslintrc.cjs`。

## 其他约定

- 所有页面组件默认使用 `"use client"`，除非明确为服务端组件。
- 样式优先使用 Tailwind CSS 工具类（如有），全局样式见 `globals.css`。
- 依赖包版本锁定，见 `package.json`。

## 参考文件

- `src/constants/menuConfig.tsx` —— 菜单与权限核心配置
- `src/api/base.ts` —— API 响应与分页结构
- `src/utils/request.ts` —— 请求封装与拦截器
- `src/app/(dashboard)/layout.tsx` —— 权限与布局逻辑
- 各业务模块的 `components/` —— 组件复用与表单模式

---

如需扩展新业务模块，建议参考现有 `product/attr`、`users`、`settings/roles` 目录结构与组件拆分方式。

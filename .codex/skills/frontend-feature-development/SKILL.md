---
name: frontend-feature-development
description: 实现管理端前端功能时使用：Next.js 页面、路由、菜单、Semi UI 组件、表格、表单、弹窗、API 调用、zustand 状态、权限可见性和样式开发。
---

# 前端功能开发

## 使用目标

按照页面设计和 API 契约，在 Next.js 管理端项目中完成可联调、可验证的功能实现。

## 工作流程

1. 先确认需求、页面设计、API 契约和现有相似页面。
2. 按顺序实现：
   - 路由和菜单
   - API 类型和方法
   - 页面组件
   - 表格/筛选/表单/弹窗
   - 权限可见性
   - loading/empty/error 状态
3. 使用 Semi UI 和项目已有组件优先，不重复造轮子。
4. 保持页面状态和接口参数清晰，不把复杂逻辑塞进 JSX。
5. 完成后运行 lint/build 或启动页面验证。

## 开发规则

- App Router 页面默认遵循现有 `src/app/(dashboard)` 结构。
- 客户端交互组件需要 `"use client"`。
- 请求统一使用 `src/api` 和 `src/utils/request.ts`。
- 全局用户状态优先使用 `useUserStore`。
- 菜单和权限码维护在 `src/constants/menuConfig.tsx`。
- 表格优先复用 `ProDataTable`，除非交互明显不适合。
- 删除、状态切换、危险操作必须有确认。
- 表单提交要有 loading 和错误提示，成功后刷新列表或返回详情。

## 完成标准

- 页面可访问，菜单入口正确。
- API 调用和类型对齐。
- 加载、空数据、错误、提交中状态完整。
- 权限显示逻辑明确。
- lint/build 或浏览器验证有结果。

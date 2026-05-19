---
name: api-integration-design
description: 设计或调整前端 API 对接时使用：axios 请求封装、src/api 模块、类型定义、分页结构、错误处理、权限、token、租户上下文和与后端接口契约对齐。
---

# API 对接设计

## 使用目标

让前端 API 模块、类型、页面调用和后端接口契约保持一致，降低联调成本。

## 工作流程

1. 先读取后端接口文档、`src/api/*`、`src/utils/request.ts` 和页面调用方式。
2. 确认接口路径、方法、入参、出参、错误结构、权限和租户来源。
3. 在 `src/api/<module>/` 中维护：
   - `index.ts`：API 方法
   - `types.ts`：请求和响应类型
4. 列表接口对齐后端分页：`{ list, total, page, pageSize }`。
5. 统一错误处理走 `request.ts`，页面只处理业务必要分支。

## 规则

- 不在页面里直接写裸 axios 请求。
- API 方法名要表达业务动作，例如 `getProductPage`、`saveProduct`、`updateProduct`。
- 类型定义和后端 DTO/返回结构同步。
- 登录态 token 由统一请求层处理。
- 不把后端不需要的字段提交回去，例如 `createdAt`、`updatedAt`、只读展示字段。
- 联调发现接口不一致时，先记录契约差异，不要在页面里堆兼容逻辑。

## 输出建议

- API 清单。
- 类型定义。
- 页面调用方式。
- 错误处理策略。
- 与后端契约差异。
- 联调验证项。

# Codex Skills 执行协议

## 定位

- 本文件约束当前管理端项目 `.codex/skills/` 的使用方式。
- 根目录 `AGENTS.md` 负责项目规范；本文件负责说明什么时候调用哪些 skill，以及按什么顺序推进前端任务。
- 所有回复默认使用中文。

## 可用 Skills

- `$frontend-prd-analysis`：从 PRD、页面需求、业务描述中拆解管理端前端任务。
- `$admin-page-design`：设计管理后台页面、表格、表单、弹窗、筛选和操作流。
- `$api-integration-design`：设计或调整前端 API、类型、请求、返回结构和联调契约。
- `$frontend-feature-development`：按设计实现 Next.js 管理端前端功能。
- `$frontend-test-verification`：进行 lint、build、页面、接口、权限和联调验证。
- `$frontend-architecture-governance`：统一或调整前端架构、目录、API 层、组件、状态和菜单权限规范。

## 标准执行顺序

完整管理端需求按以下顺序推进：

1. `$frontend-prd-analysis`
2. `$admin-page-design`
3. `$api-integration-design`
4. `$frontend-feature-development`
5. `$frontend-test-verification`

如果用户只要求其中一个阶段，只执行对应 skill；但发现前置设计缺失时，应先补齐必要分析再继续。

架构治理是横向流程，不替代主链路；当需求涉及项目结构、公共组件、请求层、状态管理、菜单权限或统一规范时，先用 `$frontend-architecture-governance` 盘点和定方案，再进入具体阶段。

## 触发规则

- 用户提供 PRD、页面需求、业务流程或“帮我分析怎么做”时，先用 `$frontend-prd-analysis`。
- 用户提到页面、布局、表格、筛选、表单、弹窗、抽屉、交互、空状态时，用 `$admin-page-design`。
- 用户提到接口、API、DTO、返回结构、请求封装、axios、联调、错误处理时，用 `$api-integration-design`。
- 用户要求“实现”“开发”“改页面”“加功能”“修 bug”时，用 `$frontend-feature-development`；如果设计不清楚，先回到页面设计或 API 设计。
- 用户要求“测试”“验证”“检查”“能不能跑”“页面是否正常”时，用 `$frontend-test-verification`。
- 用户提到“架构”“统一”“重构”“公共组件”“目录结构”“请求封装”“状态管理”“菜单权限”时，用 `$frontend-architecture-governance`。

## 组合规则

- 新页面从 0 到 1：PRD 分析 + 页面设计 + API 对接设计 + 功能开发 + 测试验证。
- 只改 UI 不改接口：页面设计 + 功能开发 + 测试验证。
- 只改接口对接：API 对接设计 + 功能开发 + 测试验证。
- 修页面 bug：现状分析 + 功能开发 + 测试验证。
- 架构统一或横向重构：架构治理 + 分阶段开发 + 测试验证。

## 输出要求

- 分析阶段输出页面范围、用户路径、接口依赖、权限、风险和验收标准。
- 页面设计阶段输出路由、布局、组件拆分、表格/表单/弹窗和交互状态。
- API 对接阶段输出 API 清单、类型定义、页面调用方式和联调差异。
- 开发阶段输出修改文件、关键实现和验证命令。
- 验证阶段输出执行命令、浏览器检查结果、未覆盖项和剩余风险。
- 架构治理阶段输出现状、不一致点、目标架构、分阶段改造计划和验证方式。

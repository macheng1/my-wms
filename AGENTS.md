# My-WMS 管理端 Agent 协议

## 项目定位

- 本项目是 WMS 管理端前端，技术栈为 Next.js 16、React 19、TypeScript、Semi UI、axios、zustand。
- 页面路由主要位于 `src/app/`，管理端布局位于 `src/app/(dashboard)/layout.tsx`。
- API 封装位于 `src/api/`，统一请求位于 `src/utils/request.ts`。
- 公共组件位于 `src/components/`，菜单和权限码位于 `src/constants/menuConfig.tsx`。
- 用户状态位于 `src/store/useUserStore.ts`。
- 管理端分端 PRD 位于 `docs/prd/`；开始页面或功能开发前，优先读取对应 PRD。

## 推荐 Skills

- 从 PRD、页面需求或业务描述拆管理端任务时，使用 `$frontend-prd-analysis`。
- 设计管理后台页面、表格、表单、弹窗、筛选、操作列和交互状态时，使用 `$admin-page-design`。
- 设计或调整前端 API、类型、请求参数、返回结构、错误处理和后端联调契约时，使用 `$api-integration-design`。
- 按设计开发页面、组件、路由、菜单、API 调用和状态逻辑时，使用 `$frontend-feature-development`。
- 完成功能后进行 lint、build、页面、接口、权限和联调验证时，使用 `$frontend-test-verification`。
- 需要统一前端架构、目录、请求层、组件抽象、菜单权限、状态管理或跨页面规范时，使用 `$frontend-architecture-governance`。
- 完整前端需求通常按 `$frontend-prd-analysis` -> `$admin-page-design` -> `$api-integration-design` -> `$frontend-feature-development` -> `$frontend-test-verification` 推进。
- 架构治理是横向流程；涉及统一规范或重构时，应先治理架构，再进入具体开发和验证。

## 常用命令

- 优先使用 `pnpm`，因为项目包含 `pnpm-lock.yaml`。
- 常用命令：
  - `pnpm install`
  - `pnpm run dev`
  - `pnpm run build`
  - `pnpm run lint`
  - `pnpm run start`

## 代码规范

- 默认使用中文回复。
- 修改前先阅读相关页面、API、组件、菜单配置和状态逻辑。
- 优先沿用现有目录结构、Semi UI 组件和项目已有公共组件。
- 开发页面前必须先检查 `src/components/` 是否已有可复用组件；已有封装优先使用项目组件，例如 `ProDataTable`、上传、导入、布局和通知组件，不要在页面里重复手写同类表格、查询表单、工具栏、弹窗或上传逻辑。
- 只有当现有公共组件无法满足业务差异时，才在页面内做局部实现；如果多个页面都需要同类能力，应优先扩展或新增 `src/components/` 下的公共组件。
- 不做无关重构，不大面积格式化无关文件。
- App Router 页面遵循 `src/app/` 结构；交互组件需要 `"use client"`。
- API 请求统一走 `src/api/` 和 `src/utils/request.ts`，不要在页面里直接写裸 axios。
- 菜单和权限码统一维护在 `src/constants/menuConfig.tsx`。
- 用户 token、用户信息和权限优先使用 `useUserStore`。

## 管理端页面规范

- 管理端优先可扫描、可操作、信息密度合理，不做营销式页面。
- 列表页要考虑筛选、分页、刷新、操作列、空状态、错误状态和 loading。
- 表单要考虑校验、默认值、回显、提交中、防重复提交和错误提示。
- 删除、状态切换等危险操作必须有确认。
- 接口错误优先走统一 request 层 Toast，页面只处理必要业务分支。
- 新增页面要同步路由、菜单、权限码和 API 类型。

## 验证规范

- 代码改动后优先运行 `pnpm run lint` 和 `pnpm run build`。
- 页面改动应启动 dev server 并进行浏览器检查。
- 接口改动要验证请求路径、参数、返回结构、错误处理和登录态。
- 权限/菜单改动要验证菜单可见性、路由访问和无权限情况。

## Git 与安全

- 不覆盖用户未提交改动。
- 不使用破坏性 git 命令，除非用户明确要求。
- 不提交真实密钥、Token、生产环境敏感配置。

## 最终回复

- 简要说明完成了什么、修改了哪些文件、运行了哪些验证命令。
- 如果有未验证项、接口联调风险或需要后端配合，必须明确指出。

# agent-memory-frontend

3 人协作的暑期实训前端项目，当前采用 `React + Vite + TypeScript + Ant Design + Axios + Zustand`。  
当前处于前后端联调阶段：公共层与页面骨架已经稳定，Chat、Memory、Task、Settings 已接入接口封装；记忆管理支持 JSON/CSV 导入。真实大模型回复、会话列表和大批量导入仍需后端补充接口。

## 快速开始

```bash
pnpm install
pnpm dev
```

常用命令：

```bash
pnpm build
pnpm lint
pnpm test
pnpm check
```

默认本地环境变量：

- `VITE_API_BASE_URL`：后端服务地址
- `VITE_API_TIMEOUT_MS`：接口超时时间，默认 `10000`

`pnpm check` 会依次执行 lint、测试和生产构建，建议在提交 PR 前运行。

## 当前目录结构

```text
src/
  api/                  接口请求封装、模块 API、类型定义
  components/
    business/           贴近业务的组件，允许按页面继续扩展
    common/             A 维护的通用组件与统一状态组件
  constants/            路由、存储键、常量
  hooks/                对 API/store 的轻量封装
  layouts/              App 壳层、导航布局
  mock/                 保留的演示数据（核心页面不再依赖）
  pages/
    Chat/               B 负责主流程
    Memory/             C 负责
    Task/               C 负责
    Settings/           C 负责
  router/               路由定义、菜单元信息、错误路由兜底
  store/                Zustand 状态
  utils/                错误处理、提示、存储、格式化工具
```

## 分支协作规则

- `main`：稳定可展示分支，只接收经过验证的合并结果。
- `dev`：团队日常集成分支，A 负责先保证可运行、可构建、可合并。
- `feature/*`：个人功能分支，建议命名为 `feature/b-chat-stream`、`feature/c-memory-list` 这类可读名称。

推荐流程：

1. 从 `dev` 拉取最新代码。
2. 新建自己的 `feature/*` 分支开发。
3. 本地先跑 `pnpm build` 和 `pnpm lint`。
4. 提交 Pull Request 到 `dev`。
5. A 完成集成检查后再合并。
6. 里程碑稳定后，再由 `dev` 合并到 `main`。

## A / B / C 协作边界

### A 负责

- `src/router`
- `src/layouts`
- `src/store`
- `src/api`
- `src/components/common`
- `README.md`
- `docs/collaboration.md`

### B 主要负责

- `src/pages/Chat`
- `src/components/business/ChatInputPanel`
- `src/components/business/ChatMessageList`
- 与聊天主流程直接相关的 hooks / service / API 接入代码

### C 主要负责

- `src/pages/Memory`
- `src/pages/Task`
- `src/pages/Settings`
- `src/components/business/MemoryCard`
- `src/components/business/MemoryFilterBar`
- `src/components/business/TaskProgressPanel`
- `src/components/business/ConfigForm`

### 不建议 B / C 随意改动

- `src/router`
- `src/layouts`
- `src/store`
- `src/api/request.ts`
- `src/api/client.ts`
- `src/components/common`

如果确实需要改这些目录，建议先和 A 对齐，再改。

## 页面开发建议

### B 从哪里开始

- 优先从 `src/pages/Chat/index.tsx` 开始接真实聊天流程。
- 可逐步替换 `src/mock/chat.mock.ts`，并补 `service.ts` / hooks。
- 尽量复用现有 `PageContainer`、`PageSection`、统一提示工具，不要单独造一套页面壳。

### C 从哪里开始

- `src/pages/Memory/index.tsx`：先接记忆列表、搜索、筛选。
- `src/pages/Task/index.tsx`：再接任务创建和进度查询。
- `src/pages/Settings/index.tsx`：最后补更多联调配置和保存规则。

## Pull Request 建议

- PR 尽量只做一类事情，不要把“路由整理 + 聊天业务 + UI 重构”混在一起。
- 标题建议带角色和范围，例如：`feat(B): connect chat session flow`
- 描述中至少写清：
  - 改了哪些目录
  - 是否影响公共层
  - 本地是否通过 `pnpm build` / `pnpm lint`
  - 是否需要 A 协助联调或二次集成

## 协作文档

- 详细协作边界、目录建议和提交流程见 [docs/collaboration.md](./docs/collaboration.md)

# 协作说明

这份文档面向当前 3 人协作模式，重点是明确目录边界、集成流程和改动优先级。

## 角色分工

### A：框架负责人 / 集成人

主要负责：

- `src/router`
- `src/layouts`
- `src/store`
- `src/api`
- `src/components/common`
- 项目 README 与协作文档
- `dev` 分支的结构稳定性和公共能力收口

重点职责：

- 保证路由和菜单结构清晰
- 保证公共组件和页面容器模式统一
- 保证错误提示、空状态、loading、异常兜底可复用
- 保证 `dev` 分支始终可运行、可构建、可 lint

### B：聊天主流程负责人

主要负责：

- `src/pages/Chat`
- `src/components/business/ChatInputPanel`
- `src/components/business/ChatMessageList`
- 与聊天流程直接相关的 `service.ts`、hooks、API 调用拼接

建议工作顺序：

1. 接真实会话创建与关闭逻辑
2. 接消息发送与消息列表更新
3. 接模型回复和记忆写入链路
4. 再补聊天页局部交互细节

### C：记忆管理 / 任务 / 配置负责人

主要负责：

- `src/pages/Memory`
- `src/pages/Task`
- `src/pages/Settings`
- `src/components/business/MemoryCard`
- `src/components/business/MemoryFilterBar`
- `src/components/business/TaskProgressPanel`
- `src/components/business/ConfigForm`

建议工作顺序：

1. `Memory` 页先接列表与筛选
2. `Task` 页接任务状态与进度
3. `Settings` 页补联调配置项与保存规则

## 目录边界

### `src/router`

- 由 A 主维护。
- B/C 不建议直接改路由结构、父子路由模式和菜单元信息。
- 如果新增页面入口，先让 A 帮忙挂路由和菜单配置。

### `src/layouts`

- 由 A 主维护。
- 这里是应用壳层、导航和内容区域规范。
- B/C 不建议直接在这里堆业务逻辑。

### `src/store`

- 由 A 主维护 store 组织方式与命名规范。
- B/C 可以在对齐命名后追加 slice / store，但不要随意改已有状态结构。

### `src/api`

- `client.ts`、`request.ts`、模块划分建议由 A 统一维护。
- B/C 可以在 `modules/` 下补各自业务接口。
- 不建议绕过 `request.ts` 直接在页面里写裸 `axios`。

### `src/components/common`

- 由 A 主维护。
- 这里放页面容器、统一空状态、loading、错误兜底、状态标签等。
- B/C 需要优先复用，不建议直接复制一份相似组件。

### `src/pages/Chat`

- B 主负责。
- A 只维护页面骨架和公共层接入方式，不负责主业务细节推进。

### `src/pages/Memory`

- C 主负责。
- 优先基于现有筛选区和空状态模式继续开发。

### `src/pages/Task`

- C 主负责。
- 优先补任务查询、创建、刷新等闭环。

### `src/pages/Settings`

- C 主负责。
- 继续围绕本地联调配置展开，不要把全局框架逻辑塞回这里。

## 哪些改动需要先和 A 对齐

- 改 `src/router`
- 改 `src/layouts`
- 改 `src/components/common`
- 改 `src/api/client.ts`
- 改 `src/api/request.ts`
- 改已有全局 store 结构

如果只是补业务页内部逻辑、补 API 模块、补页面局部组件，B/C 可以直接在各自分支推进。

## 分支与提交流程

推荐流程：

1. 从 `dev` 拉最新代码。
2. 新建 `feature/*` 分支。
3. 本地开发完成后先跑：

```bash
pnpm build
pnpm lint
```

4. 提交 PR 到 `dev`。
5. 在 PR 描述中写清：
   - 改了哪些目录
   - 是否影响公共层
   - 是否需要联调
   - 本地验证结果

## 当前接入起点

### B 最适合先做

- `src/pages/Chat/index.tsx`
- `src/pages/Chat/service.ts`
- 聊天相关 hooks 与 API 模块

### C 最适合先做

- `src/pages/Memory/index.tsx`
- `src/pages/Task/index.tsx`
- `src/pages/Settings/index.tsx`

## 当前阶段不建议做的事

- 大幅重做整体 UI 风格
- 一次性重写所有业务页面
- 引入很重的工程体系
- 直接改动仓库核心方向

当前阶段最重要的是把“多人协作底座”做稳，让后续页面开发可以并行推进。

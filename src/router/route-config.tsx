import {
  ApiOutlined,
  ApartmentOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  CodeOutlined,
  CompressOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FilterOutlined,
  FundOutlined,
  HistoryOutlined,
  KeyOutlined,
  MessageOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SettingOutlined,
  TagsOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import { generationPresets, getGenerationPath } from '@/constants/generation'
import type { GenerationView } from '@/constants/generation'
import { appRoutes } from '@/constants/routes'
import {
  AgentAccessRoutePage,
  ContextRoutePage,
  CredentialManagementRoutePage,
  DataValidationRoutePage,
  GenerationRoutePage,
  IngestionRoutePage,
  MemoryRoutePage,
  MonitoringRoutePage,
  OverviewRoutePage,
  RetrievalRoutePage,
  SceneManagementRoutePage,
  SettingsRoutePage,
  TaskRoutePage,
} from '@/router/LazyRoutePages'

export interface AppRouteConfig {
  key: keyof typeof appRoutes
  path: string
  label: string
  title: string
  description: string
  icon: ReactNode
  element: ReactNode
  showInMenu?: boolean
}

export const appRouteConfigs: AppRouteConfig[] = [
  {
    key: 'overview',
    path: appRoutes.overview,
    label: '系统总览',
    title: '系统总览',
    description: '查看智能体接入、记忆处理、检索调用和运行质量。',
    icon: <FundOutlined />,
    element: <OverviewRoutePage />,
  },
  {
    key: 'agentAccess',
    path: appRoutes.agentAccess,
    label: '智能体注册接入',
    title: '智能体注册接入',
    description: '注册业务智能体并保存后端返回的身份凭据。',
    icon: <RobotOutlined />,
    element: <AgentAccessRoutePage />,
    showInMenu: false,
  },
  {
    key: 'sceneManagement',
    path: appRoutes.sceneManagement,
    label: '场景标识配置',
    title: '场景标识配置',
    description: '创建用于隔离智能体、任务和记忆数据的业务场景。',
    icon: <TagsOutlined />,
    element: <SceneManagementRoutePage />,
    showInMenu: false,
  },
  {
    key: 'credentialManagement',
    path: appRoutes.credentialManagement,
    label: '接口密钥配置',
    title: '接口密钥配置',
    description: '维护智能体调用记忆服务使用的 Agent ID 与 API Key。',
    icon: <KeyOutlined />,
    element: <CredentialManagementRoutePage />,
    showInMenu: false,
  },
  {
    key: 'ingestion',
    path: appRoutes.ingestion,
    label: '记忆数据导入',
    title: '智能体接入与数据写入',
    description: '导入对话记录、历史会话摘要和任务过程数据。',
    icon: <CloudUploadOutlined />,
    element: <IngestionRoutePage />,
  },
  {
    key: 'dataValidation',
    path: appRoutes.dataValidation,
    label: '数据校验与标准化',
    title: '数据校验与标准化',
    description: '检查导入文件结构并预览标准化结果。',
    icon: <CheckCircleOutlined />,
    element: <DataValidationRoutePage />,
    showInMenu: false,
  },
  {
    key: 'task',
    path: appRoutes.task,
    label: '任务过程管理',
    title: '任务过程管理',
    description: '创建任务、维护执行进度，并关联任务过程记忆。',
    icon: <UnorderedListOutlined />,
    element: <TaskRoutePage />,
  },
  {
    key: 'memory',
    path: appRoutes.memory,
    label: '多层记忆管理',
    title: '多层记忆管理',
    description: '按用户、类型和场景维护多层记忆数据。',
    icon: <DatabaseOutlined />,
    element: <MemoryRoutePage />,
  },
  {
    key: 'userMemory',
    path: appRoutes.userMemory,
    label: '用户级记忆',
    title: '用户级记忆',
    description: '管理用户偏好、稳定事实和长期约束。',
    icon: <UserOutlined />,
    element: <MemoryRoutePage />,
    showInMenu: false,
  },
  {
    key: 'sessionMemory',
    path: appRoutes.sessionMemory,
    label: '会话级记忆',
    title: '会话级记忆',
    description: '按 Session ID 查看历史会话摘要和上下文。',
    icon: <MessageOutlined />,
    element: <MemoryRoutePage />,
    showInMenu: false,
  },
  {
    key: 'taskMemory',
    path: appRoutes.taskMemory,
    label: '任务级记忆',
    title: '任务级记忆',
    description: '按 Task ID 管理任务目标、进展和执行结果。',
    icon: <UnorderedListOutlined />,
    element: <MemoryRoutePage />,
    showInMenu: false,
  },
  {
    key: 'generation',
    path: appRoutes.generation,
    label: '生成与去重融合',
    title: '记忆生成与去重融合',
    description: '观察抽取、生成、冲突识别、融合和入库处理链路。',
    icon: <ApartmentOutlined />,
    element: <GenerationRoutePage />,
  },
  {
    key: 'retrieval',
    path: appRoutes.retrieval,
    label: '多信号融合检索',
    title: '多信号融合记忆检索',
    description: '组合语义、关键词、元数据和重排信号检索记忆。',
    icon: <FilterOutlined />,
    element: <RetrievalRoutePage />,
  },
  {
    key: 'semanticRetrieval',
    path: appRoutes.semanticRetrieval,
    label: '语义向量检索',
    title: '语义向量检索',
    description: '按照查询含义召回语义相近的历史记忆。',
    icon: <SearchOutlined />,
    element: <RetrievalRoutePage />,
    showInMenu: false,
  },
  {
    key: 'keywordRetrieval',
    path: appRoutes.keywordRetrieval,
    label: '关键词检索',
    title: '关键词检索',
    description: '使用明确词语和实体定位匹配记忆。',
    icon: <FileSearchOutlined />,
    element: <RetrievalRoutePage />,
    showInMenu: false,
  },
  {
    key: 'metadataRetrieval',
    path: appRoutes.metadataRetrieval,
    label: '元数据过滤',
    title: '元数据过滤',
    description: '按类型、状态、场景和任务范围筛选记忆。',
    icon: <FilterOutlined />,
    element: <RetrievalRoutePage />,
    showInMenu: false,
  },
  {
    key: 'fusionRetrieval',
    path: appRoutes.fusionRetrieval,
    label: '融合排序',
    title: '融合排序',
    description: '合并语义、关键词、时效性和业务权重进行重排。',
    icon: <BranchesOutlined />,
    element: <RetrievalRoutePage />,
    showInMenu: false,
  },
  {
    key: 'topKRetrieval',
    path: appRoutes.topKRetrieval,
    label: 'Top-K 返回',
    title: 'Top-K 返回',
    description: '控制最终返回的高相关记忆数量。',
    icon: <UnorderedListOutlined />,
    element: <RetrievalRoutePage />,
    showInMenu: false,
  },
  {
    key: 'context',
    path: appRoutes.context,
    label: '记忆上下文返回',
    title: '记忆上下文返回',
    description: '预览结构化 JSON 与可注入智能体的文本上下文片段。',
    icon: <FileSearchOutlined />,
    element: <ContextRoutePage />,
  },
  {
    key: 'jsonContext',
    path: appRoutes.jsonContext,
    label: '结构化 JSON 返回',
    title: '结构化 JSON 返回',
    description: '生成包含记忆片段和统计信息的结构化响应。',
    icon: <CodeOutlined />,
    element: <ContextRoutePage />,
    showInMenu: false,
  },
  {
    key: 'textContext',
    path: appRoutes.textContext,
    label: '文本上下文片段返回',
    title: '文本上下文片段返回',
    description: '生成可直接注入外部智能体的文本上下文。',
    icon: <FileTextOutlined />,
    element: <ContextRoutePage />,
    showInMenu: false,
  },
  {
    key: 'relevanceContext',
    path: appRoutes.relevanceContext,
    label: '相关性筛选',
    title: '上下文相关性筛选',
    description: '设置当前任务范围并优先保留高相关记忆。',
    icon: <FilterOutlined />,
    element: <ContextRoutePage />,
    showInMenu: false,
  },
  {
    key: 'lengthContext',
    path: appRoutes.lengthContext,
    label: '长度控制与压缩',
    title: '上下文长度控制与压缩',
    description: '按 Token 预算组织和压缩返回内容。',
    icon: <CompressOutlined />,
    element: <ContextRoutePage />,
    showInMenu: false,
  },
  {
    key: 'monitoring',
    path: appRoutes.monitoring,
    label: '接口与监控',
    title: '接口与运行监控',
    description: '检查服务连通性、接口状态和最近告警。',
    icon: <FundOutlined />,
    element: <MonitoringRoutePage />,
  },
  {
    key: 'healthMonitoring',
    path: appRoutes.healthMonitoring,
    label: '接口健康检查',
    title: '接口健康检查',
    description: '检查后端服务连通性和版本状态。',
    icon: <SafetyCertificateOutlined />,
    element: <MonitoringRoutePage />,
    showInMenu: false,
  },
  {
    key: 'callsMonitoring',
    path: appRoutes.callsMonitoring,
    label: '调用状态监控',
    title: '调用状态监控',
    description: '查看核心接口最近状态和响应耗时。',
    icon: <FundOutlined />,
    element: <MonitoringRoutePage />,
    showInMenu: false,
  },
  {
    key: 'recordsMonitoring',
    path: appRoutes.recordsMonitoring,
    label: '联调记录',
    title: '联调记录',
    description: '集中记录接口问题、修复状态和运行保障项。',
    icon: <HistoryOutlined />,
    element: <MonitoringRoutePage />,
    showInMenu: false,
  },
  {
    key: 'settings',
    path: appRoutes.settings,
    label: '系统设置',
    title: '系统设置',
    description: '管理后端连接地址和当前浏览器使用的本地用户身份。',
    icon: <SettingOutlined />,
    element: <SettingsRoutePage />,
  },
  {
    key: 'connectionSettings',
    path: appRoutes.connectionSettings,
    label: '基础连接设置',
    title: '基础连接设置',
    description: '配置当前浏览器连接的后端服务地址。',
    icon: <ApiOutlined />,
    element: <SettingsRoutePage />,
    showInMenu: false,
  },
  {
    key: 'identitySettings',
    path: appRoutes.identitySettings,
    label: '本地用户身份',
    title: '本地用户身份',
    description: '配置联调和记忆查询使用的 User ID。',
    icon: <TeamOutlined />,
    element: <SettingsRoutePage />,
    showInMenu: false,
  },
]

export interface MenuEntryConfig {
  key: string
  path: string
  label: string
  icon: ReactNode
}

export interface MenuSectionConfig {
  key: string
  label: string
  icon: ReactNode
  items: MenuEntryConfig[]
}

function routeItem(key: string, path: string, label: string, icon: ReactNode): MenuEntryConfig {
  return { key, path, label, icon }
}

function generationItem(view: GenerationView, icon: ReactNode): MenuEntryConfig {
  const preset = generationPresets[view]
  return routeItem(`generation:${view}`, getGenerationPath(view), preset.title, icon)
}

export const menuSectionConfigs: MenuSectionConfig[] = [
  {
    key: 'section:access',
    label: '1. 智能体接入与记忆数据写入',
    icon: <CloudUploadOutlined />,
    items: [
      routeItem('access:agent', appRoutes.agentAccess, '智能体注册接入', <RobotOutlined />),
      routeItem('access:scene', appRoutes.sceneManagement, '场景标识配置', <TagsOutlined />),
      routeItem('access:key', appRoutes.credentialManagement, '接口密钥配置', <KeyOutlined />),
      routeItem('access:ingestion', appRoutes.ingestion, '记忆数据导入', <CloudUploadOutlined />),
      routeItem('access:validation', appRoutes.dataValidation, '数据校验与标准化', <CheckCircleOutlined />),
    ],
  },
  {
    key: 'section:memory',
    label: '2. 通用记忆建模与多层记忆管理',
    icon: <DatabaseOutlined />,
    items: [
      routeItem('memory:user', appRoutes.userMemory, '用户级记忆', <UserOutlined />),
      routeItem('memory:session', appRoutes.sessionMemory, '会话级记忆', <MessageOutlined />),
      routeItem('memory:task', appRoutes.taskMemory, '任务级记忆', <UnorderedListOutlined />),
      routeItem('memory:agent', appRoutes.memory, '智能体级记忆', <RobotOutlined />),
    ],
  },
  {
    key: 'section:generation',
    label: '3. 记忆生成与去重融合',
    icon: <ApartmentOutlined />,
    items: [
      generationItem('preference', <UserOutlined />),
      generationItem('fact', <FileSearchOutlined />),
      generationItem('task-state', <CheckCircleOutlined />),
      generationItem('decision', <HistoryOutlined />),
      generationItem('conflict', <WarningOutlined />),
      generationItem('conflict-dedup', <DeleteOutlined />),
      generationItem('similar-dedup', <BranchesOutlined />),
      generationItem('fusion', <ApartmentOutlined />),
      generationItem('low-value', <FilterOutlined />),
    ],
  },
  {
    key: 'section:retrieval',
    label: '4. 多信号融合记忆检索',
    icon: <SearchOutlined />,
    items: [
      routeItem('retrieval:semantic', appRoutes.semanticRetrieval, '语义向量检索', <SearchOutlined />),
      routeItem('retrieval:keyword', appRoutes.keywordRetrieval, '关键词检索', <FileSearchOutlined />),
      routeItem('retrieval:metadata', appRoutes.metadataRetrieval, '元数据过滤', <FilterOutlined />),
      routeItem('retrieval:fusion', appRoutes.fusionRetrieval, '融合排序', <BranchesOutlined />),
      routeItem('retrieval:topk', appRoutes.topKRetrieval, 'Top-K 返回', <UnorderedListOutlined />),
    ],
  },
  {
    key: 'section:context',
    label: '5. 记忆上下文返回',
    icon: <FileTextOutlined />,
    items: [
      routeItem('context:json', appRoutes.jsonContext, '结构化 JSON 返回', <CodeOutlined />),
      routeItem('context:text', appRoutes.textContext, '文本上下文片段返回', <FileTextOutlined />),
      routeItem('context:relevance', appRoutes.relevanceContext, '相关性筛选', <FilterOutlined />),
      routeItem('context:length', appRoutes.lengthContext, '长度控制与压缩', <CompressOutlined />),
    ],
  },
  {
    key: 'section:monitoring',
    label: '6. 接口与监控',
    icon: <ApiOutlined />,
    items: [
      routeItem('monitoring:health', appRoutes.healthMonitoring, '接口健康检查', <SafetyCertificateOutlined />),
      routeItem('monitoring:calls', appRoutes.callsMonitoring, '调用状态监控', <FundOutlined />),
      routeItem('monitoring:records', appRoutes.recordsMonitoring, '联调记录', <HistoryOutlined />),
    ],
  },
  {
    key: 'section:settings',
    label: '7. 系统设置',
    icon: <SettingOutlined />,
    items: [
      routeItem('settings:connection', appRoutes.connectionSettings, '基础连接设置', <ApiOutlined />),
      routeItem('settings:identity', appRoutes.identitySettings, '本地用户身份', <TeamOutlined />),
    ],
  },
]

export function findRouteConfig(pathname: string) {
  return appRouteConfigs.find((route) => route.path === pathname)
}

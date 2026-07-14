import {
  CommentOutlined,
  DatabaseOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import { appRoutes } from '@/constants/routes'
import {
  ChatRoutePage,
  MemoryRoutePage,
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
    key: 'chat',
    path: appRoutes.chat,
    label: '聊天',
    title: '智能对话',
    description: '创建和关闭会话，检索历史上下文，并将本轮消息写入长期记忆。',
    icon: <CommentOutlined />,
    element: <ChatRoutePage />,
  },
  {
    key: 'memory',
    path: appRoutes.memory,
    label: '记忆管理',
    title: '记忆管理',
    description: '检索、编辑、删除与批量导入 JSON/CSV 历史记忆。',
    icon: <DatabaseOutlined />,
    element: <MemoryRoutePage />,
  },
  {
    key: 'task',
    path: appRoutes.task,
    label: '任务',
    title: '任务管理',
    description: '创建任务、查询和更新进度，并把当前任务关联到聊天记忆。',
    icon: <UnorderedListOutlined />,
    element: <TaskRoutePage />,
  },
  {
    key: 'settings',
    path: appRoutes.settings,
    label: '系统配置',
    title: '系统配置',
    description: '管理联调地址、智能体凭据与业务场景。',
    icon: <SettingOutlined />,
    element: <SettingsRoutePage />,
  },
]

export const menuRouteConfigs = appRouteConfigs.filter(
  (route) => route.showInMenu !== false,
)

export function findRouteConfig(pathname: string) {
  return appRouteConfigs.find((route) => route.path === pathname)
}

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
    title: '聊天页',
    description: '聊天主流程入口，后续由 B 继续接入会话、消息流与记忆联动。',
    icon: <CommentOutlined />,
    element: <ChatRoutePage />,
  },
  {
    key: 'memory',
    path: appRoutes.memory,
    label: '记忆管理',
    title: '记忆管理页',
    description: '记忆列表、筛选、编辑和清理能力的接入区域，后续由 C 推进。',
    icon: <DatabaseOutlined />,
    element: <MemoryRoutePage />,
  },
  {
    key: 'task',
    path: appRoutes.task,
    label: '任务',
    title: '任务页',
    description: '任务创建、任务进度与记忆关联的承接区域，后续由 C 推进。',
    icon: <UnorderedListOutlined />,
    element: <TaskRoutePage />,
  },
  {
    key: 'settings',
    path: appRoutes.settings,
    label: '系统配置',
    title: '系统配置页',
    description: '本地联调配置与环境接入面，后续由 C 在此补充可配置项。',
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

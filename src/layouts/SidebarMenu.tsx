import {
  CommentOutlined,
  DatabaseOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { appRoutes } from '../constants/routes'

const items: MenuProps['items'] = [
  { key: appRoutes.chat, icon: <CommentOutlined />, label: '聊天页' },
  { key: appRoutes.memory, icon: <DatabaseOutlined />, label: '记忆管理' },
  { key: appRoutes.task, icon: <UnorderedListOutlined />, label: '任务页' },
  { key: appRoutes.settings, icon: <SettingOutlined />, label: '系统配置' },
]

export function SidebarMenu() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div style={{ paddingTop: 16 }}>
      <div style={{ padding: '0 16px 16px', fontSize: 16, fontWeight: 700 }}>
        Frontend Shell
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => navigate(key)}
      />
    </div>
  )
}

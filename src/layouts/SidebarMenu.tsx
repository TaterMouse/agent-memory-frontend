import { Menu, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { menuRouteConfigs } from '@/router/route-config'

interface SidebarMenuProps {
  onNavigate?: () => void
}

export function SidebarMenu({ onNavigate }: SidebarMenuProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const items: MenuProps['items'] = menuRouteConfigs.map((route) => ({
    key: route.path,
    icon: route.icon,
    label: route.label,
  }))

  return (
    <div style={{ paddingTop: 16 }}>
      <div style={{ padding: '0 16px 16px' }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          Agent Memory
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
          对话、记忆、任务与场景配置的一体化工作台。
        </Typography.Paragraph>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => {
          navigate(key)
          onNavigate?.()
        }}
      />
    </div>
  )
}

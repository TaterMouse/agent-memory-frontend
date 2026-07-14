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
          Frontend Shell
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
          A 负责导航与通用层，B/C 基于既有页面骨架继续接业务。
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

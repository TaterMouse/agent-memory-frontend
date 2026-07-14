import { MenuOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Button, Drawer, Flex, Grid, Layout, Space, Tag, Typography, theme } from 'antd'
import { Outlet, useLocation } from 'react-router-dom'
import { SidebarMenu } from '@/layouts/SidebarMenu'
import { findRouteConfig } from '@/router/route-config'

const { Header, Content, Sider } = Layout

export function AppLayout() {
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const currentRoute = findRouteConfig(location.pathname)
  const isDesktop = screens.lg === true
  const contentPadding = isDesktop ? 24 : 12

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isDesktop ? (
        <Sider
          width={240}
          theme="light"
          style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}
        >
          <SidebarMenu />
        </Sider>
      ) : (
        <Drawer
          placement="left"
          size={280}
          open={mobileMenuOpen}
          closable={false}
          styles={{ body: { padding: 0 } }}
          onClose={() => setMobileMenuOpen(false)}
        >
          <SidebarMenu onNavigate={() => setMobileMenuOpen(false)} />
        </Drawer>
      )}
      <Layout style={{ minWidth: 0 }}>
        <Header
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            padding: isDesktop ? '0 24px' : '0 12px',
            height: 'auto',
            minHeight: 72,
          }}
        >
          <Flex align="center" gap={8} style={{ minWidth: 0 }}>
            {!isDesktop ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                aria-label="打开导航菜单"
                onClick={() => setMobileMenuOpen(true)}
              />
            ) : null}
            <Space orientation="vertical" size={2} style={{ minWidth: 0 }}>
              <Typography.Text
                type="secondary"
                ellipsis
                style={{ fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase' }}
              >
                Agent Memory Frontend
              </Typography.Text>
              <Flex align="center" gap={8} wrap>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  智能体记忆系统前端
                </Typography.Title>
                {currentRoute ? <Tag color="blue">{currentRoute.label}</Tag> : null}
              </Flex>
            </Space>
          </Flex>
        </Header>
        <Content style={{ padding: contentPadding, minWidth: 0 }}>
          <div style={{ margin: '0 auto', maxWidth: 1280, minWidth: 0 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

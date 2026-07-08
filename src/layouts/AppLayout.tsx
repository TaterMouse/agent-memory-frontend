import { Layout, Space, Tag, Typography, theme } from 'antd'
import { Outlet, useLocation } from 'react-router-dom'
import { SidebarMenu } from '@/layouts/SidebarMenu'
import { findRouteConfig } from '@/router/route-config'

const { Header, Content, Sider } = Layout

export function AppLayout() {
  const { token } = theme.useToken()
  const location = useLocation()
  const currentRoute = findRouteConfig(location.pathname)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={240}
        theme="light"
        style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}
      >
        <SidebarMenu />
      </Sider>
      <Layout>
        <Header
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            height: 'auto',
            minHeight: 72,
          }}
        >
          <Space direction="vertical" size={2}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase' }}
            >
              Agent Memory Frontend
            </Typography.Text>
            <Space size={12}>
              <Typography.Title level={4} style={{ margin: 0 }}>
                智能体记忆系统前端
              </Typography.Title>
              {currentRoute ? <Tag color="blue">{currentRoute.label}</Tag> : null}
            </Space>
          </Space>
        </Header>
        <Content style={{ padding: 24 }}>
          <div style={{ margin: '0 auto', maxWidth: 1280 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

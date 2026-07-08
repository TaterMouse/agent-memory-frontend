import { Layout, theme } from 'antd'
import type { ReactNode } from 'react'
import { SidebarMenu } from './SidebarMenu'

const { Header, Content, Sider } = Layout

export function AppLayout({ children }: { children: ReactNode }) {
  const { token } = theme.useToken()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240} theme="light" style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}>
        <SidebarMenu />
      </Sider>
      <Layout>
        <Header
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          智能体记忆系统前端
        </Header>
        <Content style={{ padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  )
}

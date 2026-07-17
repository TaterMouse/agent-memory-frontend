import {
  BellOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Dropdown,
  Flex,
  Grid,
  Input,
  Layout,
  Space,
  Typography,
} from 'antd'
import { Outlet, useLocation } from 'react-router-dom'
import { SidebarMenu } from '@/layouts/SidebarMenu'
import { findRouteConfig } from '@/router/route-config'

const { Header, Content, Sider } = Layout

export function AppLayout() {
  const screens = Grid.useBreakpoint()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const currentRoute = findRouteConfig(location.pathname)
  const isDesktop = screens.lg === true

  return (
    <Layout className="app-shell">
      {isDesktop ? (
        <Sider width={270} theme="light" className="app-sider">
          <SidebarMenu />
        </Sider>
      ) : (
        <Drawer
          placement="left"
          size={300}
          open={mobileMenuOpen}
          closable={false}
          styles={{ body: { padding: 0 } }}
          onClose={() => setMobileMenuOpen(false)}
        >
          <SidebarMenu onNavigate={() => setMobileMenuOpen(false)} />
        </Drawer>
      )}
      <Layout style={{ minWidth: 0 }}>
        <Header className="app-header" style={{ padding: isDesktop ? '0 20px' : '0 12px' }}>
          <Flex align="center" justify="space-between" gap={16} style={{ width: '100%', minWidth: 0 }}>
            <Flex align="center" gap={10} style={{ minWidth: 0 }}>
              {!isDesktop ? (
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  aria-label="打开导航菜单"
                  onClick={() => setMobileMenuOpen(true)}
                />
              ) : (
                <Button type="text" icon={<MenuFoldOutlined />} aria-label="折叠菜单" />
              )}
              <Typography.Text className="app-header-title" ellipsis>
                {currentRoute?.title ?? '系统总览'}
              </Typography.Text>
            </Flex>
            <Input
              className="app-global-search"
              prefix={<SearchOutlined />}
              placeholder="搜索智能体、记忆、场景…"
              aria-label="全局搜索"
            />
            <Space size={14}>
              <Badge count={12} size="small">
                <Button type="text" shape="circle" icon={<BellOutlined />} />
              </Badge>
              <Button type="text" shape="circle" icon={<QuestionCircleOutlined />} />
              <Dropdown
                menu={{
                  items: [
                    { key: 'profile', label: '管理员信息' },
                    { key: 'logout', label: '退出登录' },
                  ],
                }}
              >
                <Flex align="center" gap={8} className="app-user">
                  <Avatar size={32} icon={<UserOutlined />} />
                  {isDesktop ? (
                    <div>
                      <Typography.Text strong>admin</Typography.Text>
                      <Typography.Text type="secondary">系统管理员</Typography.Text>
                    </div>
                  ) : null}
                </Flex>
              </Dropdown>
            </Space>
          </Flex>
        </Header>
        <Content style={{ padding: isDesktop ? 20 : 12, minWidth: 0 }}>
          <div style={{ margin: '0 auto', maxWidth: 1540, minWidth: 0 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

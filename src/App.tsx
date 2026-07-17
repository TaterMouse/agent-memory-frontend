import { App as AntdApp, ConfigProvider } from 'antd'
import { AppErrorBoundary } from '@/components/common'
import { AppRouterProvider } from '@/router'

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1467d2',
          borderRadius: 8,
          colorBgLayout: '#f2f5f9',
          colorText: '#17233c',
          fontFamily: "'HarmonyOS Sans SC', 'Microsoft YaHei', sans-serif",
          boxShadowSecondary: '0 8px 24px rgba(22, 46, 84, 0.08)',
        },
        components: {
          Card: { headerHeight: 46, bodyPadding: 18 },
          Layout: { headerBg: '#ffffff', siderBg: '#ffffff' },
          Menu: { itemHeight: 38, itemBorderRadius: 6 },
        },
      }}
    >
      <AntdApp>
        <AppErrorBoundary>
          <AppRouterProvider />
        </AppErrorBoundary>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App

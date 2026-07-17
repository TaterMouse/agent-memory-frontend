import { App as AntdApp, ConfigProvider } from 'antd'
import { useEffect } from 'react'
import { AppErrorBoundary } from '@/components/common'
import { AppRouterProvider } from '@/router'
import { setContextMessage } from '@/utils/feedback'

function AppContent() {
  const { message } = AntdApp.useApp()

  useEffect(() => {
    setContextMessage(message)
    return () => setContextMessage(undefined)
  }, [message])

  return (
    <AppErrorBoundary>
      <AppRouterProvider />
    </AppErrorBoundary>
  )
}

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
        <AppContent />
      </AntdApp>
    </ConfigProvider>
  )
}

export default App

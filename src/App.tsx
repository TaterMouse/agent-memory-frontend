import { App as AntdApp, ConfigProvider } from 'antd'
import { AppErrorBoundary } from '@/components/common'
import { AppRouterProvider } from '@/router'

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2e74b5',
          borderRadius: 10,
          colorBgLayout: '#f5f7fb',
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

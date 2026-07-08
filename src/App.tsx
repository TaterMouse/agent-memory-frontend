import { ConfigProvider } from 'antd'
import { AppRouterProvider } from './router'

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
      <AppRouterProvider />
    </ConfigProvider>
  )
}

export default App

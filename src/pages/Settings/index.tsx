import { Alert } from 'antd'
import { useLocation } from 'react-router-dom'
import { ConfigForm } from '@/components/business/ConfigForm'
import { PageContainer } from '@/components/common'
import { useAppStore } from '@/store'
import { normalizeAppConfig } from '@/utils/config'
import { showSuccessMessage } from '@/utils/feedback'

export default function SettingsPage() {
  const { pathname } = useLocation()
  const connectionOnly = pathname.endsWith('/connection')
  const identityOnly = pathname.endsWith('/identity')
  const appConfig = useAppStore((state) => state.config)
  const setConfig = useAppStore((state) => state.setConfig)

  return (
    <PageContainer
      title={connectionOnly ? '基础连接设置' : identityOnly ? '本地用户身份' : '系统设置'}
      description={connectionOnly
        ? '配置当前浏览器访问的后端服务地址，并作为所有接口请求的基础路径。'
        : identityOnly
          ? '配置联调和记忆查询使用的 User ID，不涉及智能体注册凭据。'
          : '管理当前浏览器连接后端所需的基础地址和本地用户身份。'}
    >
      <Alert
        type="info"
        showIcon
        title={connectionOnly ? '连接地址只保存在当前浏览器' : identityOnly ? 'User ID 用于隔离用户记忆' : '接入功能已经独立'}
        description={connectionOnly
          ? '修改后会影响健康检查、记忆写入、检索和上下文返回等全部接口。'
          : identityOnly
            ? '用户级记忆、任务和检索请求都会携带这里配置的 User ID。'
            : '智能体注册、业务场景和接口密钥请从左侧“智能体接入与记忆数据写入”分组进入。'}
      />
      <ConfigForm
        initialValues={appConfig}
        fields={connectionOnly ? ['baseUrl'] : identityOnly ? ['userId'] : ['baseUrl', 'userId']}
        title={connectionOnly ? '后端服务连接' : identityOnly ? '用户身份配置' : '基础连接与本地身份'}
        onSubmit={(values) => {
          setConfig(normalizeAppConfig({ ...appConfig, ...values }))
          showSuccessMessage('基础设置已保存到本地。')
        }}
      />
    </PageContainer>
  )
}

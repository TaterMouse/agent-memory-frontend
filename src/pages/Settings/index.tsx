import { message } from 'antd'
import { ConfigForm } from '../../components/business/ConfigForm'
import { PageContainer } from '../../components/common/PageContainer'
import { useAppStore } from '../../store/appStore'

export default function SettingsPage() {
  const appConfig = useAppStore((state) => state.config)
  const setConfig = useAppStore((state) => state.setConfig)

  return (
    <PageContainer
      title="系统配置页"
      description="用于保存本地联调配置，包括 baseURL、userId、sceneId、agentId 与 apiKey。"
    >
      <ConfigForm
        initialValues={appConfig}
        onSubmit={(values) => {
          setConfig(values)
          message.success('配置已保存到本地')
        }}
      />
    </PageContainer>
  )
}

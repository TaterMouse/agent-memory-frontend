import { ConfigForm } from '@/components/business/ConfigForm'
import { PageContainer } from '@/components/common'
import { useAppStore } from '@/store'
import { showSuccessMessage } from '@/utils/feedback'
import type { AppConfig } from '@/api/types'

export default function SettingsPage() {
  const appConfig = useAppStore((state) => state.config)
  const setConfig = useAppStore((state) => state.setConfig)

  return (
    <PageContainer
      title="系统配置页"
      description="用于保存本地联调配置，包括 baseUrl、userId、sceneId、agentId 和 apiKey。后续由 C 在这里继续补可选配置项。"
    >
      <ConfigForm
        initialValues={appConfig}
        onSubmit={(values) => {
          // 保存前统一trim
          const normalizedValues: AppConfig = {
            baseUrl: (values.baseUrl ?? '').trim(),
            userId: (values.userId ?? '').trim(),
            sceneId: (values.sceneId ?? '').trim(),
            agentId: (values.agentId ?? '').trim(),
            apiKey: (values.apiKey ?? '').trim(),
          }

          setConfig(normalizedValues)
          showSuccessMessage('配置已保存到本地。')
        }}
      />
    </PageContainer>
  )
}

import { useEffect, useState } from 'react'
import { Alert, Button, Card, Form, Input, Space } from 'antd'
import { rotateAgentKey } from '@/api/modules/agent'
import type { AppConfig } from '@/api/types'
import { PageContainer } from '@/components/common'
import { useAppStore } from '@/store'
import { normalizeAppConfig } from '@/utils/config'
import { showErrorMessage, showSuccessMessage, showWarningMessage } from '@/utils/feedback'

type CredentialValues = Pick<AppConfig, 'agentId' | 'apiKey'>

export default function CredentialManagementPage() {
  const appConfig = useAppStore((state) => state.config)
  const setConfig = useAppStore((state) => state.setConfig)
  const [rotating, setRotating] = useState(false)
  const [form] = Form.useForm<CredentialValues>()

  useEffect(() => {
    form.setFieldsValue({ agentId: appConfig.agentId, apiKey: appConfig.apiKey })
  }, [appConfig.agentId, appConfig.apiKey, form])

  const saveCredentials = (values: CredentialValues) => {
    setConfig(normalizeAppConfig({ ...appConfig, ...values }))
    showSuccessMessage('接口凭据已保存到当前浏览器。')
  }

  const handleRotate = async () => {
    const agentId = form.getFieldValue('agentId')?.trim()
    if (!agentId) {
      showWarningMessage('请先填写 Agent ID。')
      return
    }

    setRotating(true)
    try {
      const result = await rotateAgentKey(agentId)
      const nextConfig = normalizeAppConfig({ ...appConfig, agentId, apiKey: result.api_key })
      setConfig(nextConfig)
      form.setFieldsValue({ agentId: nextConfig.agentId, apiKey: nextConfig.apiKey })
      showSuccessMessage('API Key 已轮换并保存，请妥善保管。')
    } catch (error) {
      showErrorMessage(error, 'API Key 轮换失败')
    } finally {
      setRotating(false)
    }
  }

  return (
    <PageContainer
      title="接口密钥配置"
      description="维护智能体调用记忆服务时使用的 Agent ID 与 API Key。"
    >
      <Alert
        type="warning"
        showIcon
        title="凭据仅保存在当前浏览器"
        description="请勿在截图、提交记录或公开文档中暴露 API Key；轮换后旧密钥可能立即失效。"
      />
      <Card variant="borderless" title="智能体调用凭据">
        <Form<CredentialValues> form={form} layout="vertical" onFinish={saveCredentials}>
          <Form.Item name="agentId" label="Agent ID" rules={[{ required: true, whitespace: true }]}>
            <Input placeholder="agent_abc" />
          </Form.Item>
          <Form.Item name="apiKey" label="API Key" rules={[{ required: true, whitespace: true }]}>
            <Input.Password placeholder="mem_xxxx" />
          </Form.Item>
          <Space wrap>
            <Button type="primary" htmlType="submit">保存凭据</Button>
            <Button loading={rotating} onClick={() => void handleRotate()}>轮换 API Key</Button>
          </Space>
        </Form>
      </Card>
    </PageContainer>
  )
}

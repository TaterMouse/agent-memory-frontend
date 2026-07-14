import { useState } from 'react'
import { Alert, Button, Card, Checkbox, Form, Input, Space } from 'antd'
import type { AgentRegisterPayload, SceneCreatePayload } from '@/api/types'
import { registerAgent, rotateAgentKey } from '@/api/modules/agent'
import { createScene } from '@/api/modules/scene'
import { ConfigForm } from '@/components/business/ConfigForm'
import { PageContainer } from '@/components/common'
import { useAppStore } from '@/store'
import { showErrorMessage, showSuccessMessage, showWarningMessage } from '@/utils/feedback'
import { normalizeAppConfig } from '@/utils/config'

export default function SettingsPage() {
  const appConfig = useAppStore((state) => state.config)
  const setConfig = useAppStore((state) => state.setConfig)
  const [registering, setRegistering] = useState(false)
  const [rotating, setRotating] = useState(false)
  const [creatingScene, setCreatingScene] = useState(false)
  const [agentForm] = Form.useForm<AgentRegisterPayload>()
  const [sceneForm] = Form.useForm<SceneCreatePayload>()

  const saveConfig = (config = appConfig) => {
    setConfig(normalizeAppConfig(config))
  }

  const handleRegisterAgent = async (values: AgentRegisterPayload) => {
    setRegistering(true)
    try {
      const result = await registerAgent(values)
      saveConfig({ ...appConfig, sceneId: values.scene_id, agentId: result.agent_id, apiKey: result.api_key })
      showSuccessMessage('智能体注册成功，Agent ID 与 API Key 已保存')
    } catch (error) {
      showErrorMessage(error, '智能体注册失败')
    } finally {
      setRegistering(false)
    }
  }

  const handleRotateKey = async () => {
    if (!appConfig.agentId) {
      showWarningMessage('请先注册或填写 Agent ID')
      return
    }
    setRotating(true)
    try {
      const result = await rotateAgentKey(appConfig.agentId)
      saveConfig({ ...appConfig, apiKey: result.api_key })
      showSuccessMessage('API Key 已轮换并保存，请妥善保管')
    } catch (error) {
      showErrorMessage(error, 'API Key 轮换失败')
    } finally {
      setRotating(false)
    }
  }

  const handleCreateScene = async (values: SceneCreatePayload) => {
    setCreatingScene(true)
    try {
      const result = await createScene(values)
      if (result.scene_id) {
        saveConfig({ ...appConfig, sceneId: result.scene_id })
      }
      sceneForm.resetFields()
      showSuccessMessage(result.scene_id ? `场景已创建：${result.scene_id}` : '场景创建成功')
    } catch (error) {
      showErrorMessage(error, '场景创建失败')
    } finally {
      setCreatingScene(false)
    }
  }

  return (
    <PageContainer
      title="系统配置"
      description="管理本地联调参数、智能体身份和业务场景。API Key 仅保存在当前浏览器。"
    >
      <Alert
        type="info"
        showIcon
        title="联调顺序"
        description="先保存后端地址与用户信息，再注册智能体或填写已有凭据，最后创建或选择 Scene ID。"
      />
      <ConfigForm
        initialValues={appConfig}
        onSubmit={(values) => {
          saveConfig(values)
          showSuccessMessage('配置已保存到本地。')
        }}
      />
      <Card variant="borderless" title="智能体注册与密钥">
        <Form
          form={agentForm}
          layout="vertical"
          initialValues={{ agent_name: 'Web聊天助手', scene_id: appConfig.sceneId, permissions: ['read', 'write'] }}
          onFinish={(values) => void handleRegisterAgent(values)}
        >
          <Form.Item name="agent_name" label="智能体名称" rules={[{ required: true, whitespace: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="scene_id" label="所属场景" rules={[{ required: true, whitespace: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="permissions" label="权限" rules={[{ required: true }]}>
            <Checkbox.Group options={[
              { label: '读取记忆', value: 'read' },
              { label: '写入记忆', value: 'write' },
            ]} />
          </Form.Item>
          <Space wrap>
            <Button type="primary" htmlType="submit" loading={registering}>注册并保存凭据</Button>
            <Button onClick={() => void handleRotateKey()} loading={rotating} disabled={!appConfig.agentId}>
              轮换 API Key
            </Button>
          </Space>
        </Form>
      </Card>
      <Card variant="borderless" title="创建业务场景">
        <Form form={sceneForm} layout="vertical" onFinish={(values) => void handleCreateScene(values)}>
          <Form.Item name="scene_name" label="场景名称" rules={[{ required: true, whitespace: true }]}>
            <Input placeholder="例如：代码助手" />
          </Form.Item>
          <Form.Item name="description" label="场景说明">
            <Input.TextArea rows={3} placeholder="描述这个场景中的记忆用途" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={creatingScene}>创建场景</Button>
        </Form>
      </Card>
    </PageContainer>
  )
}

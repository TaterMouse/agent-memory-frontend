import { useState } from 'react'
import { Alert, Button, Card, Checkbox, Descriptions, Form, Input } from 'antd'
import { registerAgent } from '@/api/modules/agent'
import type { AgentRegisterPayload } from '@/api/types'
import { PageContainer } from '@/components/common'
import { useAppStore } from '@/store'
import { normalizeAppConfig } from '@/utils/config'
import { showErrorMessage, showSuccessMessage } from '@/utils/feedback'

export default function AgentAccessPage() {
  const appConfig = useAppStore((state) => state.config)
  const setConfig = useAppStore((state) => state.setConfig)
  const [registering, setRegistering] = useState(false)

  const handleRegister = async (values: AgentRegisterPayload) => {
    setRegistering(true)
    try {
      const result = await registerAgent(values)
      setConfig(normalizeAppConfig({
        ...appConfig,
        sceneId: values.scene_id,
        agentId: result.agent_id,
        apiKey: result.api_key,
      }))
      showSuccessMessage('智能体注册成功，身份凭据已保存到当前浏览器。')
    } catch (error) {
      showErrorMessage(error, '智能体注册失败')
    } finally {
      setRegistering(false)
    }
  }

  return (
    <PageContainer
      title="智能体注册接入"
      description="为业务智能体创建独立身份，并授予记忆读取或写入权限。"
    >
      <Alert
        type="info"
        showIcon
        title="注册前请先准备业务场景"
        description="智能体必须归属一个 Scene ID。注册成功后，系统会自动保存返回的 Agent ID 和 API Key。"
      />
      <Card variant="borderless" title="当前接入身份">
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }}>
          <Descriptions.Item label="Agent ID">{appConfig.agentId || '尚未注册'}</Descriptions.Item>
          <Descriptions.Item label="Scene ID">{appConfig.sceneId || '尚未配置'}</Descriptions.Item>
          <Descriptions.Item label="凭据状态">{appConfig.apiKey ? '已保存' : '未保存'}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card variant="borderless" title="注册新智能体">
        <Form<AgentRegisterPayload>
          layout="vertical"
          initialValues={{
            agent_name: '记忆管理智能体',
            scene_id: appConfig.sceneId,
            permissions: ['read', 'write'],
          }}
          onFinish={(values) => void handleRegister(values)}
        >
          <Form.Item name="agent_name" label="智能体名称" rules={[{ required: true, whitespace: true }]}>
            <Input placeholder="例如：物流调度智能体" />
          </Form.Item>
          <Form.Item name="scene_id" label="所属 Scene ID" rules={[{ required: true, whitespace: true }]}>
            <Input placeholder="例如：logistics-dispatch" />
          </Form.Item>
          <Form.Item name="permissions" label="记忆权限" rules={[{ required: true, message: '请至少选择一项权限' }]}>
            <Checkbox.Group options={[
              { label: '读取记忆', value: 'read' },
              { label: '写入记忆', value: 'write' },
            ]} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={registering}>注册智能体</Button>
        </Form>
      </Card>
    </PageContainer>
  )
}

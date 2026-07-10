import { Button, Card, Form, Input, Space } from 'antd'
import type { AppConfig } from '@/api/types'

interface ConfigFormProps {
  initialValues: AppConfig
  onSubmit: (values: AppConfig) => void
}

export function ConfigForm({ initialValues, onSubmit }: ConfigFormProps) {
  const [form] = Form.useForm<AppConfig>()

  return (
    <Card bordered={false} title="系统配置">
      <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onSubmit}>
        <Form.Item label="Base URL" name="baseUrl">
          <Input placeholder="http://localhost:8000" />
        </Form.Item>
        <Form.Item label="User ID" name="userId">
          <Input placeholder="user_001" />
        </Form.Item>
        <Form.Item label="Scene ID" name="sceneId">
          <Input placeholder="chat" />
        </Form.Item>
        <Form.Item label="Agent ID" name="agentId">
          <Input placeholder="agent_abc" />
        </Form.Item>
        <Form.Item label="API Key" name="apiKey">
          <Input placeholder="mem_xxxx" />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            保存配置
          </Button>
        </Space>
      </Form>
    </Card>
  )
}

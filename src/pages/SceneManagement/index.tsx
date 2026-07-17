import { useState } from 'react'
import { Alert, Button, Card, Descriptions, Form, Input } from 'antd'
import { createScene } from '@/api/modules/scene'
import type { SceneCreatePayload } from '@/api/types'
import { PageContainer } from '@/components/common'
import { useAppStore } from '@/store'
import { normalizeAppConfig } from '@/utils/config'
import { showErrorMessage, showSuccessMessage } from '@/utils/feedback'

export default function SceneManagementPage() {
  const appConfig = useAppStore((state) => state.config)
  const setConfig = useAppStore((state) => state.setConfig)
  const [creating, setCreating] = useState(false)
  const [form] = Form.useForm<SceneCreatePayload>()

  const handleCreate = async (values: SceneCreatePayload) => {
    setCreating(true)
    try {
      const result = await createScene(values)
      if (result.scene_id) {
        setConfig(normalizeAppConfig({ ...appConfig, sceneId: result.scene_id }))
      }
      form.resetFields()
      showSuccessMessage(result.scene_id ? `场景已创建并启用：${result.scene_id}` : '场景创建成功。')
    } catch (error) {
      showErrorMessage(error, '场景创建失败')
    } finally {
      setCreating(false)
    }
  }

  return (
    <PageContainer
      title="场景标识配置"
      description="使用 Scene ID 隔离不同业务场景中的智能体、任务和记忆数据。"
    >
      <Alert
        type="info"
        showIcon
        title="场景用于数据隔离"
        description="生产线、客服、物流等不同业务建议分别创建场景，后续写入和检索都会携带对应 Scene ID。"
      />
      <Card variant="borderless" title="当前启用场景">
        <Descriptions column={1}>
          <Descriptions.Item label="Scene ID">{appConfig.sceneId || '尚未配置'}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card variant="borderless" title="创建业务场景">
        <Form<SceneCreatePayload> form={form} layout="vertical" onFinish={(values) => void handleCreate(values)}>
          <Form.Item name="scene_name" label="场景名称" rules={[{ required: true, whitespace: true }]}>
            <Input placeholder="例如：生产线异常处理" />
          </Form.Item>
          <Form.Item name="description" label="场景说明">
            <Input.TextArea rows={4} placeholder="说明该场景中的智能体和记忆用途" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={creating}>创建并启用场景</Button>
        </Form>
      </Card>
    </PageContainer>
  )
}

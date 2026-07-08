import { Card, Space, Typography } from 'antd'
import type { MemoryItem } from '@/api/types'
import { StatusTag } from '@/components/common'

export function MemoryCard({ memory }: { memory: MemoryItem }) {
  return (
    <Card bordered={false}>
      <Space direction="vertical" size={8} style={{ display: 'flex' }}>
        <Space wrap>
          <StatusTag value={memory.memory_type ?? 'unknown'} />
          {memory.scene_id ? (
            <Typography.Text type="secondary">scene: {memory.scene_id}</Typography.Text>
          ) : null}
        </Space>
        <Typography.Paragraph style={{ margin: 0 }}>{memory.content}</Typography.Paragraph>
        {memory.created_at ? (
          <Typography.Text type="secondary">{memory.created_at}</Typography.Text>
        ) : null}
      </Space>
    </Card>
  )
}

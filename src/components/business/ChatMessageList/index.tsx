import { Card, List, Typography } from 'antd'
import type { ChatMessage } from '@/api/types'

export function ChatMessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <Card bordered={false} title="消息记录">
      <List
        dataSource={messages}
        locale={{ emptyText: '暂无消息，先发送一条试试看。' }}
        renderItem={(message) => (
          <List.Item>
            <List.Item.Meta
              title={<Typography.Text strong>{message.role}</Typography.Text>}
              description={message.content}
            />
          </List.Item>
        )}
      />
    </Card>
  )
}

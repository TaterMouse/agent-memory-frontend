import { Card, Empty, Flex, Typography } from 'antd'
import type { ChatMessage } from '@/api/types'

export function ChatMessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <Card variant="borderless" title="消息记录">
      {messages.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无消息，先发送一条试试看。" />
      ) : (
        <Flex vertical gap={0}>
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              style={{ padding: '12px 0', borderBottom: '1px solid rgba(5, 5, 5, 0.06)' }}
            >
              <Typography.Text strong>{message.role}</Typography.Text>
              <Typography.Paragraph style={{ margin: '4px 0 0' }}>
                {message.content}
              </Typography.Paragraph>
            </div>
          ))}
        </Flex>
      )}
    </Card>
  )
}

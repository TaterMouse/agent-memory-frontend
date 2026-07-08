import { useState } from 'react'
import { Button, Card, Space, message } from 'antd'
import type { ChatMessage } from '../../api/types'
import { ChatInputPanel } from '../../components/business/ChatInputPanel'
import { ChatMessageList } from '../../components/business/ChatMessageList'
import { PageContainer } from '../../components/common/PageContainer'
import { mockMessages } from '../../mock/chat.mock'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (!inputValue.trim()) {
      message.warning('请先输入内容')
      return
    }

    setMessages((current) => [
      ...current,
      { role: 'user', content: inputValue },
      { role: 'assistant', content: '这里预留给真实 AI 回复与记忆写入逻辑。' },
    ])
    setInputValue('')
  }

  return (
    <PageContainer
      title="聊天页"
      description="这里是最核心的业务链路页面，后续由聊天主流程负责人继续接会话、记忆检索和写入。"
      extra={
        <Space>
          <Button>创建会话</Button>
          <Button danger>关闭会话</Button>
        </Space>
      }
    >
      <Card bordered={false}>
        <Space direction="vertical" size={16} style={{ display: 'flex' }}>
          <ChatMessageList messages={messages} />
          <ChatInputPanel
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
          />
        </Space>
      </Card>
    </PageContainer>
  )
}

import { useState } from 'react'
import { Button, Space, Tag } from 'antd'
import type { ChatMessage } from '@/api/types'
import { ChatInputPanel } from '@/components/business/ChatInputPanel'
import { ChatMessageList } from '@/components/business/ChatMessageList'
import { PageContainer, PageSection } from '@/components/common'
import { createSession, closeSession } from '@/api/modules/session'
import { useAppStore } from '@/store'
import { useSessionStore } from '@/store/sessionStore'
import { mockMessages } from '@/mock/chat.mock'
import { showSuccessMessage, showWarningMessage, showErrorMessage } from '@/utils/feedback'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)

  const { config } = useAppStore()
  const { sessionId, status, setSession } = useSessionStore()

  const handleCreateSession = async () => {
    try {
      const session = await createSession({
        user_id: config.userId,
        agent_id: config.agentId || 'default_agent',
      })
      setSession(session.session_id, session.status)
      showSuccessMessage('会话创建成功')
    } catch (error) {
      showErrorMessage(error, '创建会话失败')
    }
  }

  const handleCloseSession = async () => {
    if (!sessionId) {
      showWarningMessage('当前没有活跃的会话')
      return
    }
    try {
      await closeSession(sessionId)
      setSession('', 'idle')
      showSuccessMessage('会话已关闭')
    } catch (error) {
      showErrorMessage(error, '关闭会话失败')
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim()) {
      showWarningMessage('请先输入内容。')
      return
    }

    if (!sessionId) {
      showWarningMessage('请先创建会话')
      return
    }

    const userContent = inputValue
    setInputValue('')
    setSending(true)

    // 先把用户消息加到列表
    setMessages((current) => [
      ...current,
      { role: 'user', content: userContent },
    ])

    // 模拟 AI 回复（后续接入真实大模型接口）
    setTimeout(() => {
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: 'AI 回复待接入 — 后续将调用大模型接口。' },
      ])
      setSending(false)
    }, 800)
  }

  return (
    <PageContainer
      title="聊天页"
      description="这里是聊天主流程的落点。A 已经把页面容器、输入区和消息区接好，后续由 B 继续联通会话、模型回复和记忆写入。"
      extra={
        <Space>
          {sessionId ? (
            <Tag color="blue">会话: {sessionId.slice(0, 8)}... ({status})</Tag>
          ) : (
            <Tag>未连接</Tag>
          )}
          <Button onClick={handleCreateSession} disabled={!!sessionId}>
            创建会话
          </Button>
          <Button danger onClick={handleCloseSession} disabled={!sessionId}>
            关闭会话
          </Button>
        </Space>
      }
    >
      <PageSection>
        <Space direction="vertical" size={16} style={{ display: 'flex' }}>
          <ChatMessageList messages={messages} />
          <ChatInputPanel value={inputValue} onChange={setInputValue} onSend={handleSend} loading={sending} />
        </Space>
      </PageSection>
    </PageContainer>
  )
}
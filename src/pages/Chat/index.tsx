import { useState } from 'react'
import { Alert, Button, Space, Tag, Typography } from 'antd'
import type { ChatMessage } from '@/api/types'
import { ChatInputPanel } from '@/components/business/ChatInputPanel'
import { ChatMessageList } from '@/components/business/ChatMessageList'
import { PageContainer, PageSection } from '@/components/common'
import { createSession, closeSession } from '@/api/modules/session'
import { getMemoryContext, writeMemories } from '@/api/modules/memory'
import { useAppStore } from '@/store'
import { useSessionStore } from '@/store/sessionStore'
import { useTaskStore } from '@/store/taskStore'
import { showSuccessMessage, showWarningMessage, showErrorMessage } from '@/utils/feedback'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const [memoryContext, setMemoryContext] = useState('')
  const [memoryCount, setMemoryCount] = useState(0)

  const { config } = useAppStore()
  const { sessionId, status, setSession } = useSessionStore()
  const activeTaskId = useTaskStore((state) => state.activeTaskId)

  const handleCreateSession = async () => {
    try {
      const session = await createSession({
        user_id: config.userId,
        agent_id: config.agentId || 'default_agent',
        scene_id: config.sceneId || undefined,
        task_id: activeTaskId || undefined,
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

    let formattedContext = ''
    let retrievedMemoryCount = 0
    try {
      const memoryResult = await getMemoryContext({
        query: userContent,
        user_id: config.userId,
        scene_id: config.sceneId || undefined,
        task_id: activeTaskId || undefined,
        max_tokens: 3000,
        group_by_type: true,
      })
      formattedContext = memoryResult.formatted_text
      retrievedMemoryCount = memoryResult.memory_count
      setMemoryContext(memoryResult.formatted_text)
      setMemoryCount(memoryResult.memory_count)
    } catch {
      setMemoryContext('')
      setMemoryCount(0)
      showWarningMessage('历史记忆检索失败，本轮将不使用记忆上下文')
    }

    const userMessage: ChatMessage = { role: 'user', content: userContent }
    setMessages((current) => [
      ...current,
      userMessage,
    ])

    await new Promise((resolve) => setTimeout(resolve, 800))
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: formattedContext
        ? `已读取 ${retrievedMemoryCount} 条历史记忆。真实大模型回复接口待后端提供。`
        : '本轮未获取到历史记忆。真实大模型回复接口待后端提供。',
    }
    setMessages((current) => [...current, assistantMessage])

    try {
      await writeMemories({
        user_id: config.userId,
        scene_id: config.sceneId || undefined,
        task_id: activeTaskId || undefined,
        session_id: sessionId,
        messages: [userMessage, assistantMessage],
      })
    } catch {
      showWarningMessage('记忆写入失败，但消息已发送')
    }

    setSending(false)
  }

  return (
    <PageContainer
      title="智能对话"
      description="创建业务会话后发送消息，系统会检索相关历史记忆，并把本轮对话写回长期记忆。"
      extra={
        <Space>
          {sessionId ? (
            <Tag color="blue">会话: {sessionId.slice(0, 8)}... ({status})</Tag>
          ) : (
            <Tag>未连接</Tag>
          )}
          {activeTaskId ? <Tag color="gold">任务: {activeTaskId.slice(0, 8)}...</Tag> : null}
          <Button onClick={handleCreateSession} disabled={!!sessionId}>
            创建会话
          </Button>
          <Button danger onClick={handleCloseSession} disabled={!sessionId}>
            关闭会话
          </Button>
        </Space>
      }
    >
      <Alert
        type="warning"
        showIcon
        title="当前使用演示助手回复"
        description="会话、记忆检索和记忆写入已接真实后端；大模型对话接口尚未在接口文档中提供。"
      />
      <PageSection>
        <Space orientation="vertical" size={16} style={{ display: 'flex' }}>
          <ChatMessageList messages={messages} />
          <ChatInputPanel value={inputValue} onChange={setInputValue} onSend={handleSend} loading={sending} />
        </Space>
      </PageSection>
      {memoryContext ? (
        <PageSection title={`本轮记忆上下文（${memoryCount} 条）`}>
          <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }} copyable>
            {memoryContext}
          </Typography.Paragraph>
        </PageSection>
      ) : null}
    </PageContainer>
  )
}

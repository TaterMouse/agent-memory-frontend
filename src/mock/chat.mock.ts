import type { ChatMessage } from '../api/types'

export const mockMessages: ChatMessage[] = [
  { role: 'system', content: '这是聊天主流程的占位消息。' },
  { role: 'assistant', content: '后续可以在这里接入真实的大模型回复接口。' },
]

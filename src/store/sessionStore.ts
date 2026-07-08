import { create } from 'zustand'
import type { ChatMessage } from '../api/types'

interface SessionStoreState {
  sessionId: string
  status: string
  messages: ChatMessage[]
  setSession: (sessionId: string, status: string) => void
  setMessages: (messages: ChatMessage[]) => void
}

export const useSessionStore = create<SessionStoreState>((set) => ({
  sessionId: '',
  status: 'idle',
  messages: [],
  setSession: (sessionId, status) => set({ sessionId, status }),
  setMessages: (messages) => set({ messages }),
}))

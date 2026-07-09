export interface ApiResponse<T> {
  code: number
  message?: string
  data: T
  error_code?: string
  trace_id?: string
}

export interface AppConfig {
  baseUrl: string
  userId: string
  sceneId: string
  agentId: string
  apiKey: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AgentRegisterPayload {
  agent_name: string
  scene_id: string
  permissions: string[]
}

export interface AgentRegisterResult {
  agent_id: string
  api_key: string
  api_key_prefix: string
}

export interface SessionCreatePayload {
  user_id: string
  agent_id: string
  scene_id?: string
  task_id?: string
}

export interface SessionInfo {
  session_id: string
  status: string
}

export interface MemoryContextPayload {
  query: string
  user_id: string
  scene_id?: string
  task_id?: string
  max_tokens?: number
  group_by_type?: boolean
}

export interface MemoryContextResult {
  formatted_text: string
  memory_count: number
}

export interface MemoryWritePayload {
  user_id: string
  scene_id?: string
  task_id?: string
  session_id?: string
  messages: ChatMessage[]
}

export interface MemoryWriteItem {
  id: string
  memory: string
  event: 'ADD' | 'SKIP' | 'MERGE'
}

export interface MemoryWriteResult {
  results: MemoryWriteItem[]
}

export interface MemorySearchPayload {
  query: string
  user_id: string
  scene_id?: string
  task_id?: string
  memory_types?: string[]
  top_k?: number
  rerank?: boolean
}

export interface MemoryItem {
  memory_id: string
  content: string
  memory_type?: string
  scene_id?: string
  task_id?: string
  relevance_score?: number
  created_at?: string
}

export interface MemorySearchResult {
  query: string
  results: MemoryItem[]
  total_candidates: number
  elapsed_ms: number
}

export interface TaskCreatePayload {
  user_id: string
  title: string
  goal: string
  scene_id?: string
}

export interface TaskInfo {
  task_id: string
  status: string
}

export interface TaskProgressResult {
  task_id: string
  status: string
  completed_count: number
  pending_count: number
  related_memory_count: number
}

export function unwrapApiResponse<T>(payload: ApiResponse<T>) {
  if (payload.code !== 0) {
    throw new Error(payload.message || '接口请求失败')
  }

  return payload.data
}

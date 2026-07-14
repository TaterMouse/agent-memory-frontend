import { ApiError } from '@/api/errors'

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

export type AgentRotateKeyResult = AgentRegisterResult

export interface SceneCreatePayload {
  scene_name: string
  description?: string
}

export interface SceneCreateResult {
  scene_id?: string
  scene_name?: string
  description?: string
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
  time_start?: string
  time_end?: string
}

export interface MemoryItem {
  memory_id: string
  content: string
  memory_type?: string
  scene_id?: string
  task_id?: string
  relevance_score?: number
  created_at?: string
  updated_at?: string
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
  status: TaskStatus
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export interface TaskProgressResult {
  task_id: string
  status: TaskStatus
  completed_count: number
  pending_count: number
  related_memory_count: number
}

export interface MemoryImportRecord {
  content: string
  role?: ChatMessage['role']
  scene_id?: string
  task_id?: string
}

export interface TaskProgressUpdatePayload {
  status?: TaskStatus
  progress?: string
  completed_items?: string[]
  pending_items?: string[]
}

export function unwrapApiResponse<T>(payload: unknown) {
  if (typeof payload !== 'object' || payload === null || !('code' in payload)) {
    throw new ApiError('接口响应格式不正确', { errorCode: 'INVALID_RESPONSE' })
  }

  const response = payload as Partial<ApiResponse<T>>

  if (typeof response.code !== 'number') {
    throw new ApiError('接口响应格式不正确', { errorCode: 'INVALID_RESPONSE' })
  }

  if (response.code !== 0) {
    throw new ApiError(response.message || '接口请求失败', {
      code: response.code,
      errorCode: response.error_code,
      traceId: response.trace_id,
    })
  }

  if (!('data' in response)) {
    throw new ApiError('接口响应缺少 data 字段', { errorCode: 'INVALID_RESPONSE' })
  }

  return response.data as T
}

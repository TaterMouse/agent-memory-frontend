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

export interface HealthResult {
  status?: string
  app?: string
  version?: string
}

export interface AdminPageResult<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface AdminApiLogItem {
  log_id: string
  agent_id?: string | null
  api_path: string
  method: string
  response_code: number
  error_code?: string | null
  elapsed_ms?: number | null
  created_at: string
  trace_id?: string | null
}

export interface AdminRetrievalLogItem {
  request_id: string
  agent_id?: string | null
  user_id?: string | null
  query_text?: string | null
  top_k?: number | null
  elapsed_ms?: number | null
  result_count?: number | null
  status?: string | null
  created_at: string
  trace_id?: string | null
}

export interface AdminApiLogParams {
  apiPath?: string
  errorCode?: string
  hours?: number
  page?: number
  pageSize?: number
}

export interface AdminRetrievalLogParams {
  agentId?: string
  hours?: number
  page?: number
  pageSize?: number
}

export interface DialogueMessage {
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

export interface MemoryContextPayload {
  query: string
  user_id: string
  scene_id?: string
  task_id?: string
  session_id?: string
  max_tokens?: number
  group_by_type?: boolean
  top_k?: number
  max_content_length?: number
  memory_types?: string[]
  status?: string[]
  include_preferences?: boolean
  include_facts?: boolean
  include_task_state?: boolean
}

export interface MemoryContextResult {
  formatted_text: string
  memory_count: number
  estimated_tokens?: number
  fragments?: Array<Record<string, unknown>>
}

export interface MemoryWritePayload {
  user_id: string
  scene_id?: string
  task_id?: string
  session_id?: string
  interaction_type?: 'dialogue' | 'session' | 'task_process'
  messages?: DialogueMessage[]
  session_time?: string
  session_source?: string
  session_summary?: string
  task_goal?: string
  task_progress?: string
  task_result?: string
  metadata?: Record<string, unknown>
}

export interface MemoryWriteItem {
  id: string
  memory: string
  event: 'ADD' | 'SKIP' | 'MERGE'
}

export interface MemoryWriteResult {
  results: MemoryWriteItem[]
}

export type MemoryExtractionType =
  | 'key_fact'
  | 'task_state'
  | 'decision'
  | 'preference'
  | 'process'
  | 'feedback'

export interface MemoryGenerationPayload {
  text: string
  user_id: string
  agent_id?: string
  scene_id?: string
  session_id?: string
  task_id?: string
  extraction_types?: MemoryExtractionType[]
  source_record_ids?: string[]
  metadata?: Record<string, unknown>
}

export interface MemoryBatchGenerationPayload {
  texts: string[]
  user_id: string
  agent_id?: string
  scene_id?: string
  session_id?: string
  task_id?: string
  extraction_types?: MemoryExtractionType[]
}

export interface MemoryGenerationDetail {
  action: string
  memory_id?: string
  content_preview?: string
  memory_type?: string
  importance?: number
  confidence?: number
  message?: string
}

export interface MemoryGenerationResult {
  memory_ids: string[]
  new_count: number
  merged_count: number
  discarded_count: number
  updated_count: number
  conflict_count: number
  details: MemoryGenerationDetail[]
}

export interface MemoryBatchGenerationResult {
  results: MemoryGenerationResult[]
  total_memories: number
  total_new: number
  total_merged: number
  total_discarded: number
}

export interface MemoryAsyncGenerationSubmitResult {
  request_id: string
  status: 'accepted'
  message?: string
}

export type MemoryAsyncGenerationStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'not_found'

export interface MemoryAsyncGenerationStatusResult {
  request_id: string
  status: MemoryAsyncGenerationStatus
  progress?: number
  result?: MemoryGenerationResult | null
  error?: string | null
  message?: string
}

export interface MemorySearchPayload {
  query: string
  user_id: string
  scene_id?: string
  task_id?: string
  session_id?: string
  memory_types?: string[]
  status?: string[]
  top_k?: number
  max_content_length?: number
  rerank?: boolean
  time_start?: string
  time_end?: string
}

export interface MemoryItem {
  memory_id: string
  content: string
  memory_type?: string
  status?: string
  scene_id?: string
  task_id?: string
  session_id?: string
  summary?: string
  key_points?: string[]
  tags?: string[]
  entities?: string[]
  importance?: number
  confidence?: number
  agent_id?: string
  source_type?: string
  version?: number
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

export interface MemoryListResult {
  items: MemoryItem[]
  total: number
  page: number
  page_size: number
}

export type MemoryLevel = 'user' | 'session' | 'task' | 'agent'

export interface MemoryLevelDistributionItem {
  level: MemoryLevel
  count: number
  ratio: number
}

export interface MemoryStatsResult {
  total: number
  level_distribution: MemoryLevelDistributionItem[]
  generated_at: string
  classification_version?: string
}

export interface MemoryListParams {
  userId: string
  sceneId?: string
  taskId?: string
  page?: number
  pageSize?: number
}

export interface MemoryUpdatePayload {
  memory_id: string
  content?: string
  summary?: string
  status?: string
  importance?: number
  confidence?: number
  tags?: string[]
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
  role?: DialogueMessage['role']
  scene_id?: string
  task_id?: string
  session_time?: string
  session_source?: string
  session_summary?: string
  task_goal?: string
  task_progress?: string
  task_result?: string
}

export interface TaskProgressUpdatePayload {
  status?: TaskStatus
  progress?: string
  completed_items?: string[]
  pending_items?: string[]
}

export interface AdminStatsResult {
  total_memories: number
  total_users: number
  total_agents: number
  total_sessions: number
}

export interface DashboardSummary {
  agent_count?: number | null
  scene_count?: number | null
  memory_count?: number | null
  retrieval_count?: number | null
  context_success_rate?: number | null
}

export interface DashboardComparison {
  agent_count_rate?: number | null
  scene_count_rate?: number | null
  memory_count_rate?: number | null
  retrieval_count_rate?: number | null
  context_success_rate_change?: number | null
}

export interface DashboardGenerationSummary {
  generated_count?: number | null
  merged_count?: number | null
  updated_count?: number | null
  discarded_count?: number | null
  conflict_count?: number | null
}

export interface DashboardMemoryTrendItem {
  date: string
  total: number
  added?: number | null
}

export interface DashboardMemoryTypeItem {
  memory_type: string
  count: number
  ratio: number
}

export interface DashboardRetrievalSignalItem {
  signal: string
  count: number
  ratio: number
}

export interface DashboardRecentAgent {
  agent_id?: string
  scene_id?: string
  scene_name?: string
  status?: string
  last_write_at?: string
  latest_result?: string
}

export interface DashboardRecentRetrieval {
  retrieval_id?: string
  memory_type?: string
  content?: string
  summary?: string
  relevance_score?: number | null
  created_at?: string
  occurred_at?: string
}

export interface DashboardRecentAlert {
  message?: string
  error_code?: string
  trace_id?: string
  occurred_at?: string
}

export interface DashboardRecentTask {
  task_id?: string
  title?: string
  status?: string
  created_at?: string
  updated_at?: string
}

export interface DashboardResult {
  summary?: DashboardSummary
  comparison?: DashboardComparison
  generation_summary?: DashboardGenerationSummary
  memory_trend?: DashboardMemoryTrendItem[]
  memory_type_distribution?: DashboardMemoryTypeItem[]
  retrieval_signal_distribution?: DashboardRetrievalSignalItem[]
  recent_agents?: DashboardRecentAgent[]
  recent_retrievals?: DashboardRecentRetrieval[]
  recent_alerts?: DashboardRecentAlert[]
  recent_tasks?: DashboardRecentTask[]
  latest_context?: Record<string, unknown> | null
  generated_at?: string
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

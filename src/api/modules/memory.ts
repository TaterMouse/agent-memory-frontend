import { request } from '@/api/request'
import { isAxiosError } from 'axios'
import type {
  MemoryContextPayload,
  MemoryContextResult,
  MemoryBatchGenerationPayload,
  MemoryBatchGenerationResult,
  MemoryGenerationPayload,
  MemoryGenerationResult,
  MemoryAsyncGenerationStatusResult,
  MemoryAsyncGenerationSubmitResult,
  MemoryItem,
  MemoryListParams,
  MemoryListResult,
  MemoryStatsResult,
  MemorySearchPayload,
  MemorySearchResult,
  MemoryUpdatePayload,
  MemoryWritePayload,
  MemoryWriteResult,
} from '@/api/types'

export function getMemoryContext(payload: MemoryContextPayload) {
  return request<MemoryContextResult>({
    url: '/api/v1/memory/context',
    method: 'POST',
    data: payload,
  })
}

export function searchMemories(payload: MemorySearchPayload) {
  return request<MemorySearchResult>({
    url: '/api/v1/memory/search',
    method: 'POST',
    data: payload,
  })
}

export function writeMemories(payload: MemoryWritePayload) {
  return request<MemoryWriteResult>({
    url: '/api/v1/memory/write',
    method: 'POST',
    data: payload,
  })
}

export function generateMemories(payload: MemoryGenerationPayload) {
  return request<MemoryGenerationResult>({
    url: '/api/v1/memory/generate',
    method: 'POST',
    data: payload,
  })
}

export function generateMemoriesBatch(payload: MemoryBatchGenerationPayload) {
  return request<MemoryBatchGenerationResult>({
    url: '/api/v1/memory/generate/batch',
    method: 'POST',
    data: payload,
  })
}

export function generateMemoriesAsync(payload: MemoryGenerationPayload) {
  return request<MemoryAsyncGenerationSubmitResult>({
    url: '/api/v1/memory/generate/async',
    method: 'POST',
    data: payload,
    timeout: 30000,
  })
}

export function getMemoryGenerationStatus(requestId: string) {
  return request<MemoryAsyncGenerationStatusResult>({
    url: `/api/v1/memory/generate/${encodeURIComponent(requestId)}/status`,
    method: 'GET',
    timeout: 30000,
  })
}

export async function listMemories({
  userId,
  sceneId,
  taskId,
  sessionId,
  memoryScope,
  page = 1,
  pageSize = 20,
}: MemoryListParams) {
  const searchParams = new URLSearchParams({
    user_id: userId,
    page: String(page),
    page_size: String(pageSize),
  })
  if (sceneId) searchParams.set('scene_id', sceneId)
  if (taskId) searchParams.set('task_id', taskId)
  if (sessionId) searchParams.set('session_id', sessionId)
  if (memoryScope) searchParams.set('memory_scope', memoryScope)

  const result = await request<MemoryItem[] | MemoryListResult>({
    url: `/api/v1/memory/list?${searchParams.toString()}`,
    method: 'POST',
  })

  return Array.isArray(result)
    ? { items: result, total: result.length, page, page_size: pageSize }
    : result
}

export function getMemoryStats(userId: string, sceneId?: string) {
  const searchParams = new URLSearchParams({ user_id: userId })
  if (sceneId) searchParams.set('scene_id', sceneId)

  return request<MemoryStatsResult>({
    url: `/api/v1/memory/stats?${searchParams.toString()}`,
    method: 'GET',
  })
}

export function updateMemory(payload: MemoryUpdatePayload) {
  return request<string>({
    url: '/api/v1/memory/update',
    method: 'PUT',
    data: payload,
  })
}

export async function deleteMemory(memoryId: string, reason?: string) {
  try {
    await request<unknown>({
      url: '/api/v1/memory/delete',
      method: 'DELETE',
      data: {
        memory_id: memoryId,
        reason,
      },
    })
  } catch (error) {
    if (!isAxiosError(error)) throw error

    const responseStatus = error.response?.status
    if (responseStatus !== undefined && responseStatus < 500) throw error

    // The deployed single-delete endpoint currently returns 500; status update
    // provides the same soft-delete behavior. A missing status is also handled
    // because some browsers hide a 500 response when its CORS headers are absent.
    await request<unknown>({
      url: '/api/v1/memory/update',
      method: 'PUT',
      data: {
        memory_id: memoryId,
        status: 'deleted',
      },
    })
  }
}

export function deleteAllMemories(userId: string) {
  return request<string>({
    url: `/api/v1/memory/delete-all?user_id=${encodeURIComponent(userId)}`,
    method: 'POST',
  })
}

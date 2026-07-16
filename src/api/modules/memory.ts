import { request } from '@/api/request'
import type {
  MemoryContextPayload,
  MemoryContextResult,
  MemoryItem,
  MemoryListResult,
  MemorySearchPayload,
  MemorySearchResult,
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

export async function listMemories(userId: string) {
  const result = await request<MemoryItem[] | MemoryListResult>({
    url: `/api/v1/memory/list?user_id=${encodeURIComponent(userId)}`,
    method: 'POST',
  })

  return Array.isArray(result) ? result : result.items
}

export function updateMemory(memoryId: string, content: string) {
  return request<string>({
    url: '/api/v1/memory/update',
    method: 'PUT',
    data: {
      memory_id: memoryId,
      content,
    },
  })
}

export function deleteMemory(memoryId: string, reason?: string) {
  return request<string>({
    url: '/api/v1/memory/delete',
    method: 'DELETE',
    data: {
      memory_id: memoryId,
      reason,
    },
  })
}

export function deleteAllMemories(userId: string) {
  return request<string>({
    url: `/api/v1/memory/delete-all?user_id=${encodeURIComponent(userId)}`,
    method: 'POST',
  })
}

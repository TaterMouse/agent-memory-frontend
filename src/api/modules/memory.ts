import { request } from '../request'
import type {
  MemoryItem,
  MemorySearchPayload,
  MemorySearchResult,
  MemoryWritePayload,
  MemoryWriteResult,
} from '../types'

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

export function listMemories(userId: string) {
  return request<MemoryItem[]>({
    url: `/api/v1/memory/list?user_id=${encodeURIComponent(userId)}`,
    method: 'POST',
  })
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

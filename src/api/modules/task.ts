import { request } from '@/api/request'
import type {
  TaskCreatePayload,
  TaskInfo,
  TaskProgressResult,
  TaskProgressUpdatePayload,
} from '@/api/types'

export function createTask(payload: TaskCreatePayload) {
  return request<TaskInfo>({
    url: '/api/v1/task',
    method: 'POST',
    data: payload,
  })
}

export function updateTaskProgress(taskId: string, payload: TaskProgressUpdatePayload) {
  return request<string>({
    url: `/api/v1/task/${taskId}`,
    method: 'PUT',
    data: payload,
  })
}

export function getTaskProgress(taskId: string) {
  return request<TaskProgressResult>({
    url: `/api/v1/task/${taskId}/progress`,
    method: 'GET',
  })
}

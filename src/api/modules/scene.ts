import { request } from '@/api/request'
import type { SceneCreatePayload, SceneCreateResult } from '@/api/types'

export function createScene(payload: SceneCreatePayload) {
  return request<SceneCreateResult>({
    url: '/api/v1/scene',
    method: 'POST',
    data: payload,
  })
}

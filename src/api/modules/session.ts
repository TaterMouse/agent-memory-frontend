import { request } from '@/api/request'
import type { SessionCreatePayload, SessionInfo } from '@/api/types'

export function createSession(payload: SessionCreatePayload) {
  return request<SessionInfo>({
    url: '/api/v1/session',
    method: 'POST',
    data: payload,
  })
}

export function closeSession(sessionId: string) {
  return request<string>({
    url: `/api/v1/session/${sessionId}/close`,
    method: 'POST',
  })
}

import { request } from '@/api/request'
import type { AgentRegisterPayload, AgentRegisterResult } from '@/api/types'

export function registerAgent(payload: AgentRegisterPayload) {
  return request<AgentRegisterResult>({
    url: '/api/v1/agent/register',
    method: 'POST',
    data: payload,
  })
}

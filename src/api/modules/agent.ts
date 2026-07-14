import { request } from '@/api/request'
import type {
  AgentRegisterPayload,
  AgentRegisterResult,
  AgentRotateKeyResult,
} from '@/api/types'

export function registerAgent(payload: AgentRegisterPayload) {
  return request<AgentRegisterResult>({
    url: '/api/v1/agent/register',
    method: 'POST',
    data: payload,
  })
}

export function rotateAgentKey(agentId: string) {
  return request<AgentRotateKeyResult>({
    url: `/api/v1/agent/${encodeURIComponent(agentId)}/rotate-key`,
    method: 'POST',
  })
}

import type { AxiosRequestConfig } from 'axios'
import { apiClient } from '@/api/client'
import type { AppConfig } from '@/api/types'
import { unwrapApiResponse } from '@/api/types'
import { getErrorMessage } from '@/utils/error'

export type EndpointInspectionStatus = 'available' | 'unavailable' | 'manual' | 'pending'

export interface EndpointInspection {
  key: string
  name: string
  path: string
  status: EndpointInspectionStatus
  latencyMs?: number
  checkedAt?: string
  message: string
}

export interface HealthInspection {
  status: 'healthy' | 'unavailable'
  app?: string
  version?: string
  latencyMs: number
  message: string
}

export interface MonitoringInspection {
  checkedAt: string
  health: HealthInspection
  endpoints: EndpointInspection[]
}

interface HealthResult {
  status?: string
  app?: string
  version?: string
}

interface SafeEndpointDefinition {
  key: string
  name: string
  path: string
  buildRequest: (config: AppConfig) => AxiosRequestConfig
}

const endpointDefinitions: SafeEndpointDefinition[] = [
  {
    key: 'memory-search',
    name: '记忆检索',
    path: '/api/v1/memory/search',
    buildRequest: (config) => ({
      url: '/api/v1/memory/search',
      method: 'POST',
      data: {
        query: 'frontend_health_check',
        user_id: config.userId,
        scene_id: config.sceneId || undefined,
        top_k: 1,
        max_content_length: 120,
      },
    }),
  },
  {
    key: 'memory-list',
    name: '记忆列表',
    path: '/api/v1/memory/list',
    buildRequest: (config) => ({
      url: `/api/v1/memory/list?${new URLSearchParams({
        user_id: config.userId,
        page: '1',
        page_size: '1',
      }).toString()}`,
      method: 'POST',
    }),
  },
  {
    key: 'memory-context',
    name: '上下文返回',
    path: '/api/v1/memory/context',
    buildRequest: (config) => ({
      url: '/api/v1/memory/context',
      method: 'POST',
      data: {
        query: 'frontend_health_check',
        user_id: config.userId,
        scene_id: config.sceneId || undefined,
        top_k: 1,
        max_content_length: 120,
      },
    }),
  },
]

const manualEndpointDefinitions = [
  {
    key: 'memory-write',
    name: '记忆写入',
    path: '/api/v1/memory/write',
    message: '写入会产生真实记忆，请通过数据导入页面手动验证',
  },
  {
    key: 'scene-create',
    name: '场景创建',
    path: '/api/v1/scene',
    message: '创建会产生真实场景，请通过场景管理页面手动验证',
  },
]

export function getDefaultEndpointInspections(): EndpointInspection[] {
  return [
    ...endpointDefinitions.map(({ key, name, path }) => ({
      key,
      name,
      path,
      status: 'pending' as const,
      message: '等待开始巡检',
    })),
    ...manualEndpointDefinitions.map(({ key, name, path, message }) => ({
      key,
      name,
      path,
      status: 'manual' as const,
      message,
    })),
  ]
}

async function inspectHealth(): Promise<HealthInspection> {
  const startedAt = performance.now()

  try {
    const response = await apiClient.get<HealthResult>('/health')
    const latencyMs = Math.round(performance.now() - startedAt)

    if (response.data.status !== 'ok') {
      return {
        status: 'unavailable',
        app: response.data.app,
        version: response.data.version,
        latencyMs,
        message: `服务返回状态：${response.data.status || '未知'}`,
      }
    }

    return {
      status: 'healthy',
      app: response.data.app,
      version: response.data.version,
      latencyMs,
      message: '后端服务连接正常',
    }
  } catch (error) {
    return {
      status: 'unavailable',
      latencyMs: Math.round(performance.now() - startedAt),
      message: getErrorMessage(error, '健康检查请求失败'),
    }
  }
}

async function inspectEndpoint(
  definition: SafeEndpointDefinition,
  config: AppConfig,
  checkedAt: string,
): Promise<EndpointInspection> {
  const startedAt = performance.now()

  try {
    const response = await apiClient.request<unknown>(definition.buildRequest(config))
    unwrapApiResponse<unknown>(response.data)

    return {
      key: definition.key,
      name: definition.name,
      path: definition.path,
      status: 'available',
      latencyMs: Math.round(performance.now() - startedAt),
      checkedAt,
      message: '接口响应及业务状态正常',
    }
  } catch (error) {
    return {
      key: definition.key,
      name: definition.name,
      path: definition.path,
      status: 'unavailable',
      latencyMs: Math.round(performance.now() - startedAt),
      checkedAt,
      message: getErrorMessage(error, '接口巡检失败'),
    }
  }
}

export async function runMonitoringInspection(config: AppConfig): Promise<MonitoringInspection> {
  const checkedAt = new Date().toISOString()
  const [health, safeEndpoints] = await Promise.all([
    inspectHealth(),
    Promise.all(endpointDefinitions.map((definition) => inspectEndpoint(definition, config, checkedAt))),
  ])

  return {
    checkedAt,
    health,
    endpoints: [
      ...safeEndpoints,
      ...manualEndpointDefinitions.map(({ key, name, path, message }) => ({
        key,
        name,
        path,
        status: 'manual' as const,
        checkedAt,
        message,
      })),
    ],
  }
}

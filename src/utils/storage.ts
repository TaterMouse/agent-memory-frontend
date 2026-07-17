import type { AppConfig } from '@/api/types'
import { storageKeys } from '@/constants/storage'
import { normalizeAppConfig } from '@/utils/config'
import type { MonitoringInspection } from '@/utils/monitoring'

const defaultConfig: AppConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  userId: 'user_001',
  sceneId: 'memory-console',
  agentId: '',
  apiKey: '',
}

export function getStoredAppConfig(): AppConfig {
  const rawValue = localStorage.getItem(storageKeys.appConfig)
  if (!rawValue) {
    return defaultConfig
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue)
    if (typeof parsedValue !== 'object' || parsedValue === null) {
      return defaultConfig
    }

    return normalizeAppConfig({
      ...defaultConfig,
      ...parsedValue,
    })
  } catch {
    return defaultConfig
  }
}

export function saveAppConfig(config: AppConfig) {
  localStorage.setItem(storageKeys.appConfig, JSON.stringify(normalizeAppConfig(config)))
}

export function getStoredMonitoringInspection(): MonitoringInspection | null {
  const rawValue = localStorage.getItem(storageKeys.monitoringInspection)
  if (!rawValue) return null

  try {
    const parsedValue: unknown = JSON.parse(rawValue)
    if (
      typeof parsedValue !== 'object'
      || parsedValue === null
      || !('checkedAt' in parsedValue)
      || !('health' in parsedValue)
      || !('endpoints' in parsedValue)
      || !Array.isArray(parsedValue.endpoints)
    ) {
      return null
    }

    return parsedValue as MonitoringInspection
  } catch {
    return null
  }
}

export function saveMonitoringInspection(inspection: MonitoringInspection) {
  localStorage.setItem(storageKeys.monitoringInspection, JSON.stringify(inspection))
}

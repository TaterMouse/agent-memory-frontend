import type { AppConfig } from '../api/types'
import { storageKeys } from '../constants/storage'

const defaultConfig: AppConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  userId: 'user_001',
  sceneId: 'chat',
  agentId: '',
  apiKey: '',
}

export function getStoredAppConfig(): AppConfig {
  const rawValue = localStorage.getItem(storageKeys.appConfig)
  if (!rawValue) {
    return defaultConfig
  }

  try {
    return {
      ...defaultConfig,
      ...JSON.parse(rawValue),
    }
  } catch {
    return defaultConfig
  }
}

export function saveAppConfig(config: AppConfig) {
  localStorage.setItem(storageKeys.appConfig, JSON.stringify(config))
}

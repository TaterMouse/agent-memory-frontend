import axios from 'axios'
import { normalizeBaseUrl } from '@/utils/config'
import { getStoredAppConfig } from '@/utils/storage'

export const defaultBaseUrl =
  normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || 'http://localhost:8000'

const configuredTimeout = Number(import.meta.env.VITE_API_TIMEOUT_MS)
export const apiTimeout =
  Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 10000

export const apiClient = axios.create({
  baseURL: defaultBaseUrl,
  timeout: apiTimeout,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const appConfig = getStoredAppConfig()
  const apiKey = appConfig.apiKey

  config.baseURL = normalizeBaseUrl(appConfig.baseUrl) || defaultBaseUrl

  if (apiKey) {
    config.headers.set('X-API-Key', apiKey)
  } else {
    config.headers.delete('X-API-Key')
  }

  return config
})

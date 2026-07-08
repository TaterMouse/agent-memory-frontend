import axios from 'axios'
import { getStoredAppConfig } from '../utils/storage'

const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: defaultBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const appConfig = getStoredAppConfig()
  const apiKey = appConfig.apiKey.trim()

  config.baseURL = appConfig.baseUrl || defaultBaseUrl

  if (apiKey) {
    config.headers['X-API-Key'] = apiKey
  }

  return config
})

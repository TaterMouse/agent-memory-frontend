import type { AxiosRequestConfig } from 'axios'
import { apiClient } from './client'
import { unwrapApiResponse } from './types'

export async function request<T>(config: AxiosRequestConfig) {
  const response = await apiClient.request(config)
  return unwrapApiResponse<T>(response.data)
}

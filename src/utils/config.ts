import type { AppConfig } from '@/api/types'
// 校验函数，校验必需的字段是否符合保存规范，若不符合就输出提示信息
export function validateRequiredAppConfig(config: AppConfig) {
  if (!config.baseUrl?.trim()) return '请先配置后端 Base URL'
  if (!config.userId?.trim()) return '请先配置 User ID'
  if (!config.sceneId?.trim()) return '请先配置 Scene ID'
  return null
}

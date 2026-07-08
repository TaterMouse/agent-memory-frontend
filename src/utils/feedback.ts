import { message } from 'antd'
import { getErrorMessage } from '@/utils/error'

const defaultDuration = 2

export function showSuccessMessage(content: string) {
  message.success({ content, duration: defaultDuration })
}

export function showWarningMessage(content: string) {
  message.warning({ content, duration: defaultDuration })
}

export function showErrorMessage(error: unknown, fallback = '操作失败，请稍后重试。') {
  message.error({
    content: getErrorMessage(error, fallback),
    duration: 3,
  })
}

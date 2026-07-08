import { Tag } from 'antd'

const colorMap: Record<string, string> = {
  active: 'processing',
  pending: 'default',
  in_progress: 'blue',
  completed: 'success',
  error: 'error',
}

export function StatusTag({ value }: { value: string }) {
  return <Tag color={colorMap[value] ?? 'default'}>{value}</Tag>
}

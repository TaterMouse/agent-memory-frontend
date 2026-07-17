export function formatPercent(value?: number) {
  if (typeof value !== 'number') {
    return '--'
  }

  return `${(value * 100).toFixed(1)}%`
}

export function formatDateTime(value?: string) {
  if (!value) return '--'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'

  return date.toLocaleString('zh-CN', { hour12: false })
}

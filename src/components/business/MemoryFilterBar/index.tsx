import { Card, Input, Select, Space } from 'antd'

interface MemoryFilterBarProps {
  keyword: string
  type: string
  onKeywordChange: (value: string) => void
  onTypeChange: (value: string) => void
}

export function MemoryFilterBar({
  keyword,
  type,
  onKeywordChange,
  onTypeChange,
}: MemoryFilterBarProps) {
  return (
    <Card bordered={false}>
      <Space wrap>
        <Input
          placeholder="按关键字筛选"
          value={keyword}
          style={{ width: 240 }}
          onChange={(event) => onKeywordChange(event.target.value)}
        />
        <Select
          value={type}
          style={{ width: 180 }}
          onChange={onTypeChange}
          options={[
            { label: '全部类型', value: 'all' },
            { label: '偏好', value: 'preference' },
            { label: '事实', value: 'fact' },
            { label: '任务', value: 'task' },
            { label: '决策', value: 'decision' },
            { label: '约束', value: 'constraint' },
          ]}
        />
      </Space>
    </Card>
  )
}

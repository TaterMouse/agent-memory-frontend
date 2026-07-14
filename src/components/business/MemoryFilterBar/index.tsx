import { Card, Flex, Input, Select } from 'antd'

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
    <Card variant="borderless">
      <Flex wrap gap={12}>
        <Input
          placeholder="按关键字筛选"
          value={keyword}
          style={{ flex: '1 1 240px', minWidth: 0 }}
          onChange={(event) => onKeywordChange(event.target.value)}
        />
        <Select
          value={type}
          style={{ flex: '0 1 180px', minWidth: 140 }}
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
      </Flex>
    </Card>
  )
}

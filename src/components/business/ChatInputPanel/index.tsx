import { Button, Card, Input, Space } from 'antd'

interface ChatInputPanelProps {
  value: string
  loading?: boolean
  onChange: (value: string) => void
  onSend: () => void
}

export function ChatInputPanel({ value, loading, onChange, onSend }: ChatInputPanelProps) {
  return (
    <Card variant="borderless" title="发送消息">
      <Space orientation="vertical" size={12} style={{ display: 'flex' }}>
        <Input.TextArea
          rows={4}
          placeholder="输入本轮消息，后续可接大模型接口。"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <Button type="primary" loading={loading} onClick={onSend}>
          发送消息
        </Button>
      </Space>
    </Card>
  )
}

import { Card, Skeleton } from 'antd'

export function LoadingBlock() {
  return (
    <Card bordered={false}>
      <Skeleton active paragraph={{ rows: 4 }} />
    </Card>
  )
}

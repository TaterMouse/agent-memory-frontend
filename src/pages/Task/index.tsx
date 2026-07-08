import { Button, Card, Space } from 'antd'
import { TaskProgressPanel } from '../../components/business/TaskProgressPanel'
import { PageContainer } from '../../components/common/PageContainer'
import { mockTaskProgress } from '../../mock/task.mock'

export default function TaskPage() {
  return (
    <PageContainer
      title="任务页"
      description="后续可以在这里接入创建任务、更新进度、查看任务状态等能力。"
      extra={
        <Space>
          <Button type="primary">创建任务</Button>
          <Button>刷新进度</Button>
        </Space>
      }
    >
      <Card bordered={false}>
        <TaskProgressPanel progress={mockTaskProgress} />
      </Card>
    </PageContainer>
  )
}

import { Button, Space } from 'antd'
import { TaskProgressPanel } from '@/components/business/TaskProgressPanel'
import { PageContainer, PageSection } from '@/components/common'
import { mockTaskProgress } from '@/mock/task.mock'

export default function TaskPage() {
  return (
    <PageContainer
      title="任务页"
      description="这里承接任务创建、任务进度和相关记忆信息。A 先把展示结构固定住，后续由 C 继续补任务业务。"
      extra={
        <Space>
          <Button type="primary">创建任务</Button>
          <Button>刷新进度</Button>
        </Space>
      }
    >
      <PageSection>
        <TaskProgressPanel progress={mockTaskProgress} />
      </PageSection>
    </PageContainer>
  )
}

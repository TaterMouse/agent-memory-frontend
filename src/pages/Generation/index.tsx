import {
  ApartmentOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  FilterOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { Card, Col, Flex, Progress, Row, Space, Table, Tag, Typography } from 'antd'
import type { ReactNode } from 'react'
import { PageContainer } from '@/components/common'

interface StageCardProps {
  number: string
  title: string
  description: string
  icon: ReactNode
  color: string
}

function StageCard({ number, title, description, icon, color }: StageCardProps) {
  return (
    <Card className="console-card generation-stage" variant="borderless">
      <Flex justify="space-between" align="flex-start">
        <span className="generation-number" style={{ color, background: `${color}15` }}>{number}</span>
        <span className="generation-icon" style={{ color }}>{icon}</span>
      </Flex>
      <Typography.Title level={5}>{title}</Typography.Title>
      <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
      <Progress percent={100} showInfo={false} strokeColor={color} size="small" />
    </Card>
  )
}

const conflictRows = [
  { key: '1', source: '用户偏好使用 Python', target: '用户当前项目使用 Java', decision: '保留并标记场景', score: '0.82' },
  { key: '2', source: '任务预计周五完成', target: '任务已延期至下周', decision: '更新已有记忆', score: '0.94' },
  { key: '3', source: '默认使用经济路线', target: '高峰期优先时效路线', decision: '融合为条件记忆', score: '0.89' },
]

export default function GenerationPage() {
  const stages: StageCardProps[] = [
    { number: '01', title: '关键信息抽取', description: '从导入数据中识别用户偏好、事实、任务状态与历史决策。', icon: <FileSearchOutlined />, color: '#1677ff' },
    { number: '02', title: '结构化记忆生成', description: '生成统一记忆单元，补齐类型、标签、置信度和来源信息。', icon: <ApartmentOutlined />, color: '#20a47c' },
    { number: '03', title: '相似记忆召回', description: '结合向量相似度、关键词与标识一致性召回候选记忆。', icon: <FilterOutlined />, color: '#7b61d1' },
    { number: '04', title: '冲突识别与融合', description: '判断新增、跳过、更新或融合，避免重复和相互矛盾。', icon: <SafetyCertificateOutlined />, color: '#e49a28' },
    { number: '05', title: '有效记忆入库', description: '写入结构化数据库与向量索引，并保留变更轨迹。', icon: <DatabaseOutlined />, color: '#2471cf' },
  ]

  return (
    <PageContainer
      title="记忆生成与去重融合"
      description="展示从原始数据到有效记忆入库的标准处理链路，以及去重和冲突决策结果。"
      extra={<Tag color="processing">Pipeline 运行中</Tag>}
    >
      <div className="generation-grid">
        {stages.map((stage) => <StageCard key={stage.number} {...stage} />)}
      </div>

      <Row gutter={[14, 14]}>
        <Col xs={24} xl={15}>
          <Card className="console-card" title="最近冲突与融合决策" variant="borderless">
            <Table
              size="small"
              pagination={false}
              dataSource={conflictRows}
              columns={[
                { title: '新记忆', dataIndex: 'source', ellipsis: true },
                { title: '候选记忆', dataIndex: 'target', ellipsis: true },
                { title: '处理决策', dataIndex: 'decision', render: (value: string) => <Tag color="blue">{value}</Tag> },
                { title: '综合分数', dataIndex: 'score', width: 90 },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card className="console-card" title="今日处理质量" variant="borderless">
            <Space orientation="vertical" size={15} style={{ display: 'flex' }}>
              {[
                ['生成成功率', 98, '#1677ff'],
                ['去重识别准确率', 94, '#20a47c'],
                ['冲突决策覆盖率', 91, '#e49a28'],
                ['双写一致性', 99, '#7b61d1'],
              ].map(([label, value, color]) => (
                <div key={String(label)}>
                  <Flex justify="space-between"><Typography.Text>{label}</Typography.Text><Typography.Text strong>{value}%</Typography.Text></Flex>
                  <Progress percent={Number(value)} showInfo={false} strokeColor={String(color)} size="small" />
                </div>
              ))}
              <Flex align="center" gap={8} className="generation-health"><CheckCircleOutlined /> PostgreSQL 与向量索引状态一致</Flex>
            </Space>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  )
}

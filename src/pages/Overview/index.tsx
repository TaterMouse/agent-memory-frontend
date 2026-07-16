import {
  ApiOutlined,
  ApartmentOutlined,
  CheckCircleFilled,
  CloudUploadOutlined,
  DatabaseOutlined,
  DownOutlined,
  FileTextOutlined,
  FilterOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import {
  Badge,
  Card,
  Col,
  Flex,
  Progress,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { ReactNode } from 'react'

const { Text, Title } = Typography

interface MetricCardProps {
  title: string
  value: string
  note: string
  color: string
  icon: ReactNode
  points: number[]
}

function MiniTrend({ points, color }: { points: number[]; color: string }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 92 + 4
      const y = 29 - ((point - min) / range) * 22
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg className="mini-trend" viewBox="0 0 100 34" aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d={`${path} L 96 34 L 4 34 Z`} fill={color} opacity="0.08" />
    </svg>
  )
}

function MetricCard({ title, value, note, color, icon, points }: MetricCardProps) {
  return (
    <Card className="console-card metric-card" variant="borderless">
      <Flex justify="space-between" align="flex-start" gap={10}>
        <Flex gap={12} align="center">
          <div className="metric-icon" style={{ color, background: `${color}16` }}>{icon}</div>
          <div>
            <Text type="secondary" className="metric-label">{title}</Text>
            <Title level={3} className="metric-value">{value}</Title>
          </div>
        </Flex>
        <MiniTrend points={points} color={color} />
      </Flex>
      <Text className="metric-note">较昨日 <span style={{ color }}>{note}</span></Text>
    </Card>
  )
}

const metrics: MetricCardProps[] = [
  { title: '接入智能体', value: '128', note: '↑ 6.67%', color: '#1677ff', icon: <RobotOutlined />, points: [4, 8, 7, 12, 10, 18, 15, 23] },
  { title: '业务场景', value: '24', note: '↑ 4.35%', color: '#22a884', icon: <CloudUploadOutlined />, points: [8, 7, 11, 9, 14, 13, 18, 20] },
  { title: '记忆总量', value: '2,486,920', note: '↑ 2.84%', color: '#7b61d1', icon: <DatabaseOutlined />, points: [5, 9, 8, 14, 12, 17, 19, 27] },
  { title: '今日检索调用', value: '83,214', note: '↑ 7.96%', color: '#e99a21', icon: <FilterOutlined />, points: [3, 9, 5, 11, 8, 16, 13, 21] },
  { title: '上下文返回成功率', value: '99.2%', note: '↑ 0.3%', color: '#246fd3', icon: <SafetyCertificateOutlined />, points: [10, 9, 13, 12, 15, 14, 18, 20] },
]

const flowSteps = [
  { number: '1', title: '智能体接入与记忆数据写入', description: '接入智能体，导入对话、会话与任务数据', color: '#1677ff', icon: <RobotOutlined /> },
  { number: '2', title: '通用记忆建模与多层管理', description: '构建记忆模型，管理多层、多类型记忆', color: '#20a47c', icon: <DatabaseOutlined /> },
  { number: '3', title: '记忆生成与去重融合', description: '抽取、去重、融合，生成高质量有效记忆', color: '#7b61d1', icon: <ApartmentOutlined /> },
  { number: '4', title: '多信号融合记忆检索', description: '多信号检索与排序，精准定位相关记忆', color: '#ef941d', icon: <FilterOutlined /> },
  { number: '5', title: '记忆上下文返回', description: '结构化或文本化返回，注入模型上下文', color: '#2471cf', icon: <FileTextOutlined /> },
]

const agentRows = [
  { key: '1', id: 'A-1023', scene: '物流调度智能体', status: '已接入', time: '2 分钟前', result: '已处理' },
  { key: '2', id: 'A-1008', scene: '客服助手智能体', status: '运行中', time: '5 分钟前', result: '已记录' },
  { key: '3', id: 'A-0991', scene: '订单处理智能体', status: '已接入', time: '12 分钟前', result: '已处理' },
  { key: '4', id: 'A-0887', scene: '营销推荐智能体', status: '运行中', time: '18 分钟前', result: '已记录' },
  { key: '5', id: 'A-0772', scene: '财务分析智能体', status: '正常', time: '35 分钟前', result: '已处理' },
]

const searchRows = [
  { key: '1', type: '历史决策', content: '物流任务的分流确认', score: '0.96', time: '2026-07-16 10:42' },
  { key: '2', type: '用户偏好', content: '优先使用轻量检索策略', score: '0.92', time: '2026-07-16 09:11' },
  { key: '3', type: '任务状态', content: '运输异常处置记录', score: '0.88', time: '2026-07-15 19:46' },
]

const pipelineStages = [
  { label: '原始输入', description: '对话与任务数据', icon: <ApiOutlined />, color: '#3a82d7' },
  { label: '语义抽取', description: '偏好、事实、状态', icon: <FilterOutlined />, color: '#4ba6a0' },
  { label: '结构生成', description: '统一记忆单元', icon: <FileTextOutlined />, color: '#7d69ca' },
  { label: '去重识别', description: '相似与冲突检测', icon: <SafetyCertificateOutlined />, color: '#e49b36' },
  { label: '融合整理', description: '更新、合并、过滤', icon: <ApartmentOutlined />, color: '#2aa37d' },
  { label: '有效入库', description: '结构库与向量库', icon: <DatabaseOutlined />, color: '#276fc6' },
]

export default function OverviewPage() {
  return (
    <Space orientation="vertical" size={14} style={{ display: 'flex' }} className="overview-page">
      <div className="metric-grid">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <Card className="console-card" title="功能总览" variant="borderless">
        <div className="flow-grid">
          {flowSteps.map((step, index) => (
            <div className="flow-item-wrap" key={step.number}>
              <div className="flow-item" style={{ borderColor: `${step.color}55`, background: `${step.color}08` }}>
                <span className="flow-number" style={{ background: step.color }}>{step.number}</span>
                <div className="flow-icon" style={{ color: step.color }}>{step.icon}</div>
                <div>
                  <Text strong>{step.title}</Text>
                  <Text type="secondary">{step.description}</Text>
                </div>
              </div>
              {index < flowSteps.length - 1 ? <span className="flow-arrow">→</span> : null}
            </div>
          ))}
        </div>
      </Card>

      <Row gutter={[12, 12]}>
        <Col xs={24} xl={10}>
          <Card className="console-card dashboard-panel" title="智能体接入与数据写入" variant="borderless">
            <Table
              size="small"
              pagination={false}
              dataSource={agentRows}
              columns={[
                { title: 'Agent ID', dataIndex: 'id', width: 84 },
                { title: '场景', dataIndex: 'scene' },
                { title: '接入状态', dataIndex: 'status', render: (value: string) => <Tag color={value === '运行中' ? 'processing' : 'success'}>{value}</Tag> },
                { title: '最近写入', dataIndex: 'time' },
                { title: '结果', dataIndex: 'result', render: (value: string) => <Text style={{ color: '#23956d' }}>{value}</Text> },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="console-card dashboard-panel" title="多层记忆管理" variant="borderless">
            <Space orientation="vertical" size={10} style={{ display: 'flex' }}>
              {[
                ['用户级记忆', '用户偏好、稳定事实', '#1677ff'],
                ['会话级记忆', '上下文、会话摘要', '#20a47c'],
                ['任务级记忆', '目标、进展、待办、结果', '#e49a28'],
                ['智能体状态记忆', '历史操作、流程轨迹', '#7b61d1'],
              ].map(([title, description, color]) => (
                <div className="memory-layer" key={title}>
                  <span style={{ background: color }} />
                  <div><Text strong>{title}</Text><Text type="secondary">{description}</Text></div>
                </div>
              ))}
              <Flex wrap gap={6} className="memory-type-tags">
                <Tag color="blue">用户偏好</Tag><Tag color="green">关键事实</Tag><Tag color="gold">任务状态</Tag><Tag color="purple">历史决策</Tag>
              </Flex>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Card className="console-card dashboard-panel" title="记忆生成与去重融合" variant="borderless">
            <div className="pipeline-workflow">
              {[pipelineStages.slice(0, 3), pipelineStages.slice(3)].map((stages, laneIndex) => (
                <div className="pipeline-lane-wrap" key={laneIndex === 0 ? 'generation' : 'governance'}>
                  <div className="pipeline-lane-label">{laneIndex === 0 ? '生成阶段' : '治理阶段'}</div>
                  <div className="pipeline-lane">
                    {stages.map((stage, index) => (
                      <div className="pipeline-stage-wrap" key={stage.label}>
                        <div className="pipeline-stage" style={{ '--stage-color': stage.color } as React.CSSProperties}>
                          <span>{stage.icon}</span>
                          <Text strong>{stage.label}</Text>
                          <Text type="secondary">{stage.description}</Text>
                        </div>
                        {index < stages.length - 1 ? <span className="pipeline-connector">→</span> : null}
                      </div>
                    ))}
                  </div>
                  {laneIndex === 0 ? <div className="pipeline-turn"><DownOutlined /></div> : null}
                </div>
              ))}
            </div>
            <div className="pipeline-metrics">
              <div><Text type="secondary">今日生成</Text><strong>12,480</strong></div>
              <div><Text type="secondary">去重率</Text><strong style={{ color: '#20a47c' }}>31%</strong></div>
              <div><Text type="secondary">融合成功率</Text><strong style={{ color: '#e49a28' }}>94%</strong></div>
              <div><Text type="secondary">低价值过滤</Text><strong>2,103</strong></div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} xl={10}>
          <Card className="console-card dashboard-panel" title="多信号融合检索" variant="borderless">
            <Flex gap={8} wrap className="search-summary">
              <Tag color="blue">语义向量</Tag><Tag color="cyan">关键词</Tag><Tag color="gold">元数据过滤</Tag><Tag color="purple">融合排序</Tag><Tag>Top-K 3</Tag>
            </Flex>
            <Table
              size="small"
              pagination={false}
              dataSource={searchRows}
              columns={[
                { title: '类型', dataIndex: 'type', render: (value: string) => <Badge color="#3b82d0" text={value} /> },
                { title: '记忆摘要', dataIndex: 'content' },
                { title: '相关度', dataIndex: 'score', width: 70 },
                { title: '时间', dataIndex: 'time', width: 138 },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} xl={7}>
          <Card className="console-card dashboard-panel" title="上下文返回预览" variant="borderless">
            <Flex gap={8} className="context-tabs"><Text strong>JSON 返回</Text><Text type="secondary">文本片段返回</Text></Flex>
            <pre className="context-code">{`{
  "memory_context": "用户偏好高可靠方案",
  "user_id": "U-2048",
  "scene": "物流调度",
  "score": 0.96,
  "status": "active"
}`}</pre>
          </Card>
        </Col>
        <Col xs={24} xl={7}>
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} xl={24}>
              <Card className="console-card compact-chart" title="记忆增长趋势（近 7 天）" variant="borderless">
                <div className="line-chart"><MiniTrend points={[4, 7, 8, 12, 16, 21, 29]} color="#2676ce" /></div>
              </Card>
            </Col>
            <Col xs={24} sm={12} xl={24}>
              <Card className="console-card compact-chart" title="记忆类型分布" variant="borderless">
                <Flex align="center" gap={18}>
                  <div className="donut-chart"><span>总计<br /><strong>248 万</strong></span></div>
                  <Space orientation="vertical" size={3}>
                    <Badge color="#2474cf" text="用户偏好 28.3%" /><Badge color="#20a47c" text="关键事实 26.1%" /><Badge color="#e7a32e" text="任务状态 23.7%" /><Badge color="#795fca" text="历史决策 15.6%" />
                  </Space>
                </Flex>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} lg={12}>
          <Card className="console-card compact-chart" title="检索方式占比（今日）" variant="borderless">
            {[['语义向量检索', 48.6, '#2474cf'], ['关键词检索', 24.1, '#4d95d8'], ['元数据过滤', 15.3, '#77b4e0'], ['融合检索', 12, '#a6d0ee']].map(([label, percent, color]) => (
              <Flex key={String(label)} align="center" gap={12} className="bar-line"><Text>{label}</Text><Progress percent={Number(percent)} showInfo={false} strokeColor={String(color)} /><Text>{percent}%</Text></Flex>
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="console-card compact-chart" title="最近告警与任务" variant="borderless">
            <Space orientation="vertical" size={9} style={{ display: 'flex' }}>
              <Flex justify="space-between"><Text><Badge status="warning" /> 检索响应时间短时升高</Text><Text type="secondary">2 分钟前</Text></Flex>
              <Flex justify="space-between"><Text><Badge status="processing" /> 记忆批量导入任务执行中</Text><Text type="secondary">15 分钟前</Text></Flex>
              <Flex justify="space-between"><Text><CheckCircleFilled style={{ color: '#27a274' }} /> 智能体 A-0772 配置已同步</Text><Text type="secondary">1 小时前</Text></Flex>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  )
}

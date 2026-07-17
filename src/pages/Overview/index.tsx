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
import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { getAdminStats, getDashboard } from '@/api/modules/dashboard'
import type {
  AdminStatsResult,
  DashboardMemoryTypeItem,
  DashboardResult,
  DashboardRetrievalSignalItem,
} from '@/api/types'
import { useAppStore } from '@/store'

const { Text, Title } = Typography
const UNAVAILABLE = '接口不可用'
const NO_DATA = '暂无数据'
const trendColors = ['#2474cf', '#20a47c', '#e7a32e', '#795fca', '#77b4e0', '#a6d0ee']

interface MetricCardProps {
  title: string
  value: string
  note: string
  color: string
  icon: ReactNode
  points?: number[]
  trendPlaceholder: string
}

interface OverviewDataState {
  loading: boolean
  dashboard: DashboardResult | null
  stats: AdminStatsResult | null
  dashboardAvailable: boolean
  statsAvailable: boolean
  fetchedAt: Date | null
}

function MiniTrend({ points, color }: { points: number[]; color: string }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const divisor = Math.max(points.length - 1, 1)
  const path = points
    .map((point, index) => {
      const x = (index / divisor) * 92 + 4
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

function TrendPlaceholder({ children }: { children: string }) {
  return (
    <Text type="secondary" style={{ width: 72, alignSelf: 'flex-end', fontSize: 10, textAlign: 'center' }}>
      {children}
    </Text>
  )
}

function MetricCard({ title, value, note, color, icon, points, trendPlaceholder }: MetricCardProps) {
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
        {points && points.length > 1
          ? <MiniTrend points={points} color={color} />
          : <TrendPlaceholder>{trendPlaceholder}</TrendPlaceholder>}
      </Flex>
      <Text className="metric-note">{note}</Text>
    </Card>
  )
}

const flowSteps = [
  { number: '1', title: '智能体接入与记忆数据写入', description: '接入智能体，导入对话、会话与任务数据', color: '#1677ff', icon: <RobotOutlined /> },
  { number: '2', title: '通用记忆建模与多层管理', description: '构建记忆模型，管理多层、多类型记忆', color: '#20a47c', icon: <DatabaseOutlined /> },
  { number: '3', title: '记忆生成与去重融合', description: '抽取、去重、融合，生成高质量有效记忆', color: '#7b61d1', icon: <ApartmentOutlined /> },
  { number: '4', title: '多信号融合记忆检索', description: '多信号检索与排序，精准定位相关记忆', color: '#ef941d', icon: <FilterOutlined /> },
  { number: '5', title: '记忆上下文返回', description: '结构化或文本化返回，注入模型上下文', color: '#2471cf', icon: <FileTextOutlined /> },
]

const pipelineStages = [
  { label: '原始输入', description: '对话与任务数据', icon: <ApiOutlined />, color: '#3a82d7' },
  { label: '语义抽取', description: '偏好、事实、状态', icon: <FilterOutlined />, color: '#4ba6a0' },
  { label: '结构生成', description: '统一记忆单元', icon: <FileTextOutlined />, color: '#7d69ca' },
  { label: '去重识别', description: '相似与冲突检测', icon: <SafetyCertificateOutlined />, color: '#e49b36' },
  { label: '融合整理', description: '更新、合并、过滤', icon: <ApartmentOutlined />, color: '#2aa37d' },
  { label: '有效入库', description: '结构库与向量库', icon: <DatabaseOutlined />, color: '#276fc6' },
]

const memoryTypeLabels: Record<string, string> = {
  preference: '用户偏好',
  fact: '关键事实',
  key_fact: '关键事实',
  task: '任务状态',
  task_state: '任务状态',
  decision: '历史决策',
  constraint: '约束条件',
  process: '过程经验',
  feedback: '反馈记录',
}

const signalLabels: Record<string, string> = {
  semantic: '语义向量检索',
  vector: '语义向量检索',
  keyword: '关键词检索',
  metadata: '元数据过滤',
  hybrid: '融合检索',
  fusion: '融合检索',
}

function formatCount(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? new Intl.NumberFormat('zh-CN').format(value)
    : UNAVAILABLE
}

function formatCompactCount(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
    : UNAVAILABLE
}

function formatPercent(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${(value * 100).toFixed(1)}%`
    : UNAVAILABLE
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return UNAVAILABLE
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parsed)
}

function formatUpdatedAt(value: Date | null) {
  if (!value) return UNAVAILABLE
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(value)
}

function buildMetricNote(rate: number | null | undefined, available: boolean, fetchedAt: Date | null) {
  if (typeof rate === 'number' && Number.isFinite(rate)) {
    return `较昨日 ${rate >= 0 ? '↑' : '↓'} ${Math.abs(rate * 100).toFixed(1)}%`
  }
  return available ? `实时统计 · ${formatUpdatedAt(fetchedAt)}` : UNAVAILABLE
}

function buildDonutGradient(items: DashboardMemoryTypeItem[]) {
  if (!items.length) return '#d7dee8'
  let cursor = 0
  const segments = items.map((item, index) => {
    const start = cursor
    cursor = Math.min(100, cursor + Math.max(0, item.ratio * 100))
    return `${trendColors[index % trendColors.length]} ${start.toFixed(2)}% ${cursor.toFixed(2)}%`
  })
  if (cursor < 100) segments.push(`#d7dee8 ${cursor.toFixed(2)}% 100%`)
  return `conic-gradient(${segments.join(', ')})`
}

function arrayState<T>(value: T[] | undefined, loading: boolean, dashboardAvailable: boolean) {
  if (loading) return 'loading'
  if (!dashboardAvailable || !Array.isArray(value)) return 'unavailable'
  return value.length ? 'available' : 'empty'
}

function stateText(state: ReturnType<typeof arrayState>) {
  if (state === 'loading') return '加载中'
  if (state === 'unavailable') return UNAVAILABLE
  return NO_DATA
}

export default function OverviewPage() {
  const baseUrl = useAppStore((state) => state.config.baseUrl)
  const apiKey = useAppStore((state) => state.config.apiKey)
  const [dataState, setDataState] = useState<OverviewDataState>({
    loading: true,
    dashboard: null,
    stats: null,
    dashboardAvailable: false,
    statsAvailable: false,
    fetchedAt: null,
  })

  useEffect(() => {
    let active = true
    setDataState((current) => ({ ...current, loading: true }))

    void Promise.allSettled([getDashboard(), getAdminStats()]).then(([dashboardResult, statsResult]) => {
      if (!active) return
      setDataState({
        loading: false,
        dashboard: dashboardResult.status === 'fulfilled' ? dashboardResult.value : null,
        stats: statsResult.status === 'fulfilled' ? statsResult.value : null,
        dashboardAvailable: dashboardResult.status === 'fulfilled',
        statsAvailable: statsResult.status === 'fulfilled',
        fetchedAt: new Date(),
      })
    })

    return () => {
      active = false
    }
  }, [apiKey, baseUrl])

  const { dashboard, stats, dashboardAvailable, statsAvailable, fetchedAt, loading } = dataState
  const summary = dashboard?.summary
  const comparison = dashboard?.comparison
  const agentCount = typeof summary?.agent_count === 'number' ? summary.agent_count : stats?.total_agents
  const memoryCount = typeof summary?.memory_count === 'number' ? summary.memory_count : stats?.total_memories
  const agentCountAvailable = typeof agentCount === 'number' && (dashboardAvailable || statsAvailable)
  const memoryCountAvailable = typeof memoryCount === 'number' && (dashboardAvailable || statsAvailable)
  const sceneCountAvailable = dashboardAvailable && typeof summary?.scene_count === 'number'
  const retrievalCountAvailable = dashboardAvailable && typeof summary?.retrieval_count === 'number'
  const contextRateAvailable = dashboardAvailable && typeof summary?.context_success_rate === 'number'
  const trendPoints = dashboard?.memory_trend?.map((item) => item.total)

  const metrics: MetricCardProps[] = [
    {
      title: '接入智能体',
      value: loading ? '加载中' : formatCount(agentCount),
      note: loading ? '正在获取实时数据' : buildMetricNote(comparison?.agent_count_rate, agentCountAvailable, fetchedAt),
      color: '#1677ff',
      icon: <RobotOutlined />,
      trendPlaceholder: loading ? '加载中' : UNAVAILABLE,
    },
    {
      title: '业务场景',
      value: loading ? '加载中' : formatCount(summary?.scene_count),
      note: loading ? '正在获取实时数据' : buildMetricNote(comparison?.scene_count_rate, sceneCountAvailable, fetchedAt),
      color: '#22a884',
      icon: <CloudUploadOutlined />,
      trendPlaceholder: loading ? '加载中' : UNAVAILABLE,
    },
    {
      title: '记忆总量',
      value: loading ? '加载中' : formatCount(memoryCount),
      note: loading ? '正在获取实时数据' : buildMetricNote(comparison?.memory_count_rate, memoryCountAvailable, fetchedAt),
      color: '#7b61d1',
      icon: <DatabaseOutlined />,
      points: dashboardAvailable && trendPoints && trendPoints.length > 1 ? trendPoints : undefined,
      trendPlaceholder: loading ? '加载中' : dashboardAvailable ? NO_DATA : UNAVAILABLE,
    },
    {
      title: '今日检索调用',
      value: loading ? '加载中' : formatCount(summary?.retrieval_count),
      note: loading ? '正在获取实时数据' : buildMetricNote(comparison?.retrieval_count_rate, retrievalCountAvailable, fetchedAt),
      color: '#e99a21',
      icon: <FilterOutlined />,
      trendPlaceholder: loading ? '加载中' : UNAVAILABLE,
    },
    {
      title: '上下文返回成功率',
      value: loading ? '加载中' : formatPercent(summary?.context_success_rate),
      note: loading ? '正在获取实时数据' : buildMetricNote(comparison?.context_success_rate_change, contextRateAvailable, fetchedAt),
      color: '#246fd3',
      icon: <SafetyCertificateOutlined />,
      trendPlaceholder: loading ? '加载中' : UNAVAILABLE,
    },
  ]

  const agentState = arrayState(dashboard?.recent_agents, loading, dashboardAvailable)
  const agentRows = dashboard?.recent_agents?.map((agent, index) => ({
    key: agent.agent_id || String(index),
    id: agent.agent_id || UNAVAILABLE,
    scene: agent.scene_name || agent.scene_id || UNAVAILABLE,
    status: agent.status || UNAVAILABLE,
    time: formatDateTime(agent.last_write_at),
    result: agent.latest_result || UNAVAILABLE,
  })) ?? []

  const memoryTypeState = arrayState(dashboard?.memory_type_distribution, loading, dashboardAvailable)
  const memoryTypes = memoryTypeState === 'available'
    ? dashboard?.memory_type_distribution ?? []
    : []

  const generation = dashboard?.generation_summary
  const generationMetrics = [
    ['今日生成', generation?.generated_count],
    ['今日融合', generation?.merged_count],
    ['今日更新', generation?.updated_count],
    ['今日过滤', generation?.discarded_count],
  ] as const

  const signalState = arrayState(dashboard?.retrieval_signal_distribution, loading, dashboardAvailable)
  const signals = signalState === 'available'
    ? dashboard?.retrieval_signal_distribution ?? []
    : []
  const retrievalState = arrayState(dashboard?.recent_retrievals, loading, dashboardAvailable)
  const retrievalRows = dashboard?.recent_retrievals?.map((item, index) => ({
    key: item.retrieval_id || String(index),
    type: memoryTypeLabels[item.memory_type || ''] || item.memory_type || UNAVAILABLE,
    content: item.summary || item.content || UNAVAILABLE,
    score: typeof item.relevance_score === 'number' ? item.relevance_score.toFixed(2) : UNAVAILABLE,
    time: formatDateTime(item.occurred_at || item.created_at),
  })) ?? []

  const contextPreview = loading
    ? '正在获取实时数据…'
    : dashboard?.latest_context
      ? JSON.stringify(dashboard.latest_context, null, 2)
      : UNAVAILABLE

  const memoryTrendState = arrayState(dashboard?.memory_trend, loading, dashboardAvailable)
  const distributionTotal = typeof summary?.memory_count === 'number'
    ? summary.memory_count
    : memoryTypes.reduce((total, item) => total + item.count, 0)
  const donutText = memoryTypeState === 'available' ? formatCompactCount(distributionTotal) : stateText(memoryTypeState)

  const recentAlerts = dashboard?.recent_alerts ?? []
  const recentTasks = dashboard?.recent_tasks ?? []
  const activityState = loading
    ? 'loading'
    : !dashboardAvailable || !Array.isArray(dashboard?.recent_alerts) || !Array.isArray(dashboard?.recent_tasks)
      ? 'unavailable'
      : recentAlerts.length || recentTasks.length
        ? 'available'
        : 'empty'

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
              locale={{ emptyText: stateText(agentState) }}
              columns={[
                { title: 'Agent ID', dataIndex: 'id', width: 84 },
                { title: '场景', dataIndex: 'scene' },
                { title: '接入状态', dataIndex: 'status', render: (value: string) => <Tag color={['active', 'running', 'in_progress', '运行中'].includes(value) ? 'processing' : value === UNAVAILABLE ? 'default' : 'success'}>{value}</Tag> },
                { title: '最近写入', dataIndex: 'time' },
                { title: '结果', dataIndex: 'result', render: (value: string) => <Text style={{ color: value === UNAVAILABLE ? undefined : '#23956d' }}>{value}</Text> },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="console-card dashboard-panel" title="多层记忆管理" variant="borderless">
            <Space orientation="vertical" size={10} style={{ display: 'flex' }}>
              {memoryTypeState === 'available'
                ? memoryTypes.slice(0, 4).map((item, index) => (
                    <div className="memory-layer" key={item.memory_type}>
                      <span style={{ background: trendColors[index % trendColors.length] }} />
                      <div>
                        <Text strong>{memoryTypeLabels[item.memory_type] || item.memory_type}</Text>
                        <Text type="secondary">{formatCount(item.count)} · {formatPercent(item.ratio)}</Text>
                      </div>
                    </div>
                  ))
                : (
                    <div className="memory-layer">
                      <span style={{ background: '#d7dee8' }} />
                      <div><Text strong>{stateText(memoryTypeState)}</Text><Text type="secondary">{stateText(memoryTypeState)}</Text></div>
                    </div>
                  )}
              <Flex wrap gap={6} className="memory-type-tags">
                {memoryTypeState === 'available'
                  ? memoryTypes.map((item, index) => <Tag key={item.memory_type} color={index % 2 ? 'green' : 'blue'}>{memoryTypeLabels[item.memory_type] || item.memory_type}</Tag>)
                  : <Tag>{stateText(memoryTypeState)}</Tag>}
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
                        <div className="pipeline-stage" style={{ '--stage-color': stage.color } as CSSProperties}>
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
              {generationMetrics.map(([label, value], index) => (
                <div key={label}>
                  <Text type="secondary">{label}</Text>
                  <strong style={{ color: index === 1 ? '#20a47c' : index === 2 ? '#e49a28' : undefined }}>
                    {loading ? '加载中' : dashboardAvailable ? formatCount(value) : UNAVAILABLE}
                  </strong>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} xl={10}>
          <Card className="console-card dashboard-panel" title="多信号融合检索" variant="borderless">
            <Flex gap={8} wrap className="search-summary">
              {signalState === 'available'
                ? signals.map((item, index) => <Tag key={item.signal} color={index % 2 ? 'cyan' : 'blue'}>{signalLabels[item.signal] || item.signal} {formatPercent(item.ratio)}</Tag>)
                : <Tag>{stateText(signalState)}</Tag>}
            </Flex>
            <Table
              size="small"
              pagination={false}
              dataSource={retrievalRows}
              locale={{ emptyText: stateText(retrievalState) }}
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
            <pre className="context-code">{contextPreview}</pre>
          </Card>
        </Col>
        <Col xs={24} xl={7}>
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} xl={24}>
              <Card className="console-card compact-chart" title="记忆增长趋势（近 7 天）" variant="borderless">
                <div className="line-chart">
                  {memoryTrendState === 'available' && trendPoints && trendPoints.length > 1
                    ? <MiniTrend points={trendPoints} color="#2676ce" />
                    : <TrendPlaceholder>{memoryTrendState === 'available' ? NO_DATA : stateText(memoryTrendState)}</TrendPlaceholder>}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} xl={24}>
              <Card className="console-card compact-chart" title="记忆类型分布" variant="borderless">
                <Flex align="center" gap={18}>
                  <div className="donut-chart" style={{ background: buildDonutGradient(memoryTypes) }}><span>总计<br /><strong>{donutText}</strong></span></div>
                  <Space orientation="vertical" size={3}>
                    {memoryTypeState === 'available'
                      ? memoryTypes.slice(0, 4).map((item, index) => <Badge key={item.memory_type} color={trendColors[index % trendColors.length]} text={`${memoryTypeLabels[item.memory_type] || item.memory_type} ${formatPercent(item.ratio)}`} />)
                      : <Text type="secondary">{stateText(memoryTypeState)}</Text>}
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
            {signalState === 'available'
              ? signals.map((item: DashboardRetrievalSignalItem, index) => {
                  const percent = Math.min(100, Math.max(0, item.ratio * 100))
                  return (
                    <Flex key={item.signal} align="center" gap={12} className="bar-line">
                      <Text>{signalLabels[item.signal] || item.signal}</Text>
                      <Progress percent={percent} showInfo={false} strokeColor={trendColors[index % trendColors.length]} />
                      <Text>{percent.toFixed(1)}%</Text>
                    </Flex>
                  )
                })
              : <Text type="secondary">{stateText(signalState)}</Text>}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="console-card compact-chart" title="最近告警与任务" variant="borderless">
            <Space orientation="vertical" size={9} style={{ display: 'flex' }}>
              {activityState === 'available' ? (
                <>
                  {recentAlerts.map((alert, index) => (
                    <Flex justify="space-between" key={alert.trace_id || `alert-${index}`}>
                      <Text><Badge status="warning" /> {alert.message || alert.error_code || UNAVAILABLE}</Text>
                      <Text type="secondary">{formatDateTime(alert.occurred_at)}</Text>
                    </Flex>
                  ))}
                  {recentTasks.map((task, index) => (
                    <Flex justify="space-between" key={task.task_id || `task-${index}`}>
                      <Text>
                        {task.status === 'completed'
                          ? <CheckCircleFilled style={{ color: '#27a274' }} />
                          : <Badge status="processing" />} {task.title || task.task_id || UNAVAILABLE}{task.status ? ` · ${task.status}` : ''}
                      </Text>
                      <Text type="secondary">{formatDateTime(task.updated_at || task.created_at)}</Text>
                    </Flex>
                  ))}
                </>
              ) : <Text type="secondary">{activityState === 'loading' ? '加载中' : activityState === 'unavailable' ? UNAVAILABLE : NO_DATA}</Text>}
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  )
}

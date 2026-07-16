import { ApiOutlined, CheckCircleOutlined, CloudServerOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Flex, Row, Space, Table, Tag, Typography } from 'antd'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { apiClient } from '@/api/client'
import { PageContainer } from '@/components/common'
import { showErrorMessage, showSuccessMessage } from '@/utils/feedback'

interface HealthResult {
  status?: string
  app?: string
  version?: string
}

const endpointRows = [
  { key: '1', name: '记忆检索', path: '/api/v1/memory/search', status: '可用', latency: '141 ms' },
  { key: '2', name: '记忆列表', path: '/api/v1/memory/list', status: '待适配', latency: '177 ms' },
  { key: '3', name: '记忆写入', path: '/api/v1/memory/write', status: '后端异常', latency: '675 ms' },
  { key: '4', name: '场景创建', path: '/api/v1/scene', status: '后端异常', latency: '725 ms' },
  { key: '5', name: '上下文返回', path: '/api/v1/memory/context', status: '待修复', latency: '260 ms' },
]

type MonitoringMode = 'all' | 'health' | 'calls' | 'records'

const monitoringMeta: Record<MonitoringMode, { title: string; description: string }> = {
  all: { title: '接口与运行监控', description: '集中查看后端服务连通性、接口质量、调用延迟和待处理告警。' },
  health: { title: '接口健康检查', description: '主动检查后端服务是否可访问，并确认应用名称和接口版本。' },
  calls: { title: '调用状态监控', description: '查看核心接口最近一次调用状态、响应耗时和适配进度。' },
  records: { title: '联调记录', description: '记录前后端联调中发现的问题、处理建议和已启用的保障措施。' },
}

function getMonitoringMode(pathname: string): MonitoringMode {
  if (pathname.endsWith('/health')) return 'health'
  if (pathname.endsWith('/calls')) return 'calls'
  if (pathname.endsWith('/records')) return 'records'
  return 'all'
}

export default function MonitoringPage() {
  const { pathname } = useLocation()
  const mode = getMonitoringMode(pathname)
  const pageMeta = monitoringMeta[mode]
  const [checking, setChecking] = useState(false)
  const [health, setHealth] = useState<HealthResult | null>(null)

  const checkHealth = async () => {
    setChecking(true)
    try {
      const response = await apiClient.get<HealthResult>('/health')
      setHealth(response.data)
      showSuccessMessage('后端服务连接正常')
    } catch (error) {
      setHealth(null)
      showErrorMessage(error, '后端服务不可用')
    } finally {
      setChecking(false)
    }
  }

  return (
    <PageContainer
      title={pageMeta.title}
      description={pageMeta.description}
      extra={mode === 'all' || mode === 'health' ? <Button type="primary" icon={<ReloadOutlined />} loading={checking} onClick={() => void checkHealth()}>立即巡检</Button> : undefined}
    >
      {mode === 'all' || mode === 'health' ? <Row gutter={[14, 14]}>
        <Col xs={24} md={8}>
          <Card className="console-card monitor-status" variant="borderless">
            <CloudServerOutlined />
            <div><Typography.Text type="secondary">后端服务</Typography.Text><strong>{health?.status === 'ok' ? '运行正常' : '等待巡检'}</strong><Typography.Text>{health?.app || 'Agent Memory System'}</Typography.Text></div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="console-card monitor-status" variant="borderless">
            <ApiOutlined />
            <div><Typography.Text type="secondary">接口版本</Typography.Text><strong>{health?.version || '1.0.0'}</strong><Typography.Text>统一 REST API</Typography.Text></div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="console-card monitor-status" variant="borderless">
            <WarningOutlined />
            <div><Typography.Text type="secondary">待处理问题</Typography.Text><strong>4</strong><Typography.Text>来自最近一次联调</Typography.Text></div>
          </Card>
        </Col>
      </Row> : null}

      {mode === 'health' ? (
        <Alert
          type={health?.status === 'ok' ? 'success' : 'info'}
          showIcon
          title={health?.status === 'ok' ? '后端健康检查通过' : '点击“立即巡检”获取实时状态'}
          description={health ? `应用：${health.app || 'Agent Memory System'}，版本：${health.version || '未知'}` : '系统将请求 /health，不会调用记忆写入或检索接口。'}
        />
      ) : null}

      {mode === 'all' || mode === 'calls' ? <Alert
        type="warning"
        showIcon
        title="联调状态提示"
        description="以下接口状态来自最近一次人工联调记录，统计接口上线后可切换为实时监控数据。"
      /> : null}
      {mode === 'calls' ? (
        <Row gutter={[14, 14]}>
          <Col xs={24} md={8}><Card className="console-card result-stat"><Typography.Text type="secondary">监控接口</Typography.Text><strong>{endpointRows.length}</strong></Card></Col>
          <Col xs={24} md={8}><Card className="console-card result-stat"><Typography.Text type="secondary">当前可用</Typography.Text><strong style={{ color: '#20a47c' }}>{endpointRows.filter((row) => row.status === '可用').length}</strong></Card></Col>
          <Col xs={24} md={8}><Card className="console-card result-stat"><Typography.Text type="secondary">需要处理</Typography.Text><strong style={{ color: '#e39a2c' }}>{endpointRows.filter((row) => row.status !== '可用').length}</strong></Card></Col>
        </Row>
      ) : null}
      {mode === 'all' || mode === 'calls' ? <Card className="console-card" title="核心接口状态" variant="borderless">
        <Table
          size="small"
          pagination={false}
          dataSource={endpointRows}
          columns={[
            { title: '接口名称', dataIndex: 'name' },
            { title: '请求路径', dataIndex: 'path', render: (value: string) => <Typography.Text code>{value}</Typography.Text> },
            { title: '最近状态', dataIndex: 'status', render: (value: string) => <Tag color={value === '可用' ? 'success' : value === '待适配' ? 'warning' : 'error'}>{value}</Tag> },
            { title: '最近耗时', dataIndex: 'latency' },
          ]}
        />
      </Card> : null}
      {mode === 'all' || mode === 'records' ? <Row gutter={[14, 14]}>
        <Col xs={24} lg={12}>
          <Card className="console-card" title="最近告警" variant="borderless">
            <Space orientation="vertical" size={12} style={{ display: 'flex' }}>
              <Flex gap={8}><WarningOutlined style={{ color: '#e39a2c' }} /><div><Typography.Text strong>记忆写入接口返回内部错误</Typography.Text><Typography.Paragraph type="secondary">请后端根据 trace_id 检查数据库与模型流水线。</Typography.Paragraph></div></Flex>
              <Flex gap={8}><WarningOutlined style={{ color: '#e39a2c' }} /><div><Typography.Text strong>列表返回结构发生变化</Typography.Text><Typography.Paragraph type="secondary">前端已兼容数组与分页对象两种结构。</Typography.Paragraph></div></Flex>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="console-card" title="运行保障" variant="borderless">
            <Space orientation="vertical" size={12}>
              <Typography.Text><CheckCircleOutlined style={{ color: '#20a47c' }} /> 健康检查与 Swagger 已开放</Typography.Text>
              <Typography.Text><CheckCircleOutlined style={{ color: '#20a47c' }} /> 浏览器跨域策略已配置</Typography.Text>
              <Typography.Text><CheckCircleOutlined style={{ color: '#20a47c' }} /> 前端统一错误提示已启用</Typography.Text>
              <Typography.Text><CheckCircleOutlined style={{ color: '#20a47c' }} /> 写入接口超时已调整为 30 秒</Typography.Text>
            </Space>
          </Card>
        </Col>
      </Row> : null}
    </PageContainer>
  )
}

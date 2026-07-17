import { ApiOutlined, CheckCircleOutlined, CloudServerOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Flex, Row, Space, Table, Tag, Typography } from 'antd'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PageContainer } from '@/components/common'
import { useAppStore } from '@/store'
import { showSuccessMessage, showWarningMessage } from '@/utils/feedback'
import { formatDateTime } from '@/utils/format'
import {
  getDefaultEndpointInspections,
  runMonitoringInspection,
  type EndpointInspectionStatus,
  type MonitoringInspection,
} from '@/utils/monitoring'
import { getStoredMonitoringInspection, saveMonitoringInspection } from '@/utils/storage'

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
  const config = useAppStore((state) => state.config)
  const [checking, setChecking] = useState(false)
  const [inspection, setInspection] = useState<MonitoringInspection | null>(
    () => getStoredMonitoringInspection(),
  )

  const checkHealth = async () => {
    setChecking(true)
    try {
      const nextInspection = await runMonitoringInspection(config)
      setInspection(nextInspection)
      saveMonitoringInspection(nextInspection)

      const unavailableCount = nextInspection.endpoints.filter((endpoint) => endpoint.status === 'unavailable').length
      if (nextInspection.health.status === 'healthy' && unavailableCount === 0) {
        showSuccessMessage('巡检完成，安全检查项均可用')
      } else {
        showWarningMessage('巡检完成，发现需要处理的接口')
      }
    } finally {
      setChecking(false)
    }
  }

  const endpointRows = inspection?.endpoints ?? getDefaultEndpointInspections()
  const availableCount = endpointRows.filter((row) => row.status === 'available').length
  const unavailableCount = endpointRows.filter((row) => row.status === 'unavailable').length
  const manualCount = endpointRows.filter((row) => row.status === 'manual').length
  const pendingCount = endpointRows.filter((row) => row.status === 'pending').length
  const health = inspection?.health
  const inspectionTime = inspection ? formatDateTime(inspection.checkedAt) : '尚未巡检'
  const statusMeta: Record<EndpointInspectionStatus, { label: string; color: string }> = {
    available: { label: '可用', color: 'success' },
    unavailable: { label: '异常', color: 'error' },
    manual: { label: '需手动验证', color: 'warning' },
    pending: { label: '未巡检', color: 'default' },
  }

  return (
    <PageContainer
      title={pageMeta.title}
      description={pageMeta.description}
      extra={mode === 'all' || mode === 'health' || mode === 'calls' ? (
        <Button type="primary" icon={<ReloadOutlined />} loading={checking} onClick={() => void checkHealth()}>
          {inspection ? '重新巡检' : '开始巡检'}
        </Button>
      ) : undefined}
    >
      {mode === 'all' || mode === 'health' ? <Row gutter={[14, 14]}>
        <Col xs={24} md={8}>
          <Card className="console-card monitor-status" variant="borderless">
            <CloudServerOutlined />
            <div><Typography.Text type="secondary">后端服务</Typography.Text><strong>{health?.status === 'healthy' ? '运行正常' : health ? '连接异常' : '等待巡检'}</strong><Typography.Text>{health?.app || 'Agent Memory System'}</Typography.Text></div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="console-card monitor-status" variant="borderless">
            <ApiOutlined />
            <div><Typography.Text type="secondary">接口版本</Typography.Text><strong>{health?.version || '--'}</strong><Typography.Text>{health ? `健康检查 ${health.latencyMs} ms` : '等待获取服务信息'}</Typography.Text></div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="console-card monitor-status" variant="borderless">
            <WarningOutlined />
            <div><Typography.Text type="secondary">自动巡检异常</Typography.Text><strong>{unavailableCount}</strong><Typography.Text>最近巡检：{inspectionTime}</Typography.Text></div>
          </Card>
        </Col>
      </Row> : null}

      {mode === 'health' ? (
        <Alert
          type={health?.status === 'healthy' && unavailableCount === 0 ? 'success' : health ? 'warning' : 'info'}
          showIcon
          title={health?.status === 'healthy' ? '后端健康检查已完成' : health ? '后端或安全检查项存在异常' : '点击“开始巡检”获取实时状态'}
          description={inspection
            ? `巡检时间：${inspectionTime}。自动检查 ${availableCount + unavailableCount} 个安全接口，其中 ${availableCount} 个可用、${unavailableCount} 个异常；另有 ${manualCount} 个有副作用的接口需手动验证。`
            : '巡检会检查后端健康状态以及检索、列表和上下文接口，不会自动写入记忆或创建场景。'}
        />
      ) : null}

      {mode === 'all' || mode === 'calls' ? <Alert
        type={inspection && unavailableCount === 0 ? 'success' : inspection ? 'warning' : 'info'}
        showIcon
        title={inspection ? `最近巡检：${inspectionTime}` : '尚未执行接口巡检'}
        description={inspection
          ? `表格已更新为最近一次巡检结果。自动检查项 ${availableCount} 个可用、${unavailableCount} 个异常；${manualCount} 个有副作用的接口保留为手动验证。`
          : '请先点击“开始巡检”，状态监控页会显示本次检查的实际结果和响应耗时。'}
      /> : null}
      {mode === 'calls' ? (
        <Row gutter={[14, 14]}>
          <Col xs={24} md={8}><Card className="console-card result-stat"><Typography.Text type="secondary">监控接口</Typography.Text><strong>{endpointRows.length}</strong></Card></Col>
          <Col xs={24} md={8}><Card className="console-card result-stat"><Typography.Text type="secondary">当前可用</Typography.Text><strong style={{ color: '#20a47c' }}>{availableCount}</strong></Card></Col>
          <Col xs={24} md={8}><Card className="console-card result-stat"><Typography.Text type="secondary">异常 / 待检查</Typography.Text><strong style={{ color: '#e39a2c' }}>{unavailableCount + manualCount + pendingCount}</strong></Card></Col>
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
            {
              title: '最近状态',
              dataIndex: 'status',
              render: (value: EndpointInspectionStatus) => <Tag color={statusMeta[value].color}>{statusMeta[value].label}</Tag>,
            },
            { title: '最近耗时', dataIndex: 'latencyMs', render: (value?: number) => value === undefined ? '--' : `${value} ms` },
            { title: '结果说明', dataIndex: 'message' },
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

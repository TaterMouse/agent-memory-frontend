import {
  ApiOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { Alert, Button, Card, Col, Flex, Row, Space, Steps, Tag, Typography } from 'antd'
import { Link, Navigate, useParams } from 'react-router-dom'
import { PageContainer } from '@/components/common'
import { appRoutes } from '@/constants/routes'
import { findCapability } from '@/constants/capabilities'

export default function CapabilityGuidePage() {
  const { capabilityId } = useParams()
  const capability = findCapability(capabilityId)

  if (!capability) return <Navigate replace to={appRoutes.overview} />

  const isPartial = capability.status === 'partial'
  const isAvailable = capability.status === 'available'
  const statusLabel = isAvailable ? '真实能力已接入' : isPartial ? '部分能力已具备' : '等待后端接口'
  const statusColor = isAvailable ? 'success' : isPartial ? 'processing' : 'gold'

  return (
    <PageContainer
      title={capability.title}
      description={capability.description}
      extra={<Tag icon={isAvailable ? <CheckCircleOutlined /> : isPartial ? <ClockCircleOutlined /> : <ApiOutlined />} color={statusColor}>{statusLabel}</Tag>}
    >
      <Alert
        showIcon
        type={isAvailable ? 'success' : isPartial ? 'info' : 'warning'}
        title={isAvailable ? '该能力已接入后端真实处理流水线' : isPartial ? '后端已具备自动处理能力' : '该能力仍缺少对应后端接口'}
        description={isAvailable
          ? '可以进入相关业务页面提交真实请求，并查看后端返回的处理统计和明细。'
          : isPartial
            ? '自动流程已可运行，但独立查询、人工管理或统计接口仍需后端继续补充。'
            : '当前保留产品说明和页面入口，接口就绪后可继续接入真实数据。'}
      />

      <Row gutter={[14, 14]}>
        <Col xs={24} xl={16}>
          <Card className="console-card capability-process-card" title="预计处理流程" variant="borderless">
            <Steps
              responsive
              current={isAvailable ? capability.steps.length : isPartial ? 1 : 0}
              items={capability.steps.map((step, index) => ({
                title: step,
                content: isAvailable && index === capability.steps.length - 1 ? '可通过真实接口执行' : index === 0 ? '前端入口已建立' : undefined,
              }))}
            />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card className="console-card capability-status-card" title="接入状态" variant="borderless">
            <Space orientation="vertical" size={14} style={{ display: 'flex' }}>
              <Flex gap={10} align="flex-start">
                <CheckCircleOutlined className="capability-status-icon ready" />
                <div><Typography.Text strong>前端页面</Typography.Text><Typography.Text type="secondary">导航、路由与说明页面已完成</Typography.Text></div>
              </Flex>
              <Flex gap={10} align="flex-start">
                {isAvailable ? <CheckCircleOutlined className="capability-status-icon ready" /> : <ClockCircleOutlined className="capability-status-icon waiting" />}
                <div>
                  <Typography.Text strong>真实数据</Typography.Text>
                  <Typography.Text type="secondary">{isAvailable ? '已接入请求、统计和处理明细' : isPartial ? '自动处理已具备，独立管理待补充' : '等待接口后接入请求与结果展示'}</Typography.Text>
                </div>
              </Flex>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card className="console-card capability-backend-card" title="后端对接要求" variant="borderless">
        <Flex justify="space-between" align="center" wrap gap={16}>
          <Flex gap={12} align="center">
            <div className="capability-backend-icon"><FileTextOutlined /></div>
            <div>
              <Typography.Text strong>{capability.backendRequirement}</Typography.Text>
              <Typography.Paragraph type="secondary">建议返回统一的 code、message、data 和 trace_id，错误信息由公共层统一展示。</Typography.Paragraph>
            </div>
          </Flex>
          <Button type="primary" ghost icon={<ArrowRightOutlined />}>
            <Link to={capability.relatedPath}>{capability.relatedLabel}</Link>
          </Button>
        </Flex>
      </Card>
    </PageContainer>
  )
}

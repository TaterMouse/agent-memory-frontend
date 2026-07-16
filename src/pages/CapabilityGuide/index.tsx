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

  return (
    <PageContainer
      title={capability.title}
      description={capability.description}
      extra={<Tag icon={isPartial ? <ClockCircleOutlined /> : <ApiOutlined />} color={isPartial ? 'processing' : 'gold'}>{isPartial ? '部分能力已具备' : '等待后端接口'}</Tag>}
    >
      <Alert
        showIcon
        type={isPartial ? 'info' : 'warning'}
        message={isPartial ? '前端入口和相关基础能力已经预留' : '该能力属于后端记忆处理流程'}
        description={isPartial
          ? '当前可以查看相关业务页面；独立管理功能会在后端接口就绪后继续接入。'
          : '当前先提供完整的产品说明和页面入口，接口就绪后无需调整导航即可接入真实数据。'}
      />

      <Row gutter={[14, 14]}>
        <Col xs={24} xl={16}>
          <Card className="console-card capability-process-card" title="预计处理流程" variant="borderless">
            <Steps
              responsive
              current={isPartial ? 1 : 0}
              items={capability.steps.map((step, index) => ({
                title: step,
                description: index === 0 ? '前端入口已建立' : undefined,
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
                <ClockCircleOutlined className="capability-status-icon waiting" />
                <div><Typography.Text strong>真实数据</Typography.Text><Typography.Text type="secondary">等待接口后接入请求与结果展示</Typography.Text></div>
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

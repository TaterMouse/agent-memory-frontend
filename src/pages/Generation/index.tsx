import {
  ApartmentOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  FilterOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Flex,
  Form,
  Input,
  Progress,
  Row,
  Segmented,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  MemoryBatchGenerationResult,
  MemoryExtractionType,
  MemoryGenerationDetail,
  MemoryGenerationResult,
} from '@/api/types'
import { generateMemories, generateMemoriesBatch } from '@/api/modules/memory'
import { FeedbackState, PageContainer } from '@/components/common'
import { useAppStore } from '@/store'
import { showErrorMessage, showSuccessMessage, showWarningMessage } from '@/utils/feedback'

interface StageCardProps {
  number: string
  title: string
  description: string
  icon: ReactNode
  color: string
}

interface GenerationFormValues {
  text?: string
  batchText?: string
  taskId?: string
  extractionTypes: MemoryExtractionType[]
}

interface GenerationRow extends MemoryGenerationDetail {
  key: string
  batchIndex?: number
}

const extractionOptions: Array<{ label: string; value: MemoryExtractionType }> = [
  { label: '关键事实', value: 'key_fact' },
  { label: '任务状态', value: 'task_state' },
  { label: '历史决策', value: 'decision' },
  { label: '用户偏好', value: 'preference' },
  { label: '过程经验', value: 'process' },
  { label: '反馈信息', value: 'feedback' },
]

const actionMeta: Record<string, { label: string; color: string }> = {
  keep_new: { label: '新增', color: 'green' },
  merge: { label: '融合', color: 'blue' },
  update_existing: { label: '更新', color: 'processing' },
  discard: { label: '跳过', color: 'default' },
  conflict: { label: '冲突', color: 'warning' },
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

function splitBatchText(value = '') {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function GenerationPage() {
  const config = useAppStore((state) => state.config)
  const [form] = Form.useForm<GenerationFormValues>()
  const [mode, setMode] = useState<'single' | 'batch'>('single')
  const [loading, setLoading] = useState(false)
  const [singleResult, setSingleResult] = useState<MemoryGenerationResult | null>(null)
  const [batchResult, setBatchResult] = useState<MemoryBatchGenerationResult | null>(null)

  const stages: StageCardProps[] = [
    { number: '01', title: '关键信息抽取', description: '识别用户偏好、事实、任务状态、历史决策、过程与反馈。', icon: <FileSearchOutlined />, color: '#1677ff' },
    { number: '02', title: '结构化记忆生成', description: '生成带类型、置信度、重要性和来源信息的记忆单元。', icon: <ApartmentOutlined />, color: '#20a47c' },
    { number: '03', title: '相似记忆召回', description: '结合向量、关键词和业务标识查找已有候选记忆。', icon: <FilterOutlined />, color: '#7b61d1' },
    { number: '04', title: '冲突识别与融合', description: '自动执行新增、融合、更新或跳过，并返回处理明细。', icon: <SafetyCertificateOutlined />, color: '#e49a28' },
    { number: '05', title: '有效记忆入库', description: '写入 PostgreSQL 与 Qdrant，并返回真实记忆 ID。', icon: <DatabaseOutlined />, color: '#2471cf' },
  ]

  const activeResult = singleResult ?? batchResult
  const summary = useMemo(() => {
    if (singleResult) return {
      memories: singleResult.memory_ids.length,
      added: singleResult.new_count,
      merged: singleResult.merged_count,
      discarded: singleResult.discarded_count,
      updated: singleResult.updated_count,
      conflicts: singleResult.conflict_count,
    }
    if (batchResult) return {
      memories: batchResult.total_memories,
      added: batchResult.total_new,
      merged: batchResult.total_merged,
      discarded: batchResult.total_discarded,
      updated: batchResult.results.reduce((sum, result) => sum + result.updated_count, 0),
      conflicts: batchResult.results.reduce((sum, result) => sum + result.conflict_count, 0),
    }
    return null
  }, [batchResult, singleResult])

  const detailRows = useMemo<GenerationRow[]>(() => {
    if (singleResult) {
      return singleResult.details.map((detail, index) => ({ ...detail, key: `${detail.memory_id || 'single'}-${index}` }))
    }
    return batchResult?.results.flatMap((result, batchIndex) => result.details.map((detail, index) => ({
      ...detail,
      key: `${batchIndex}-${detail.memory_id || index}`,
      batchIndex: batchIndex + 1,
    }))) ?? []
  }, [batchResult, singleResult])

  const handleModeChange = (value: string | number) => {
    setMode(value as 'single' | 'batch')
    setSingleResult(null)
    setBatchResult(null)
  }

  const handleGenerate = async (values: GenerationFormValues) => {
    const texts = splitBatchText(values.batchText)
    if (mode === 'batch' && texts.length > 50) {
      showWarningMessage('批量生成一次最多支持 50 条文本')
      return
    }

    setLoading(true)
    setSingleResult(null)
    setBatchResult(null)
    try {
      const common = {
        user_id: config.userId,
        agent_id: config.agentId || undefined,
        scene_id: config.sceneId || undefined,
        task_id: values.taskId?.trim() || undefined,
        extraction_types: values.extractionTypes,
      }
      if (mode === 'single') {
        setSingleResult(await generateMemories({ ...common, text: values.text!.trim() }))
      } else {
        setBatchResult(await generateMemoriesBatch({ ...common, texts }))
      }
      showSuccessMessage('记忆生成流水线执行完成')
    } catch (error) {
      showErrorMessage(error, '记忆生成失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer
      title="记忆生成与去重融合"
      description="直接调用后端真实生成流水线，将文本抽取为结构化记忆，并查看新增、融合、更新和跳过结果。"
      extra={<Tag color="green">真实 Pipeline</Tag>}
    >
      <div className="generation-grid">
        {stages.map((stage) => <StageCard key={stage.number} {...stage} />)}
      </div>

      <Row gutter={[14, 14]}>
        <Col xs={24} xl={9}>
          <Card className="console-card generation-workbench" title="生成请求" variant="borderless">
            <Segmented
              block
              value={mode}
              options={[{ label: '单条文本', value: 'single' }, { label: '批量文本', value: 'batch' }]}
              onChange={handleModeChange}
            />
            <Alert
              showIcon
              type="info"
              title={mode === 'single' ? '单条文本最多 10,000 字符' : '每行作为一条独立文本，一次最多 50 条'}
              description="生成会调用大模型完成抽取与去重，通常需要 5 至 15 秒，请耐心等待。"
            />
            <Form<GenerationFormValues>
              form={form}
              layout="vertical"
              initialValues={{ extractionTypes: extractionOptions.map((item) => item.value) }}
              onFinish={(values) => void handleGenerate(values)}
            >
              {mode === 'single' ? (
                <Form.Item name="text" label="输入文本" rules={[{ required: true, whitespace: true, message: '请输入需要生成记忆的文本' }, { max: 10000, message: '文本不能超过 10,000 个字符' }]}>
                  <Input.TextArea rows={7} showCount maxLength={10000} placeholder="例如：用户偏好使用 TypeScript，当前任务是完成记忆管理控制台。" />
                </Form.Item>
              ) : (
                <Form.Item
                  name="batchText"
                  label="批量文本"
                  rules={[
                    { required: true, whitespace: true, message: '请输入至少一条文本' },
                    { validator: (_, value) => splitBatchText(value).length <= 50 ? Promise.resolve() : Promise.reject(new Error('一次最多输入 50 条文本')) },
                  ]}
                >
                  <Input.TextArea rows={9} placeholder={'用户偏好使用 TypeScript\n项目使用 React 构建前端\n任务目标是完成接口联调'} />
                </Form.Item>
              )}
              <Form.Item name="extractionTypes" label="抽取类型" rules={[{ required: true, message: '请至少选择一种抽取类型' }]}>
                <Checkbox.Group className="generation-extraction-options" options={extractionOptions} />
              </Form.Item>
              <Form.Item name="taskId" label="Task ID（可选）">
                <Input placeholder="用于关联长期任务，例如 task_001" />
              </Form.Item>
              <Flex gap={6} wrap className="generation-request-context">
                <Tag color="blue">User：{config.userId}</Tag>
                <Tag>Scene：{config.sceneId || '未设置'}</Tag>
                <Tag>Agent：{config.agentId || '未设置'}</Tag>
              </Flex>
              <Button type="primary" htmlType="submit" icon={<ThunderboltOutlined />} loading={loading} block>
                {mode === 'single' ? '生成结构化记忆' : '批量生成记忆'}
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} xl={15}>
          {loading ? <FeedbackState status="loading" title="记忆生成中" description="后端正在抽取、生成、去重并写入记忆，请不要重复提交。" /> : null}
          {!loading && !activeResult ? (
            <Card className="console-card generation-empty" variant="borderless">
              <DatabaseOutlined />
              <Typography.Title level={4}>等待执行生成流水线</Typography.Title>
              <Typography.Text type="secondary">提交左侧文本后，这里会展示后端返回的真实处理统计和逐条决策。</Typography.Text>
            </Card>
          ) : null}
          {!loading && summary ? (
            <Space orientation="vertical" size={14} style={{ display: 'flex' }}>
              <div className="generation-result-grid">
                {[
                  ['生成记忆', summary.memories, '#1677ff'],
                  ['新增', summary.added, '#20a47c'],
                  ['融合', summary.merged, '#7b61d1'],
                  ['更新', summary.updated, '#2471cf'],
                  ['跳过', summary.discarded, '#8c96a6'],
                  ['冲突', summary.conflicts, '#e49a28'],
                ].map(([label, value, color]) => (
                  <Card className="console-card result-stat" key={String(label)} variant="borderless">
                    <Typography.Text type="secondary">{label}</Typography.Text>
                    <strong style={{ color: String(color) }}>{value}</strong>
                  </Card>
                ))}
              </div>
              <Card className="console-card" title={`处理明细（${detailRows.length}）`} variant="borderless">
                <Table<GenerationRow>
                  rowKey="key"
                  dataSource={detailRows}
                  locale={{ emptyText: '本次没有生成有效记忆，可能已被去重规则过滤。' }}
                  pagination={{ pageSize: 8 }}
                  scroll={{ x: 820 }}
                  columns={[
                    ...(mode === 'batch' ? [{ title: '输入序号', dataIndex: 'batchIndex', width: 85 }] : []),
                    { title: '处理结果', dataIndex: 'action', width: 95, render: (value: string) => {
                      const meta = actionMeta[value] || { label: value || '未知', color: 'default' }
                      return <Tag color={meta.color}>{meta.label}</Tag>
                    } },
                    { title: '记忆内容', dataIndex: 'content_preview', ellipsis: true, width: 280, render: (value?: string) => value || '-' },
                    { title: '类型', dataIndex: 'memory_type', width: 110, render: (value?: string) => <Tag color="blue">{value || 'unknown'}</Tag> },
                    { title: '重要性', dataIndex: 'importance', width: 85, render: (value?: number) => typeof value === 'number' ? `${Math.round(value * 100)}%` : '-' },
                    { title: '置信度', dataIndex: 'confidence', width: 85, render: (value?: number) => typeof value === 'number' ? `${Math.round(value * 100)}%` : '-' },
                    { title: '记忆 ID', dataIndex: 'memory_id', width: 190, ellipsis: true, render: (value?: string) => value || '-' },
                  ]}
                />
              </Card>
            </Space>
          ) : null}
        </Col>
      </Row>
    </PageContainer>
  )
}

import {
  ApartmentOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  FilterOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Flex,
  Form,
  Input,
  Progress,
  Row,
  Segmented,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  generateMemories,
  generateMemoriesAsync,
  generateMemoriesBatch,
  getMemoryGenerationStatus,
} from '@/api/modules/memory'
import type {
  MemoryAsyncGenerationStatus,
  MemoryBatchGenerationResult,
  MemoryExtractionType,
  MemoryGenerationDetail,
  MemoryGenerationPayload,
  MemoryGenerationResult,
} from '@/api/types'
import { FeedbackState, PageContainer } from '@/components/common'
import { getGenerationPreset, splitBatchText } from '@/constants/generation'
import { useAppStore } from '@/store'
import { getErrorMessage } from '@/utils/error'
import { showErrorMessage, showSuccessMessage, showWarningMessage } from '@/utils/feedback'

type GenerationMode = 'single' | 'batch' | 'async'
type PipelineState = 'idle' | 'running' | 'completed' | 'failed'

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
  sessionId?: string
  sourceRecordIds?: string
  metadataJson?: string
  extractionTypes: MemoryExtractionType[]
}

interface GenerationRow extends MemoryGenerationDetail {
  key: string
  batchIndex?: number
  sourceText?: string
}

interface AsyncTaskState {
  requestId: string
  status: MemoryAsyncGenerationStatus
  progress?: number
  message?: string
  error?: string
  submittedAt: number
  polling: boolean
}

interface StoredAsyncTask {
  version: 1
  requestId: string
  submittedAt: number
}

const ASYNC_TASK_STORAGE_KEY = 'memory-console:generation-task:v1'
const ASYNC_TASK_MAX_AGE = 30 * 60 * 1000

const extractionOptions: Array<{ label: string; value: MemoryExtractionType }> = [
  { label: '关键事实', value: 'key_fact' },
  { label: '任务状态', value: 'task_state' },
  { label: '历史决策', value: 'decision' },
  { label: '用户偏好', value: 'preference' },
  { label: '过程经验', value: 'process' },
  { label: '反馈信息', value: 'feedback' },
]

const stages: StageCardProps[] = [
  { number: '01', title: '关键信息抽取', description: '识别偏好、事实、任务状态、决策、过程与反馈。', icon: <FileSearchOutlined />, color: '#1677ff' },
  { number: '02', title: '结构化记忆生成', description: '生成包含类型、置信度、重要性与来源的记忆单元。', icon: <ApartmentOutlined />, color: '#20a47c' },
  { number: '03', title: '相似记忆召回', description: '结合语义、关键词和业务标识查找已有候选记忆。', icon: <FilterOutlined />, color: '#7b61d1' },
  { number: '04', title: '冲突识别与融合', description: '由后端决定新增、融合、更新、冲突或丢弃。', icon: <SafetyCertificateOutlined />, color: '#e49a28' },
  { number: '05', title: '有效记忆入库', description: '写入持久化存储，并返回真实记忆 ID 与处理明细。', icon: <DatabaseOutlined />, color: '#2471cf' },
]

const actionMeta: Record<string, { label: string; color: string }> = {
  keep_new: { label: '新增', color: 'green' },
  add: { label: '新增', color: 'green' },
  merge: { label: '融合', color: 'blue' },
  update_existing: { label: '更新', color: 'processing' },
  update: { label: '更新', color: 'processing' },
  discard: { label: '丢弃', color: 'default' },
  skip: { label: '丢弃', color: 'default' },
  conflict: { label: '冲突', color: 'warning' },
}

const asyncStatusMeta: Record<MemoryAsyncGenerationStatus, { label: string; color: string }> = {
  pending: { label: '等待处理', color: 'default' },
  processing: { label: '处理中', color: 'processing' },
  completed: { label: '已完成', color: 'success' },
  failed: { label: '处理失败', color: 'error' },
  not_found: { label: '任务不存在', color: 'error' },
}

function normalizeAction(value?: string) {
  return value?.trim().toLowerCase() || ''
}

function splitOptionalList(value = '') {
  return value.split(/[\r\n,，]+/).map((item) => item.trim()).filter(Boolean)
}

function parseMetadata(value?: string) {
  if (!value?.trim()) return undefined
  return JSON.parse(value) as Record<string, unknown>
}

function loadStoredAsyncTask(): AsyncTaskState | null {
  try {
    const raw = sessionStorage.getItem(ASYNC_TASK_STORAGE_KEY)
    if (!raw) return null
    const stored = JSON.parse(raw) as StoredAsyncTask
    if (stored.version !== 1 || !stored.requestId || Date.now() - stored.submittedAt > ASYNC_TASK_MAX_AGE) {
      sessionStorage.removeItem(ASYNC_TASK_STORAGE_KEY)
      return null
    }
    return { requestId: stored.requestId, submittedAt: stored.submittedAt, status: 'pending', polling: true }
  } catch {
    sessionStorage.removeItem(ASYNC_TASK_STORAGE_KEY)
    return null
  }
}

function storeAsyncTask(task: StoredAsyncTask | null) {
  if (task) sessionStorage.setItem(ASYNC_TASK_STORAGE_KEY, JSON.stringify(task))
  else sessionStorage.removeItem(ASYNC_TASK_STORAGE_KEY)
}

function StageCard({ number, title, description, icon, color, state }: StageCardProps & { state: PipelineState }) {
  const status = state === 'running'
    ? { label: '执行中', icon: <LoadingOutlined spin />, className: 'running' }
    : state === 'completed'
      ? { label: '已完成', icon: <CheckCircleFilled />, className: 'completed' }
      : state === 'failed'
        ? { label: '执行中断', icon: <ClockCircleOutlined />, className: 'failed' }
        : { label: '等待执行', icon: <ClockCircleOutlined />, className: 'idle' }

  return (
    <Card className={`console-card generation-stage ${status.className}`} variant="borderless">
      <Flex justify="space-between" align="flex-start">
        <span className="generation-number" style={{ color, background: `${color}15` }}>{number}</span>
        <span className="generation-icon" style={{ color }}>{icon}</span>
      </Flex>
      <Typography.Title level={5}>{title}</Typography.Title>
      <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
      <Flex className="generation-stage-status" align="center" gap={6}>{status.icon}<span>{status.label}</span></Flex>
    </Card>
  )
}

function formatScore(value?: number) {
  if (typeof value !== 'number') return '-'
  const percentage = value <= 1 ? value * 100 : value
  return `${Math.round(percentage)}%`
}

export default function GenerationPage() {
  const config = useAppStore((state) => state.config)
  const [searchParams] = useSearchParams()
  const preset = getGenerationPreset(searchParams.get('view'))
  const [form] = Form.useForm<GenerationFormValues>()
  const [mode, setMode] = useState<GenerationMode>('single')
  const [loading, setLoading] = useState(false)
  const [runError, setRunError] = useState<unknown>(null)
  const [singleResult, setSingleResult] = useState<MemoryGenerationResult | null>(null)
  const [batchResult, setBatchResult] = useState<MemoryBatchGenerationResult | null>(null)
  const [lastInputs, setLastInputs] = useState<string[]>([])
  const [focusedOnly, setFocusedOnly] = useState(Boolean(preset.focusActions || preset.focusMemoryTypes))
  const [asyncTask, setAsyncTask] = useState<AsyncTaskState | null>(loadStoredAsyncTask)

  useEffect(() => {
    form.setFieldValue('extractionTypes', preset.extractionTypes)
    setFocusedOnly(Boolean(preset.focusActions || preset.focusMemoryTypes))
  }, [form, preset])

  useEffect(() => {
    if (!asyncTask?.polling || ['completed', 'failed', 'not_found'].includes(asyncTask.status)) return

    let stopped = false
    let timer: number | undefined

    const schedule = (delay: number) => {
      timer = window.setTimeout(async () => {
        try {
          if (Date.now() - asyncTask.submittedAt > ASYNC_TASK_MAX_AGE) {
            const message = '异步任务已超过前端最大等待时间，请到记忆列表核对结果。'
            setAsyncTask((current) => current ? { ...current, polling: false, error: message } : current)
            setRunError(new Error(message))
            return
          }

          const status = await getMemoryGenerationStatus(asyncTask.requestId)
          if (stopped) return
          const terminal = ['completed', 'failed', 'not_found'].includes(status.status)
          setAsyncTask((current) => current ? {
            ...current,
            status: status.status,
            progress: status.progress,
            message: status.message,
            error: status.error || undefined,
            polling: !terminal,
          } : current)

          if (status.status === 'completed' && status.result) {
            setSingleResult(status.result)
            setRunError(null)
            storeAsyncTask(null)
            showSuccessMessage('异步记忆生成流水线执行完成')
            return
          }

          if (terminal) {
            const message = status.error || status.message || (status.status === 'not_found' ? '后端未找到该异步任务' : '异步记忆生成失败')
            setRunError(new Error(message))
            storeAsyncTask(null)
            return
          }

          schedule(status.status === 'pending' ? 1000 : 2000)
        } catch (error) {
          if (stopped) return
          const message = getErrorMessage(error, '查询异步任务状态失败')
          setAsyncTask((current) => current ? { ...current, polling: false, error: message } : current)
          setRunError(error)
        }
      }, delay)
    }

    schedule(asyncTask.status === 'pending' ? 1000 : 2000)
    return () => {
      stopped = true
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [asyncTask?.polling, asyncTask?.requestId, asyncTask?.status, asyncTask?.submittedAt])

  const isRunning = loading || Boolean(asyncTask?.polling)
  const activeResult = singleResult ?? batchResult
  const pipelineState: PipelineState = isRunning ? 'running' : activeResult ? 'completed' : runError ? 'failed' : 'idle'

  const summary = useMemo(() => {
    if (singleResult) return {
      memories: singleResult.memory_ids?.length ?? 0,
      added: singleResult.new_count ?? 0,
      merged: singleResult.merged_count ?? 0,
      discarded: singleResult.discarded_count ?? 0,
      updated: singleResult.updated_count ?? 0,
      conflicts: singleResult.conflict_count ?? 0,
    }
    if (batchResult) return {
      memories: batchResult.total_memories ?? 0,
      added: batchResult.total_new ?? 0,
      merged: batchResult.total_merged ?? 0,
      discarded: batchResult.total_discarded ?? 0,
      updated: batchResult.results.reduce((sum, result) => sum + (result.updated_count ?? 0), 0),
      conflicts: batchResult.results.reduce((sum, result) => sum + (result.conflict_count ?? 0), 0),
    }
    return null
  }, [batchResult, singleResult])

  const detailRows = useMemo<GenerationRow[]>(() => {
    if (singleResult) {
      return (singleResult.details ?? []).map((detail, index) => ({
        ...detail,
        key: `${detail.memory_id || 'single'}-${index}`,
        sourceText: lastInputs[0],
      }))
    }
    return batchResult?.results.flatMap((result, batchIndex) => (result.details ?? []).map((detail, index) => ({
      ...detail,
      key: `${batchIndex}-${detail.memory_id || index}`,
      batchIndex: batchIndex + 1,
      sourceText: lastInputs[batchIndex],
    }))) ?? []
  }, [batchResult, lastInputs, singleResult])

  const visibleRows = useMemo(() => {
    if (!focusedOnly) return detailRows
    const actions = preset.focusActions?.map(normalizeAction)
    const memoryTypes = preset.focusMemoryTypes?.map((item) => item.toLowerCase())
    return detailRows.filter((row) => {
      const actionMatch = actions?.includes(normalizeAction(row.action)) ?? false
      const typeMatch = memoryTypes?.includes(row.memory_type?.toLowerCase() || '') ?? false
      return actionMatch || typeMatch
    })
  }, [detailRows, focusedOnly, preset.focusActions, preset.focusMemoryTypes])

  const resetResults = () => {
    setSingleResult(null)
    setBatchResult(null)
    setRunError(null)
  }

  const handleModeChange = (value: string | number) => {
    setMode(value as GenerationMode)
    resetResults()
  }

  const handleGenerate = async (values: GenerationFormValues) => {
    const texts = splitBatchText(values.batchText)
    if (mode === 'batch' && texts.length > 50) {
      showWarningMessage('批量生成一次最多支持 50 条文本')
      return
    }

    setLoading(true)
    resetResults()
    try {
      const common = {
        user_id: config.userId,
        agent_id: config.agentId || undefined,
        scene_id: config.sceneId || undefined,
        task_id: values.taskId?.trim() || undefined,
        session_id: values.sessionId?.trim() || undefined,
        extraction_types: values.extractionTypes,
      }

      if (mode === 'batch') {
        setLastInputs(texts)
        setBatchResult(await generateMemoriesBatch({ ...common, texts }))
        showSuccessMessage('批量记忆生成流水线执行完成')
        return
      }

      const text = values.text!.trim()
      const payload: MemoryGenerationPayload = {
        ...common,
        text,
        source_record_ids: splitOptionalList(values.sourceRecordIds),
        metadata: parseMetadata(values.metadataJson),
      }
      if (!payload.source_record_ids?.length) delete payload.source_record_ids
      setLastInputs([text])

      if (mode === 'async') {
        const submitted = await generateMemoriesAsync(payload)
        const submittedAt = Date.now()
        setAsyncTask({
          requestId: submitted.request_id,
          status: 'pending',
          message: submitted.message,
          submittedAt,
          polling: true,
        })
        storeAsyncTask({ version: 1, requestId: submitted.request_id, submittedAt })
        showSuccessMessage('异步任务已提交，页面将自动查询进度')
        return
      }

      setSingleResult(await generateMemories(payload))
      showSuccessMessage('记忆生成流水线执行完成')
    } catch (error) {
      setRunError(error)
      showErrorMessage(error, '记忆生成失败')
    } finally {
      setLoading(false)
    }
  }

  const resumePolling = () => {
    setRunError(null)
    setAsyncTask((current) => current ? { ...current, polling: true, error: undefined } : current)
  }

  const hasFocus = Boolean(preset.focusActions || preset.focusMemoryTypes)
  const asyncMeta = asyncTask ? asyncStatusMeta[asyncTask.status] : null
  const asyncProgress = asyncTask?.progress === undefined
    ? 0
    : asyncTask.progress <= 1
      ? asyncTask.progress * 100
      : asyncTask.progress

  return (
    <PageContainer
      title={preset.title}
      description={preset.description}
      extra={<Space wrap><Tag color="green">真实 Pipeline</Tag><Tag color="blue">{preset.id === 'all' ? '完整能力' : '场景预设'}</Tag></Space>}
    >
      <Alert showIcon type="info" title={preset.guidance} description="统计和处理明细完全来自后端响应；页面不会伪造冲突、融合或过滤结果。" />

      <div className="generation-grid">
        {stages.map((stage) => <StageCard key={stage.number} {...stage} state={pipelineState} />)}
      </div>

      <Row gutter={[14, 14]}>
        <Col xs={24} xl={9}>
          <Card className="console-card generation-workbench" title="生成请求" variant="borderless">
            <Segmented
              block
              disabled={isRunning}
              value={mode}
              options={[
                { label: '单条同步', value: 'single' },
                { label: '批量同步', value: 'batch' },
                { label: '单条异步', value: 'async' },
              ]}
              onChange={handleModeChange}
            />
            <Alert
              showIcon
              type="warning"
              title={mode === 'batch' ? '每行一条文本，一次最多 50 条' : '单条文本最多 10,000 字符'}
              description={mode === 'async'
                ? '提交后按后端 request_id 自动轮询；刷新页面后会在当前浏览器会话内继续查询。'
                : '生成可能需要数秒。请求超时不代表后端未写入，请先到记忆列表核对，避免立即重复提交。'}
            />
            <Form<GenerationFormValues>
              form={form}
              layout="vertical"
              initialValues={{ extractionTypes: preset.extractionTypes }}
              onFinish={(values) => void handleGenerate(values)}
            >
              {mode === 'batch' ? (
                <Form.Item
                  name="batchText"
                  label="批量文本"
                  rules={[
                    { required: true, whitespace: true, message: '请输入至少一条文本' },
                    { validator: (_, value) => splitBatchText(value).length <= 50 ? Promise.resolve() : Promise.reject(new Error('一次最多输入 50 条文本')) },
                  ]}
                >
                  <Input.TextArea rows={9} placeholder={'用户偏好使用 TypeScript\n项目采用 React 构建前端\n任务目标是完成接口联调'} />
                </Form.Item>
              ) : (
                <Form.Item name="text" label="输入文本" rules={[{ required: true, whitespace: true, message: '请输入需要生成记忆的文本' }, { max: 10000, message: '文本不能超过 10,000 个字符' }]}>
                  <Input.TextArea rows={7} showCount maxLength={10000} placeholder="例如：用户偏好使用 TypeScript，当前任务是完成记忆管理控制台。" />
                </Form.Item>
              )}
              <Form.Item name="extractionTypes" label="抽取类型" rules={[{ required: true, message: '请至少选择一种抽取类型' }]}>
                <Checkbox.Group className="generation-extraction-options" options={extractionOptions} />
              </Form.Item>
              <Form.Item name="taskId" label="Task ID（可选）">
                <Input placeholder="用于关联长期任务，例如 task_001" />
              </Form.Item>
              <Collapse
                size="small"
                className="generation-advanced"
                items={[{
                  key: 'advanced',
                  label: '高级参数（可选）',
                  children: (
                    <>
                      <Form.Item name="sessionId" label="Session ID">
                        <Input placeholder="例如 session_001" />
                      </Form.Item>
                      {mode !== 'batch' ? (
                        <>
                          <Form.Item name="sourceRecordIds" label="来源记录 ID" extra="使用逗号或换行分隔">
                            <Input.TextArea rows={2} placeholder="record_001, record_002" />
                          </Form.Item>
                          <Form.Item
                            name="metadataJson"
                            label="Metadata JSON"
                            rules={[{
                              validator: (_, value) => {
                                if (!value?.trim()) return Promise.resolve()
                                try {
                                  const parsed = JSON.parse(value)
                                  return parsed && !Array.isArray(parsed) && typeof parsed === 'object'
                                    ? Promise.resolve()
                                    : Promise.reject(new Error('Metadata 必须是 JSON 对象'))
                                } catch {
                                  return Promise.reject(new Error('请输入有效的 JSON 对象'))
                                }
                              },
                            }]}
                          >
                            <Input.TextArea rows={3} placeholder={'{"source":"console"}'} />
                          </Form.Item>
                        </>
                      ) : null}
                    </>
                  ),
                }]}
              />
              <Flex gap={6} wrap className="generation-request-context">
                <Tag color="blue">User：{config.userId}</Tag>
                <Tag>Scene：{config.sceneId || '未设置'}</Tag>
                <Tag>Agent：{config.agentId || '未设置'}</Tag>
              </Flex>
              <Button type="primary" htmlType="submit" icon={<ThunderboltOutlined />} loading={loading} disabled={Boolean(asyncTask?.polling)} block>
                {mode === 'single' ? '同步生成结构化记忆' : mode === 'batch' ? '批量生成记忆' : '提交异步生成任务'}
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} xl={15}>
          {asyncTask ? (
            <Card className="console-card generation-async-status" title="异步任务状态" variant="borderless">
              <Flex vertical gap={10}>
                <Flex justify="space-between" gap={12} wrap>
                  <Typography.Text copyable={{ text: asyncTask.requestId }}>Request ID：{asyncTask.requestId}</Typography.Text>
                  {asyncMeta ? <Tag color={asyncMeta.color}>{asyncMeta.label}</Tag> : null}
                </Flex>
                <Progress percent={Math.round(Math.max(0, Math.min(100, asyncProgress)))} status={asyncTask.status === 'failed' || asyncTask.status === 'not_found' ? 'exception' : asyncTask.status === 'completed' ? 'success' : 'active'} />
                {asyncTask.message ? <Typography.Text type="secondary">{asyncTask.message}</Typography.Text> : null}
                {asyncTask.error && !asyncTask.polling ? (
                  <Alert type="error" showIcon title={asyncTask.error} action={<Button size="small" icon={<ReloadOutlined />} onClick={resumePolling}>重新查询状态</Button>} />
                ) : null}
              </Flex>
            </Card>
          ) : null}

          {loading ? <FeedbackState status="loading" title="记忆生成中" description="后端正在抽取、生成、去重并写入记忆，请不要重复提交。" /> : null}
          {!loading && runError && !activeResult ? <FeedbackState status="error" title="记忆生成未完成" error={runError} action={asyncTask && !asyncTask.polling ? <Button icon={<ReloadOutlined />} onClick={resumePolling}>重新查询异步状态</Button> : undefined} /> : null}
          {!loading && !runError && !activeResult ? (
            <Card className="console-card generation-empty" variant="borderless">
              <DatabaseOutlined />
              <Typography.Title level={4}>等待执行生成流水线</Typography.Title>
              <Typography.Text type="secondary">提交左侧文本后，这里会展示后端返回的真实统计、逐条决策和记忆 ID。</Typography.Text>
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
                  ['丢弃', summary.discarded, '#8c96a6'],
                  ['冲突', summary.conflicts, '#e49a28'],
                ].map(([label, value, color]) => (
                  <Card className="console-card result-stat" key={String(label)} variant="borderless">
                    <Typography.Text type="secondary">{label}</Typography.Text>
                    <strong style={{ color: String(color) }}>{value}</strong>
                  </Card>
                ))}
              </div>
              <Card
                className="console-card"
                title={`处理明细（${visibleRows.length}/${detailRows.length}）`}
                extra={hasFocus ? <Flex align="center" gap={8}><Typography.Text type="secondary">仅看{preset.focusLabel}</Typography.Text><Switch size="small" checked={focusedOnly} onChange={setFocusedOnly} /></Flex> : null}
                variant="borderless"
              >
                <Table<GenerationRow>
                  rowKey="key"
                  dataSource={visibleRows}
                  locale={{ emptyText: focusedOnly ? `本次后端未返回${preset.focusLabel || '聚焦'}明细，可关闭筛选查看全部结果。` : '本次没有生成有效记忆或处理明细。' }}
                  pagination={{ pageSize: 8 }}
                  scroll={{ x: 1280 }}
                  columns={[
                    { title: '来源输入', dataIndex: 'sourceText', ellipsis: true, width: 250, render: (value?: string) => value || '-' },
                    ...(mode === 'batch' ? [{ title: '输入序号', dataIndex: 'batchIndex', width: 85 }] : []),
                    { title: '处理结果', dataIndex: 'action', width: 95, render: (value: string) => {
                      const normalized = normalizeAction(value)
                      const meta = actionMeta[normalized] || { label: value || '未知', color: 'default' }
                      return <Tag color={meta.color}>{meta.label}</Tag>
                    } },
                    { title: '记忆内容', dataIndex: 'content_preview', ellipsis: true, width: 280, render: (value?: string) => value || '-' },
                    { title: '类型', dataIndex: 'memory_type', width: 110, render: (value?: string) => value ? <Tag color="blue">{value}</Tag> : '-' },
                    { title: '重要性', dataIndex: 'importance', width: 85, render: formatScore },
                    { title: '置信度', dataIndex: 'confidence', width: 85, render: formatScore },
                    { title: '记忆 ID', dataIndex: 'memory_id', width: 200, ellipsis: true, render: (value?: string) => value ? <Typography.Text copyable={{ text: value }}>{value}</Typography.Text> : '-' },
                    { title: '后端说明', dataIndex: 'message', ellipsis: true, width: 220, render: (value?: string) => value || '-' },
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

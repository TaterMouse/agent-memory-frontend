import { FilterOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Card, Col, Flex, Form, Input, Row, Select, Space, Switch, Table, Tag, Typography } from 'antd'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { MemoryItem, MemorySearchResult } from '@/api/types'
import { searchMemories } from '@/api/modules/memory'
import { FeedbackState, PageContainer } from '@/components/common'
import { useAppStore } from '@/store'
import { showErrorMessage } from '@/utils/feedback'

interface RetrievalFormValues {
  query: string
  memoryType: string
  status: string
  sceneId: string
  sessionId: string
  topK: number
  rerank: boolean
}

type RetrievalMode = 'all' | 'semantic' | 'keyword' | 'metadata' | 'fusion' | 'topK'

const retrievalMeta: Record<RetrievalMode, {
  title: string
  description: string
  queryLabel: string
  placeholder: string
  strategy: string
  steps: Array<[string, string, string]>
}> = {
  all: {
    title: '多信号融合记忆检索',
    description: '综合语义向量、关键词、元数据过滤和二次排序，定位与当前请求最相关的记忆。',
    queryLabel: '检索内容',
    placeholder: '例如：用户上次确认的物流调度方案',
    strategy: '语义 + 规则',
    steps: [['01', '语义向量召回', '理解查询含义，找到语义相近的历史记忆。'], ['02', '关键词与元数据过滤', '结合用户、场景、任务、类型和状态缩小范围。'], ['03', '融合排序与 Top-K', '综合相关度与时效性，返回最适合的结果。']],
  },
  semantic: {
    title: '语义向量检索',
    description: '根据查询语义而非字面词语，召回含义相近的历史记忆。',
    queryLabel: '自然语言查询',
    placeholder: '例如：用户更偏好怎样的配送安排',
    strategy: '向量相似度',
    steps: [['01', '查询向量化', '将自然语言转换为语义向量。'], ['02', '相似度召回', '在向量索引中查找相近记忆。'], ['03', '相关度排序', '按语义相似度输出候选结果。']],
  },
  keyword: {
    title: '关键词检索',
    description: '使用明确关键词、编号或业务实体定位包含对应信息的记忆。',
    queryLabel: '关键词或实体',
    placeholder: '例如：冷链、订单 A-1023、济南仓',
    strategy: '关键词匹配',
    steps: [['01', '关键词拆分', '识别查询中的业务词和实体。'], ['02', '倒排匹配', '匹配包含关键词的记忆内容。'], ['03', '命中排序', '按命中数量和位置排序结果。']],
  },
  metadata: {
    title: '元数据过滤',
    description: '通过记忆类型、状态、场景和任务范围缩小候选集合。',
    queryLabel: '辅助查询',
    placeholder: '可输入辅助词语，也可只使用下方筛选条件',
    strategy: '字段过滤',
    steps: [['01', '选择字段', '指定类型、状态和业务范围。'], ['02', '过滤候选集', '排除不符合条件的记忆。'], ['03', '返回结果', '展示过滤后的结构化记录。']],
  },
  fusion: {
    title: '融合排序',
    description: '融合语义、关键词、时效性和业务权重，对候选记忆进行二次排序。',
    queryLabel: '综合查询',
    placeholder: '例如：查找最近确认且仍有效的调度方案',
    strategy: '多信号重排',
    steps: [['01', '多路召回', '并行获得语义和关键词候选。'], ['02', '特征融合', '加入类型、状态和时效性信号。'], ['03', '二次排序', '重新计算综合得分并排序。']],
  },
  topK: {
    title: 'Top-K 返回',
    description: '设置最终返回数量，只保留得分最高的 K 条相关记忆。',
    queryLabel: '检索内容',
    placeholder: '例如：本次任务最需要参考的历史经验',
    strategy: 'Top-K 截断',
    steps: [['01', '生成候选', '先完成基础召回和排序。'], ['02', '设置 K 值', '选择需要返回的结果数量。'], ['03', '截断返回', '仅保留排名最高的 K 条记忆。']],
  },
}

function getRetrievalMode(pathname: string): RetrievalMode {
  if (pathname.endsWith('/semantic')) return 'semantic'
  if (pathname.endsWith('/keyword')) return 'keyword'
  if (pathname.endsWith('/metadata')) return 'metadata'
  if (pathname.endsWith('/fusion')) return 'fusion'
  if (pathname.endsWith('/top-k')) return 'topK'
  return 'all'
}

export default function RetrievalPage() {
  const { pathname } = useLocation()
  const mode = getRetrievalMode(pathname)
  const pageMeta = retrievalMeta[mode]
  const config = useAppStore((state) => state.config)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MemorySearchResult | null>(null)

  const handleSearch = async (values: RetrievalFormValues) => {
    setLoading(true)
    try {
      setResult(await searchMemories({
        query: values.query?.trim() || '筛选全部记忆',
        user_id: config.userId,
        scene_id: values.sceneId?.trim() || undefined,
        session_id: values.sessionId?.trim() || undefined,
        memory_types: !values.memoryType || values.memoryType === 'all' ? undefined : [values.memoryType],
        status: !values.status || values.status === 'all' ? undefined : [values.status],
        top_k: values.topK,
        rerank: mode === 'fusion' || mode === 'all' ? values.rerank : false,
        max_content_length: 500,
      }))
    } catch (error) {
      setResult(null)
      showErrorMessage(error, '记忆检索失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer
      title={pageMeta.title}
      description={pageMeta.description}
      extra={
        <Space>
          <Tag color="blue">用户：{config.userId}</Tag>
          <Tag color="cyan">默认检索全部场景</Tag>
        </Space>
      }
    >
      <Card className="console-card" variant="borderless">
        <Form<RetrievalFormValues>
          key={mode}
          layout="vertical"
          initialValues={{ memoryType: 'all', status: 'active', topK: mode === 'topK' ? 5 : 10, rerank: mode === 'fusion' || mode === 'all' }}
          onFinish={(values) => void handleSearch(values)}
        >
          <Row gutter={12} align="bottom">
            <Col xs={24} lg={mode === 'metadata' ? 8 : 10}>
              <Form.Item name="query" label={pageMeta.queryLabel} rules={mode === 'metadata' ? undefined : [{ required: true, whitespace: true, message: '请输入检索内容' }]}>
                <Input prefix={<SearchOutlined />} placeholder={pageMeta.placeholder} />
              </Form.Item>
            </Col>
            {mode !== 'semantic' && mode !== 'topK' ? <Col xs={12} sm={8} lg={4}>
              <Form.Item name="memoryType" label="记忆类型">
                <Select options={[
                  { value: 'all', label: '全部类型' },
                  { value: 'preference', label: '用户偏好' },
                  { value: 'fact', label: '关键事实' },
                  { value: 'task', label: '任务状态' },
                  { value: 'decision', label: '历史决策' },
                  { value: 'constraint', label: '约束条件' },
                ]} />
              </Form.Item>
            </Col> : null}
            {mode === 'metadata' || mode === 'fusion' || mode === 'all' ? <Col xs={12} sm={8} lg={3}>
              <Form.Item name="status" label="记忆状态">
                <Select options={[{ value: 'all', label: '全部' }, { value: 'active', label: '有效' }, { value: 'archived', label: '已归档' }]} />
              </Form.Item>
            </Col> : null}
            <Col xs={12} sm={8} lg={4}>
              <Form.Item name="sceneId" label="Scene ID（可选）">
                <Input placeholder="留空检索全部场景" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Form.Item name="sessionId" label="Session ID（可选）">
                <Input placeholder="sess_xxx" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8} lg={3}>
              <Form.Item name="topK" label="返回数量">
                <Select options={[5, 10, 20, 50].map((value) => ({ value, label: `Top ${value}` }))} />
              </Form.Item>
            </Col>
            {mode === 'fusion' || mode === 'all' ? <Col xs={12} sm={8} lg={2}>
              <Form.Item name="rerank" label="二次排序" valuePropName="checked"><Switch /></Form.Item>
            </Col> : null}
            <Col xs={24} sm={8} lg={2}>
              <Form.Item label=" "><Button type="primary" htmlType="submit" icon={<FilterOutlined />} loading={loading} block>检索</Button></Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {loading ? <FeedbackState status="loading" description="正在融合多个检索信号…" /> : null}
      {!loading && !result ? (
        <Card className="console-card retrieval-guide" variant="borderless">
          <Row gutter={[20, 20]}>
            {pageMeta.steps.map(([number, title, description]) => (
              <Col xs={24} md={8} key={number}>
                <Flex gap={12}><span>{number}</span><div><Typography.Text strong>{title}</Typography.Text><Typography.Paragraph type="secondary">{description}</Typography.Paragraph></div></Flex>
              </Col>
            ))}
          </Row>
        </Card>
      ) : null}
      {!loading && result ? (
        <Space orientation="vertical" size={14} style={{ display: 'flex' }}>
          <Row gutter={[12, 12]}>
            <Col xs={12} md={6}><Card className="console-card result-stat"><Typography.Text type="secondary">返回结果</Typography.Text><strong>{result.results.length}</strong></Card></Col>
            <Col xs={12} md={6}><Card className="console-card result-stat"><Typography.Text type="secondary">候选记忆</Typography.Text><strong>{result.total_candidates}</strong></Card></Col>
            <Col xs={12} md={6}><Card className="console-card result-stat"><Typography.Text type="secondary">检索耗时</Typography.Text><strong>{result.elapsed_ms} ms</strong></Card></Col>
            <Col xs={12} md={6}><Card className="console-card result-stat"><Typography.Text type="secondary">当前策略</Typography.Text><strong>{pageMeta.strategy}</strong></Card></Col>
          </Row>
          <Card className="console-card" title={`检索结果：${result.query}`} variant="borderless">
            <Table<MemoryItem>
              rowKey="memory_id"
              dataSource={result.results}
              pagination={{ pageSize: 10 }}
              columns={[
                { title: '记忆内容', dataIndex: 'content', ellipsis: true },
                { title: '类型', dataIndex: 'memory_type', width: 110, render: (value?: string) => <Tag color="blue">{value || 'unknown'}</Tag> },
                { title: '场景', dataIndex: 'scene_id', width: 120, render: (value?: string) => value || '-' },
                { title: '相关度', dataIndex: 'relevance_score', width: 90, render: (value?: number) => typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : '-' },
                { title: '创建时间', dataIndex: 'created_at', width: 180, render: (value?: string) => value ? new Date(value).toLocaleString('zh-CN') : '-' },
              ]}
            />
          </Card>
        </Space>
      ) : null}
    </PageContainer>
  )
}

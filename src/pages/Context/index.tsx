import { CodeOutlined, FileTextOutlined, SendOutlined } from '@ant-design/icons'
import { Button, Card, Col, Form, Input, InputNumber, Row, Segmented, Space, Tag, Typography } from 'antd'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { MemoryContextResult } from '@/api/types'
import { getMemoryContext } from '@/api/modules/memory'
import { FeedbackState, PageContainer } from '@/components/common'
import { useAppStore } from '@/store'
import { showErrorMessage } from '@/utils/feedback'

interface ContextFormValues {
  query: string
  maxTokens: number
  groupByType: boolean
}

type ContextMode = 'all' | 'json' | 'text' | 'relevance' | 'length'

const contextMeta: Record<ContextMode, {
  title: string
  description: string
  requestTitle: string
  previewTitle: string
  rules: Array<[string, string, string]>
}> = {
  all: {
    title: '记忆上下文返回',
    description: '根据外部智能体请求筛选相关记忆，并返回结构化 JSON 或可直接注入模型的文本片段。',
    requestTitle: '上下文请求',
    previewTitle: '上下文返回预览',
    rules: [['相关性', 'blue', '优先保留与当前任务高度相关的记忆'], ['有效性', 'green', '默认只返回 active 状态记忆'], ['长度控制', 'gold', '超过限制时按优先级压缩'], ['分类组织', 'purple', '按偏好、事实、任务和决策分组']],
  },
  json: {
    title: '结构化 JSON 返回',
    description: '返回可供程序继续处理的记忆片段、数量、Token 估算和分组信息。',
    requestTitle: 'JSON 上下文请求',
    previewTitle: 'JSON 响应预览',
    rules: [['结构稳定', 'blue', '统一输出 formatted_text、memory_count 等字段'], ['类型分组', 'purple', '可按偏好、事实、任务和决策组织片段'], ['便于解析', 'green', '适用于工作流、工具调用和二次处理']],
  },
  text: {
    title: '文本上下文片段返回',
    description: '生成可直接交给外部智能体使用的连续文本，不提供实时聊天界面。',
    requestTitle: '文本片段请求',
    previewTitle: '可注入文本预览',
    rules: [['自然语言', 'blue', '将多条记忆整理为连续文本'], ['保留重点', 'green', '优先包含高相关事实和任务状态'], ['直接注入', 'purple', '可作为外部智能体的补充上下文']],
  },
  relevance: {
    title: '上下文相关性筛选',
    description: '围绕当前任务查询筛选记忆，排除无关、失效或跨场景内容。',
    requestTitle: '相关性筛选条件',
    previewTitle: '筛选结果预览',
    rules: [['任务匹配', 'blue', '优先匹配当前请求目标'], ['场景隔离', 'green', '限定当前 Scene ID 范围'], ['状态过滤', 'gold', '排除归档或失效记忆'], ['冲突控制', 'purple', '优先采用更新且可信的内容']],
  },
  length: {
    title: '上下文长度控制与压缩',
    description: '依据 Token 预算裁剪和压缩记忆内容，在长度限制内尽量保留关键信息。',
    requestTitle: '长度预算设置',
    previewTitle: '压缩文本预览',
    rules: [['预算优先', 'blue', '严格遵守最大 Token 数'], ['分级压缩', 'gold', '先合并重复内容，再移除低价值细节'], ['关键信息', 'green', '保留目标、约束、决策和未完成事项']],
  },
}

function getContextMode(pathname: string): ContextMode {
  if (pathname.endsWith('/json')) return 'json'
  if (pathname.endsWith('/text')) return 'text'
  if (pathname.endsWith('/relevance')) return 'relevance'
  if (pathname.endsWith('/length')) return 'length'
  return 'all'
}

export default function ContextPage() {
  const { pathname } = useLocation()
  const mode = getContextMode(pathname)
  const pageMeta = contextMeta[mode]
  const config = useAppStore((state) => state.config)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MemoryContextResult | null>(null)
  const [preview, setPreview] = useState<'json' | 'text'>('json')
  const activePreview = mode === 'text' || mode === 'length' ? 'text' : mode === 'all' ? preview : 'json'

  const handleGenerate = async (values: ContextFormValues) => {
    setLoading(true)
    try {
      setResult(await getMemoryContext({
        query: values.query.trim(),
        user_id: config.userId,
        scene_id: config.sceneId || undefined,
        max_tokens: values.maxTokens,
        group_by_type: values.groupByType,
      }))
    } catch (error) {
      setResult(null)
      showErrorMessage(error, '上下文生成失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer
      title={pageMeta.title}
      description={pageMeta.description}
      extra={<Tag color="green">非实时聊天模块</Tag>}
    >
      <Row gutter={[14, 14]}>
        <Col xs={24} xl={9}>
          <Card className="console-card" title={pageMeta.requestTitle} variant="borderless">
            <Form<ContextFormValues>
              key={mode}
              layout="vertical"
              initialValues={{ maxTokens: mode === 'length' ? 1200 : 3000, groupByType: true }}
              onFinish={(values) => void handleGenerate(values)}
            >
              <Form.Item name="query" label="当前任务或查询" rules={[{ required: true, whitespace: true, message: '请输入查询内容' }]}>
                <Input.TextArea rows={5} placeholder="例如：为物流调度任务返回用户偏好、历史决策和未完成事项" />
              </Form.Item>
              <Row gutter={12}>
                <Col span={mode === 'json' || mode === 'all' ? 12 : 24}>
                  <Form.Item name="maxTokens" label="最大 Token 数">
                    <InputNumber min={200} max={10000} step={200} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                {mode === 'json' || mode === 'all' ? <Col span={12}>
                  <Form.Item name="groupByType" label="按类型分组">
                    <Segmented block options={[{ label: '分组', value: true }, { label: '平铺', value: false }]} />
                  </Form.Item>
                </Col> : null}
              </Row>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading} block>
                生成上下文
              </Button>
            </Form>
          </Card>
          <Card className="console-card context-rule-card" title="当前处理规则" variant="borderless">
            <Space orientation="vertical" size={10}>
              {pageMeta.rules.map(([label, color, text]) => (
                <Typography.Text key={label}><Tag color={color}>{label}</Tag>{text}</Typography.Text>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} xl={15}>
          <Card
            className="console-card context-preview-card"
            title={pageMeta.previewTitle}
            extra={mode === 'all' ? <Segmented value={preview} options={[{ label: 'JSON 返回', value: 'json', icon: <CodeOutlined /> }, { label: '文本片段', value: 'text', icon: <FileTextOutlined /> }]} onChange={(value) => setPreview(value as 'json' | 'text')} /> : <Tag color="blue">{activePreview === 'json' ? 'JSON' : 'TEXT'}</Tag>}
            variant="borderless"
          >
            {loading ? <FeedbackState status="loading" description="正在筛选并组织记忆上下文…" /> : null}
            {!loading && !result ? (
              <div className="context-placeholder">
                <FileTextOutlined />
                <Typography.Title level={5}>等待生成上下文</Typography.Title>
                <Typography.Text type="secondary">填写左侧查询条件后，可在此查看接口实际返回。</Typography.Text>
              </div>
            ) : null}
            {!loading && result && activePreview === 'json' ? (
              <pre className="context-code context-code-large">{JSON.stringify(result, null, 2)}</pre>
            ) : null}
            {!loading && result && activePreview === 'text' ? (
              <div className="context-text-preview">
                <Typography.Paragraph copyable style={{ whiteSpace: 'pre-wrap' }}>{result.formatted_text || '本次没有可返回的上下文。'}</Typography.Paragraph>
              </div>
            ) : null}
          </Card>
          {result ? (
            <Row gutter={12} style={{ marginTop: 14 }}>
              <Col span={8}><Card className="console-card result-stat"><Typography.Text type="secondary">引用记忆</Typography.Text><strong>{result.memory_count}</strong></Card></Col>
              <Col span={8}><Card className="console-card result-stat"><Typography.Text type="secondary">预估 Token</Typography.Text><strong>{result.estimated_tokens ?? '-'}</strong></Card></Col>
              <Col span={8}><Card className="console-card result-stat"><Typography.Text type="secondary">返回状态</Typography.Text><strong style={{ color: '#20a47c' }}>已生成</strong></Card></Col>
            </Row>
          ) : null}
        </Col>
      </Row>
    </PageContainer>
  )
}

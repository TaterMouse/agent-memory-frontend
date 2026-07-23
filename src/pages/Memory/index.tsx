import { DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Card, Col, Flex, Form, Input, InputNumber, Modal, Row, Select, Space, Table, Tag, Typography } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { MemoryItem, MemoryLevel, MemoryStatsResult } from '@/api/types'
import { deleteMemory, getMemoryStats, listMemories, searchMemories, updateMemory } from '@/api/modules/memory'
import { MemoryFilterBar } from '@/components/business/MemoryFilterBar'
import { FeedbackState, PageContainer, openConfirmDialog } from '@/components/common'
import { useAppStore, useMemoryStore } from '@/store'
import { showErrorMessage, showSuccessMessage, showWarningMessage } from '@/utils/feedback'

type MemoryScope = 'all' | 'user' | 'session' | 'task'

interface MemoryEditValues {
  content: string
  summary?: string
  status?: string
  importance?: number
  confidence?: number
  tags?: string
}

const memoryLevelCards: Array<{
  level: MemoryLevel
  title: string
  description: string
  color: string
}> = [
  { level: 'user', title: '用户级记忆', description: '用户偏好与稳定事实', color: '#1677ff' },
  { level: 'session', title: '会话级记忆', description: '历史会话摘要与上下文', color: '#20a47c' },
  { level: 'task', title: '任务级记忆', description: '目标、进展与执行结果', color: '#e49a28' },
  { level: 'agent', title: '智能体级记忆', description: '智能体能力、流程与状态经验', color: '#7b61d1' },
]

const memoryCountFormatter = new Intl.NumberFormat('zh-CN')
const memoryRatioFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'percent',
  maximumFractionDigits: 1,
})

const scopeMeta: Record<MemoryScope, { title: string; description: string; tableTitle: string }> = {
  all: {
    title: '通用记忆建模与多层记忆管理',
    description: '统一管理用户、会话、任务和智能体级记忆，支持检索、修正、归档与删除。',
    tableTitle: '全部记忆单元',
  },
  user: {
    title: '用户级记忆',
    description: '集中维护当前用户的长期偏好、稳定事实、习惯和约束条件。',
    tableTitle: '用户画像记忆',
  },
  session: {
    title: '会话级记忆',
    description: '按照 Session ID 查看历史会话摘要、关键事实和上下文线索。',
    tableTitle: '会话记忆记录',
  },
  task: {
    title: '任务级记忆',
    description: '按照 Task ID 管理任务目标、执行进展、结果和待办事项。',
    tableTitle: '任务过程记忆',
  },
}

function getMemoryScope(pathname: string): MemoryScope {
  if (pathname.endsWith('/user')) return 'user'
  if (pathname.endsWith('/session')) return 'session'
  if (pathname.endsWith('/task')) return 'task'
  return 'all'
}

export default function MemoryPage() {
  const [editForm] = Form.useForm<MemoryEditValues>()
  const { pathname } = useLocation()
  const scope = getMemoryScope(pathname)
  const pageMeta = scopeMeta[scope]
  const config = useAppStore((state) => state.config)
  const memories = useMemoryStore((state) => state.memories)
  const setMemories = useMemoryStore((state) => state.setMemories)
  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState('all')
  const [rerank, setRerank] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [scopeId, setScopeId] = useState('')
  const [listPage, setListPage] = useState(1)
  const [listPageSize, setListPageSize] = useState(20)
  const [listTotal, setListTotal] = useState(0)
  const [memoryStats, setMemoryStats] = useState<MemoryStatsResult | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState<unknown>(null)
  const [isSearchResult, setIsSearchResult] = useState(false)
  const [selectedMemoryIds, setSelectedMemoryIds] = useState<string[]>([])
  const [deleteMode, setDeleteMode] = useState(false)

  useEffect(() => {
    setScopeId('')
    setSelectedMemoryIds([])
    setDeleteMode(false)
  }, [scope])

  useEffect(() => {
    setSelectedMemoryIds([])
    setDeleteMode(false)
  }, [config.userId])

  // 层级和 Session/Task ID 已经由后端分页过滤，页面不再对当前页样本做二次层级过滤。
  // 否则当匹配数据超过单页上限时，前端会得到错误的总数和不完整的结果。
  const visibleMemories = memories
  const scopeFilterId = scope === 'session' || scope === 'task' ? scopeId.trim() || undefined : undefined

  const visibleMemoryIds = useMemo(
    () => visibleMemories.map((memory) => memory.memory_id),
    [visibleMemories],
  )
  const allVisibleSelected = visibleMemoryIds.length > 0
    && visibleMemoryIds.every((memoryId) => selectedMemoryIds.includes(memoryId))

  const loadAllMemories = useCallback(async (page = 1, pageSize = 20, scopeIdValue?: string) => {
    setLoading(true)
    setError(null)
    try {
      const normalizedScopeId = scopeIdValue?.trim() || undefined
      const result = await listMemories({
        userId: config.userId,
        memoryScope: scope === 'all' ? undefined : scope,
        sessionId: scope === 'session' ? normalizedScopeId : undefined,
        taskId: scope === 'task' ? normalizedScopeId : undefined,
        page,
        pageSize,
      })
      setMemories(result.items)
      setListPage(result.page || page)
      setListPageSize(result.page_size || pageSize)
      setListTotal(result.total)
      setIsSearchResult(false)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setLoading(false)
    }
  }, [config.userId, scope, setMemories])

  const loadMemoryStats = useCallback(async () => {
    setStatsLoading(true)
    setStatsError(null)
    try {
      setMemoryStats(await getMemoryStats(config.userId))
    } catch (loadError) {
      setMemoryStats(null)
      setStatsError(loadError)
    } finally {
      setStatsLoading(false)
    }
  }, [config.userId])

  useEffect(() => {
    const requests: Promise<void>[] = [loadAllMemories(1, 20)]
    if (scope === 'all') requests.push(loadMemoryStats())
    void Promise.all(requests)
  }, [loadAllMemories, loadMemoryStats, scope])

  const handleRefresh = async () => {
    const requests: Promise<void>[] = [loadAllMemories(1, listPageSize, scopeFilterId)]
    if (scope === 'all') requests.push(loadMemoryStats())
    await Promise.all(requests)
  }

  const handleSearch = async () => {
    if (!keyword.trim()) {
      await loadAllMemories(1, listPageSize, scopeFilterId)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await searchMemories({
        query: keyword.trim(),
        user_id: config.userId,
        memory_types: type === 'all' ? undefined : [type],
        top_k: 50,
        rerank,
        session_id: scope === 'session' ? scopeFilterId : undefined,
        task_id: scope === 'task' ? scopeFilterId : undefined,
      })
      setMemories(result.results)
      setListTotal(result.results.length)
      setIsSearchResult(true)
      setSelectedMemoryIds([])
    } catch (searchError) {
      setError(searchError)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (memory: MemoryItem) => {
    setEditingMemory(memory)
    editForm.setFieldsValue({
      content: memory.content,
      summary: memory.summary,
      status: memory.status || 'active',
      importance: memory.importance,
      confidence: memory.confidence,
      tags: memory.tags?.join(', '),
    })
  }

  const handleSave = async () => {
    if (!editingMemory) return
    let values: MemoryEditValues
    try {
      values = await editForm.validateFields()
    } catch {
      return
    }
    const tags = values.tags?.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean)
    setSaving(true)
    try {
      await updateMemory({
        memory_id: editingMemory.memory_id,
        content: values.content.trim(),
        summary: values.summary?.trim() || undefined,
        status: values.status,
        importance: values.importance,
        confidence: values.confidence,
        tags,
      })
      setMemories(memories.map((memory) =>
        memory.memory_id === editingMemory.memory_id
          ? {
              ...memory,
              content: values.content.trim(),
              summary: values.summary?.trim() || undefined,
              status: values.status,
              importance: values.importance,
              confidence: values.confidence,
              tags,
              updated_at: new Date().toISOString(),
            }
          : memory,
      ))
      setEditingMemory(null)
      showSuccessMessage('记忆已更新')
    } catch (saveError) {
      showErrorMessage(saveError, '更新记忆失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (memory: MemoryItem) => {
    openConfirmDialog({
      title: '删除这条记忆？',
      content: memory.content,
      onOk: async () => {
        await deleteMemory(memory.memory_id, '用户在前端删除')
        setMemories(memories.filter((item) => item.memory_id !== memory.memory_id))
        setSelectedMemoryIds((ids) => ids.filter((id) => id !== memory.memory_id))
        setListTotal((total) => Math.max(0, total - 1))
        if (scope === 'all') await loadMemoryStats()
        showSuccessMessage('记忆已删除')
      },
    })
  }

  const handleDeleteSelected = () => {
    if (!selectedMemoryIds.length) return
    openConfirmDialog({
      title: `删除选中的 ${selectedMemoryIds.length} 条记忆？`,
      content: '选中的记忆将被软删除并从向量索引中移除，操作完成后不能在当前列表中继续检索。',
      onOk: async () => {
        const results = await Promise.allSettled(selectedMemoryIds.map((memoryId) =>
          deleteMemory(memoryId, '用户在前端批量删除'),
        ))
        const succeededIds = selectedMemoryIds.filter((_, index) => results[index].status === 'fulfilled')
        const failedCount = selectedMemoryIds.length - succeededIds.length

        setMemories(memories.filter((memory) => !succeededIds.includes(memory.memory_id)))
        setSelectedMemoryIds((ids) => ids.filter((id) => !succeededIds.includes(id)))
        setListTotal((total) => Math.max(0, total - succeededIds.length))
        if (scope === 'all' && succeededIds.length) await loadMemoryStats()

        if (failedCount) {
          showWarningMessage(`成功删除 ${succeededIds.length} 条，${failedCount} 条删除失败`)
        } else {
          showSuccessMessage(`已删除 ${succeededIds.length} 条记忆`)
        }
      },
    })
  }

  const handleToggleDeleteMode = () => {
    setDeleteMode((active) => !active)
    setSelectedMemoryIds([])
  }

  const handleToggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedMemoryIds((ids) => ids.filter((id) => !visibleMemoryIds.includes(id)))
      return
    }
    setSelectedMemoryIds((ids) => Array.from(new Set([...ids, ...visibleMemoryIds])))
  }

  return (
    <PageContainer
      title={pageMeta.title}
      description={pageMeta.description}
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => void handleRefresh()} loading={loading || (scope === 'all' && statsLoading)}>刷新</Button>
          <Button danger type={deleteMode ? 'primary' : 'default'} icon={<DeleteOutlined />} onClick={handleToggleDeleteMode}>
            清除记忆
          </Button>
        </Space>
      }
    >
      {scope === 'all' ? <Row gutter={[12, 12]}>
        {memoryLevelCards.map(({ level, title, description, color }) => {
          const stats = memoryStats?.level_distribution?.find((item) => item.level === level)
          const detail = statsLoading
            ? '正在统计…'
            : statsError || !stats
              ? '统计暂不可用'
              : `${memoryCountFormatter.format(stats.count)} 条`
          const value = statsLoading || statsError || !stats
            ? '--'
            : memoryRatioFormatter.format(stats.ratio)

          return <Col xs={24} sm={12} xl={6} key={level}>
            <Card className="console-card memory-level-card" variant="borderless">
              <span style={{ background: color }} />
              <div>
                <Typography.Text strong>{title}</Typography.Text>
                <Typography.Text type="secondary">{description}</Typography.Text>
                <Typography.Text type="secondary">{detail}</Typography.Text>
              </div>
              <strong style={{ color }}>{value}</strong>
            </Card>
          </Col>
        })}
      </Row> : (
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Card className="console-card result-stat" variant="borderless">
              <Typography.Text type="secondary">当前范围</Typography.Text>
              <strong>{scope === 'user' ? config.userId : scope === 'session' ? 'Session' : 'Task'}</strong>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="console-card result-stat" variant="borderless">
              <Typography.Text type="secondary">范围内记忆</Typography.Text>
              <strong>{listTotal}</strong>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="console-card result-stat" variant="borderless">
              <Typography.Text type="secondary">数据状态</Typography.Text>
              <strong style={{ color: '#20a47c' }}>已同步</strong>
            </Card>
          </Col>
        </Row>
      )}

      {scope === 'session' || scope === 'task' ? (
        <Card className="console-card" variant="borderless">
          <Typography.Text strong>{scope === 'session' ? '会话范围' : '任务范围'}</Typography.Text>
          <Input.Search
            allowClear
            style={{ marginTop: 10, maxWidth: 520 }}
            value={scopeId}
            placeholder={scope === 'session' ? '输入 Session ID 筛选会话记忆' : '输入 Task ID 筛选任务记忆'}
            onChange={(event) => setScopeId(event.target.value)}
            onSearch={(value) => void loadAllMemories(1, listPageSize, value.trim() || undefined)}
          />
        </Card>
      ) : null}

      <MemoryFilterBar
        keyword={keyword}
        type={type}
        rerank={rerank}
        loading={loading}
        onKeywordChange={setKeyword}
        onTypeChange={setType}
        onRerankChange={setRerank}
        onSearch={() => void handleSearch()}
      />

      {loading ? <FeedbackState status="loading" description="正在加载记忆库…" /> : null}
      {!loading && error ? <FeedbackState status="error" title="记忆加载失败" error={error} action={<Button onClick={() => void loadAllMemories(1, listPageSize, scopeFilterId)}>重新加载</Button>} /> : null}
      {!loading && !error ? (
        <Card className="console-card" title={`${pageMeta.tableTitle}（${isSearchResult ? visibleMemories.length : listTotal}）`} variant="borderless">
          <Table<MemoryItem>
            rowKey="memory_id"
            dataSource={visibleMemories}
            rowSelection={deleteMode ? {
              selectedRowKeys: selectedMemoryIds,
              preserveSelectedRowKeys: true,
              hideSelectAll: true,
              onChange: (selectedRowKeys) => setSelectedMemoryIds(selectedRowKeys.map(String)),
            } : undefined}
            locale={{ emptyText: '暂无记忆，请先从“记忆数据导入”页面写入数据。' }}
            scroll={{ x: 900 }}
            pagination={isSearchResult
              ? { pageSize: 10, showSizeChanger: true }
              : {
                  current: listPage,
                  pageSize: listPageSize,
                  total: listTotal,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条`,
                  onChange: (page, pageSize) => void loadAllMemories(page, pageSize, scopeFilterId),
                }}
            columns={[
              { title: '记忆内容', dataIndex: 'content', ellipsis: true, width: 330 },
              { title: '类型', dataIndex: 'memory_type', width: 105, render: (value?: string) => <Tag color="blue">{value || 'unknown'}</Tag> },
              { title: '状态', dataIndex: 'status', width: 90, render: (value?: string) => <Tag color={value === 'archived' ? 'default' : 'success'}>{value || 'active'}</Tag> },
              { title: '场景', dataIndex: 'scene_id', width: 120, render: (value?: string) => value || '-' },
              { title: '任务 ID', dataIndex: 'task_id', width: 130, ellipsis: true, render: (value?: string) => value || '-' },
              { title: '更新时间', dataIndex: 'updated_at', width: 170, render: (_: string | undefined, item) => {
                const value = item.updated_at || item.created_at
                return value ? new Date(value).toLocaleString('zh-CN') : '-'
              } },
              { title: '操作', key: 'action', fixed: 'right', width: 120, render: (_, memory) => (
                <Flex gap={4}>
                  <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(memory)} />
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(memory)} />
                </Flex>
              ) },
            ]}
          />
          {deleteMode ? (
            <Flex className="memory-delete-toolbar" justify="space-between" align="center" wrap gap={12}>
              <Typography.Text type="secondary">已选择 {selectedMemoryIds.length} 条记忆</Typography.Text>
              <Space>
                <Button onClick={handleToggleSelectAll} disabled={!visibleMemoryIds.length}>
                  {allVisibleSelected ? '取消全选' : '全部选中'}
                </Button>
                <Button type="primary" danger icon={<DeleteOutlined />} onClick={handleDeleteSelected} disabled={!selectedMemoryIds.length}>
                  清除所选记忆
                </Button>
              </Space>
            </Flex>
          ) : null}
        </Card>
      ) : null}

      <Modal title="编辑记忆" open={!!editingMemory} okText="保存" cancelText="取消" confirmLoading={saving} onOk={() => void handleSave()} onCancel={() => setEditingMemory(null)} width={680}>
        <Form<MemoryEditValues> form={editForm} layout="vertical">
          <Form.Item name="content" label="记忆内容" rules={[{ required: true, whitespace: true, message: '请输入记忆内容' }]}>
            <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item name="summary" label="摘要">
            <Input.TextArea rows={2} placeholder="可选的记忆摘要" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="status" label="状态">
                <Select options={[
                  { value: 'active', label: '有效' },
                  { value: 'archived', label: '已归档' },
                  { value: 'deleted', label: '已删除' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="importance" label="重要性">
                <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="confidence" label="置信度">
                <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="tags" label="标签">
            <Input placeholder="多个标签使用逗号分隔" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}

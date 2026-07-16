import { DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Card, Col, Flex, Input, Modal, Row, Space, Table, Tag, Typography } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { MemoryItem } from '@/api/types'
import { deleteAllMemories, deleteMemory, listMemories, searchMemories, updateMemory } from '@/api/modules/memory'
import { MemoryFilterBar } from '@/components/business/MemoryFilterBar'
import { FeedbackState, PageContainer, openConfirmDialog } from '@/components/common'
import { useAppStore, useMemoryStore } from '@/store'
import { showErrorMessage, showSuccessMessage } from '@/utils/feedback'

type MemoryScope = 'all' | 'user' | 'session' | 'task'

const scopeMeta: Record<MemoryScope, { title: string; description: string; tableTitle: string }> = {
  all: {
    title: '通用记忆建模与多层记忆管理',
    description: '统一管理用户、会话、任务和智能体状态记忆，支持检索、修正、归档与删除。',
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
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [scopeId, setScopeId] = useState('')

  useEffect(() => {
    setScopeId('')
  }, [scope])

  const visibleMemories = useMemo(() => memories.filter((memory) => {
    if (scope === 'user') return !memory.session_id && !memory.task_id
    if (scope === 'session') return !scopeId.trim() || memory.session_id === scopeId.trim()
    if (scope === 'task') return !scopeId.trim() || memory.task_id === scopeId.trim()
    return true
  }), [memories, scope, scopeId])

  const loadAllMemories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setMemories(await listMemories(config.userId))
    } catch (loadError) {
      setError(loadError)
    } finally {
      setLoading(false)
    }
  }, [config.userId, setMemories])

  useEffect(() => {
    void loadAllMemories()
  }, [loadAllMemories])

  const handleSearch = async () => {
    if (!keyword.trim()) {
      await loadAllMemories()
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await searchMemories({
        query: keyword.trim(),
        user_id: config.userId,
        scene_id: config.sceneId || undefined,
        memory_types: type === 'all' ? undefined : [type],
        top_k: 50,
        rerank,
        task_id: scope === 'task' && scopeId.trim() ? scopeId.trim() : undefined,
      })
      setMemories(result.results)
    } catch (searchError) {
      setError(searchError)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (memory: MemoryItem) => {
    setEditingMemory(memory)
    setEditContent(memory.content)
  }

  const handleSave = async () => {
    if (!editingMemory || !editContent.trim()) return
    setSaving(true)
    try {
      await updateMemory(editingMemory.memory_id, editContent.trim())
      setMemories(memories.map((memory) =>
        memory.memory_id === editingMemory.memory_id
          ? { ...memory, content: editContent.trim(), updated_at: new Date().toISOString() }
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
        showSuccessMessage('记忆已删除')
      },
    })
  }

  const handleDeleteAll = () => {
    openConfirmDialog({
      title: '清除当前用户的全部记忆？',
      content: `将清除用户 ${config.userId} 的全部记忆，此操作不可撤销。`,
      onOk: async () => {
        await deleteAllMemories(config.userId)
        setMemories([])
        showSuccessMessage('全部记忆已清除')
      },
    })
  }

  return (
    <PageContainer
      title={pageMeta.title}
      description={pageMeta.description}
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => void loadAllMemories()} loading={loading}>刷新</Button>
          {scope === 'all' ? <Button danger onClick={handleDeleteAll} disabled={!memories.length}>清除全部</Button> : null}
        </Space>
      }
    >
      {scope === 'all' ? <Row gutter={[12, 12]}>
        {[
          ['用户级记忆', '用户偏好与稳定事实', '32%', '#1677ff'],
          ['会话级记忆', '历史会话摘要与上下文', '26%', '#20a47c'],
          ['任务级记忆', '目标、进展与执行结果', '24%', '#e49a28'],
          ['智能体状态记忆', '状态变化与流程轨迹', '18%', '#7b61d1'],
        ].map(([title, description, value, color]) => (
          <Col xs={24} sm={12} xl={6} key={title}>
            <Card className="console-card memory-level-card" variant="borderless">
              <span style={{ background: color }} />
              <div><Typography.Text strong>{title}</Typography.Text><Typography.Text type="secondary">{description}</Typography.Text></div>
              <strong style={{ color }}>{value}</strong>
            </Card>
          </Col>
        ))}
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
              <strong>{visibleMemories.length}</strong>
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
      {!loading && error ? <FeedbackState status="error" title="记忆加载失败" error={error} action={<Button onClick={() => void loadAllMemories()}>重新加载</Button>} /> : null}
      {!loading && !error ? (
        <Card className="console-card" title={`${pageMeta.tableTitle}（${visibleMemories.length}）`} variant="borderless">
          <Table<MemoryItem>
            rowKey="memory_id"
            dataSource={visibleMemories}
            locale={{ emptyText: '暂无记忆，请先从“记忆数据导入”页面写入数据。' }}
            scroll={{ x: 900 }}
            pagination={{ pageSize: 10, showSizeChanger: true }}
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
        </Card>
      ) : null}

      <Modal title="编辑记忆" open={!!editingMemory} okText="保存" cancelText="取消" confirmLoading={saving} onOk={() => void handleSave()} onCancel={() => setEditingMemory(null)}>
        <Input.TextArea rows={6} value={editContent} onChange={(event) => setEditContent(event.target.value)} />
      </Modal>
    </PageContainer>
  )
}

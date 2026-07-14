import { useCallback, useEffect, useState } from 'react'
import { Button, Input, Modal, Space, Typography, Upload } from 'antd'
import type { UploadFile } from 'antd'
import type { MemoryImportRecord, MemoryItem } from '@/api/types'
import {
  deleteAllMemories,
  deleteMemory,
  listMemories,
  searchMemories,
  updateMemory,
  writeMemories,
} from '@/api/modules/memory'
import { MemoryCard } from '@/components/business/MemoryCard'
import { MemoryFilterBar } from '@/components/business/MemoryFilterBar'
import { FeedbackState, PageContainer, openConfirmDialog } from '@/components/common'
import { useAppStore, useMemoryStore } from '@/store'
import { showErrorMessage, showSuccessMessage } from '@/utils/feedback'
import { parseMemoryImportText } from '@/utils/memoryImport'

export default function MemoryPage() {
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
  const [importOpen, setImportOpen] = useState(false)
  const [importFileList, setImportFileList] = useState<UploadFile[]>([])
  const [importRecords, setImportRecords] = useState<MemoryImportRecord[]>([])
  const [importing, setImporting] = useState(false)

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
      setMemories(
        memories.map((memory) =>
          memory.memory_id === editingMemory.memory_id
            ? { ...memory, content: editContent.trim(), updated_at: new Date().toISOString() }
            : memory,
        ),
      )
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
        try {
          await deleteMemory(memory.memory_id, '用户在前端删除')
          setMemories(memories.filter((item) => item.memory_id !== memory.memory_id))
          showSuccessMessage('记忆已删除')
        } catch (deleteError) {
          showErrorMessage(deleteError, '删除记忆失败')
          throw deleteError
        }
      },
    })
  }

  const handleDeleteAll = () => {
    openConfirmDialog({
      title: '清除全部记忆？',
      content: `将清除用户 ${config.userId} 的全部记忆，此操作不可撤销。`,
      onOk: async () => {
        try {
          await deleteAllMemories(config.userId)
          setMemories([])
          showSuccessMessage('全部记忆已清除')
        } catch (deleteError) {
          showErrorMessage(deleteError, '清除全部记忆失败')
          throw deleteError
        }
      },
    })
  }

  const handleImportFile = async (file: File) => {
    try {
      const records = parseMemoryImportText(file.name, await file.text())
      setImportRecords(records)
      setImportFileList([{ uid: file.name, name: file.name, status: 'done', size: file.size, type: file.type }])
    } catch (parseError) {
      setImportRecords([])
      setImportFileList([])
      showErrorMessage(parseError, '导入文件解析失败')
    }
    return false
  }

  const handleImport = async () => {
    if (!importRecords.length) return
    setImporting(true)
    let successCount = 0
    try {
      for (const record of importRecords) {
        await writeMemories({
          user_id: config.userId,
          scene_id: record.scene_id || config.sceneId || undefined,
          task_id: record.task_id,
          messages: [{ role: record.role || 'user', content: record.content }],
        })
        successCount += 1
      }
      showSuccessMessage(`成功导入 ${successCount} 条记录`)
      setImportOpen(false)
      setImportRecords([])
      setImportFileList([])
      await loadAllMemories()
    } catch (importError) {
      showErrorMessage(importError, `已导入 ${successCount} 条，后续记录导入失败`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <PageContainer
      title="记忆管理"
      description="检索、维护和导入当前用户的长期记忆。导入支持 JSON 与 CSV，并通过记忆写入接口逐条落库。"
      extra={
        <Space>
          <Button onClick={() => void loadAllMemories()} loading={loading}>刷新</Button>
          <Button onClick={() => setImportOpen(true)}>导入记忆</Button>
          <Button danger onClick={handleDeleteAll} disabled={!memories.length}>清除全部</Button>
        </Space>
      }
    >
      <Space orientation="vertical" size={16} style={{ display: 'flex' }}>
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
        {loading ? <FeedbackState status="loading" description="正在加载记忆…" /> : null}
        {!loading && error ? (
          <FeedbackState
            status="error"
            title="记忆加载失败"
            error={error}
            action={<Button onClick={() => void loadAllMemories()}>重新加载</Button>}
          />
        ) : null}
        {!loading && !error && memories.length === 0 ? (
          <FeedbackState status="empty" title="暂无记忆" description="可以通过聊天写入，或导入 JSON/CSV 历史数据。" />
        ) : null}
        {!loading && !error
          ? memories.map((memory) => (
              <MemoryCard key={memory.memory_id} memory={memory} onEdit={handleEdit} onDelete={handleDelete} />
            ))
          : null}
      </Space>

      <Modal
        title="编辑记忆"
        open={!!editingMemory}
        okText="保存"
        cancelText="取消"
        confirmLoading={saving}
        onOk={() => void handleSave()}
        onCancel={() => setEditingMemory(null)}
      >
        <Input.TextArea rows={5} value={editContent} onChange={(event) => setEditContent(event.target.value)} />
      </Modal>

      <Modal
        title="导入历史记忆"
        open={importOpen}
        okText="开始导入"
        cancelText="取消"
        confirmLoading={importing}
        okButtonProps={{ disabled: importRecords.length === 0 }}
        onOk={() => void handleImport()}
        onCancel={() => setImportOpen(false)}
      >
        <Space orientation="vertical" size={12} style={{ display: 'flex' }}>
          <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
            JSON 使用记录数组；CSV 表头至少包含 content，可选 role、scene_id、task_id。
          </Typography.Paragraph>
          <Upload
            accept=".json,.csv"
            maxCount={1}
            fileList={importFileList}
            beforeUpload={handleImportFile}
            onRemove={() => {
              setImportFileList([])
              setImportRecords([])
            }}
          >
            <Button>选择 JSON/CSV 文件</Button>
          </Upload>
          {importRecords.length ? <Typography.Text>已解析 {importRecords.length} 条记录</Typography.Text> : null}
        </Space>
      </Modal>
    </PageContainer>
  )
}

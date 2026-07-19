import { describe, expect, it } from 'vitest'
import {
  GENERATION_TASK_MAX_AGE,
  GENERATION_TASK_STORAGE_KEY,
  clearStoredGenerationTask,
  loadStoredGenerationTask,
  parseStoredGenerationTask,
  storeGenerationTask,
} from '@/utils/generationTask'
import type { AsyncGenerationTask } from '@/utils/generationTask'

class MemoryStorage {
  private values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }

  removeItem(key: string) {
    this.values.delete(key)
  }
}

const task: AsyncGenerationTask = {
  requestId: 'req_context_001',
  submittedAt: 1_000_000,
  status: 'processing',
  progress: 0.5,
  polling: true,
  restored: false,
  presetId: 'fact',
  inputText: '项目验收日期为 2031 年 12 月 20 日。',
  userId: 'user_context_001',
  sceneId: 'scene_context_001',
  agentId: 'agent_context_001',
  taskId: 'task_context_001',
  sessionId: 'session_context_001',
  extractionTypes: ['key_fact'],
}

describe('generation task persistence', () => {
  it('restores the full request context and marks the task as restored', () => {
    const storage = new MemoryStorage()
    storeGenerationTask(task, storage)

    const restored = parseStoredGenerationTask(
      storage.getItem(GENERATION_TASK_STORAGE_KEY)!,
      task.submittedAt + 1000,
    )

    expect(restored).toMatchObject({
      requestId: task.requestId,
      presetId: 'fact',
      inputText: task.inputText,
      userId: task.userId,
      taskId: task.taskId,
      extractionTypes: ['key_fact'],
      status: 'pending',
      polling: true,
      restored: true,
    })
  })

  it('rejects old context-free snapshots instead of attaching them to the current page', () => {
    const storage = new MemoryStorage()
    storage.setItem('memory-console:generation-task:v1', JSON.stringify({
      version: 1,
      requestId: 'req_legacy',
      submittedAt: Date.now(),
    }))

    expect(loadStoredGenerationTask(storage)).toBeNull()
    expect(storage.getItem('memory-console:generation-task:v1')).toBeNull()
  })

  it('removes expired or malformed snapshots', () => {
    const storage = new MemoryStorage()
    storeGenerationTask(task, storage)
    const raw = storage.getItem(GENERATION_TASK_STORAGE_KEY)!

    expect(parseStoredGenerationTask(raw, task.submittedAt + GENERATION_TASK_MAX_AGE + 1)).toBeNull()

    storage.setItem(GENERATION_TASK_STORAGE_KEY, '{bad json')
    expect(loadStoredGenerationTask(storage)).toBeNull()
    expect(storage.getItem(GENERATION_TASK_STORAGE_KEY)).toBeNull()
  })

  it('clears the stored task explicitly', () => {
    const storage = new MemoryStorage()
    storeGenerationTask(task, storage)
    clearStoredGenerationTask(storage)

    expect(storage.getItem(GENERATION_TASK_STORAGE_KEY)).toBeNull()
  })
})

import type { MemoryAsyncGenerationStatus, MemoryExtractionType } from '@/api/types'
import type { GenerationView } from '@/constants/generation'

export const GENERATION_TASK_STORAGE_KEY = 'memory-console:generation-task:v2'
export const GENERATION_TASK_MAX_AGE = 30 * 60 * 1000
const LEGACY_GENERATION_TASK_STORAGE_KEY = 'memory-console:generation-task:v1'

const generationViews = new Set<GenerationView>([
  'all',
  'preference',
  'fact',
  'task-state',
  'decision',
  'conflict',
  'conflict-dedup',
  'similar-dedup',
  'fusion',
  'low-value',
])

const extractionTypes = new Set<MemoryExtractionType>([
  'key_fact',
  'task_state',
  'decision',
  'preference',
  'process',
  'feedback',
])

export interface GenerationTaskContext {
  presetId: GenerationView
  inputText: string
  userId: string
  sceneId?: string
  agentId?: string
  taskId?: string
  sessionId?: string
  extractionTypes: MemoryExtractionType[]
}

export interface AsyncGenerationTask extends GenerationTaskContext {
  requestId: string
  status: MemoryAsyncGenerationStatus
  progress?: number
  message?: string
  error?: string
  submittedAt: number
  polling: boolean
  restored: boolean
}

interface StoredGenerationTask extends GenerationTaskContext {
  version: 2
  requestId: string
  submittedAt: number
}

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === 'string'
}

export function parseStoredGenerationTask(raw: string, now = Date.now()): AsyncGenerationTask | null {
  try {
    const value = JSON.parse(raw) as Partial<StoredGenerationTask>
    const validTypes = Array.isArray(value.extractionTypes)
      && value.extractionTypes.length > 0
      && value.extractionTypes.every((type) => extractionTypes.has(type))

    if (
      value.version !== 2
      || typeof value.requestId !== 'string'
      || !value.requestId
      || typeof value.submittedAt !== 'number'
      || now - value.submittedAt > GENERATION_TASK_MAX_AGE
      || typeof value.presetId !== 'string'
      || !generationViews.has(value.presetId as GenerationView)
      || typeof value.inputText !== 'string'
      || !value.inputText
      || typeof value.userId !== 'string'
      || !value.userId
      || !isOptionalString(value.sceneId)
      || !isOptionalString(value.agentId)
      || !isOptionalString(value.taskId)
      || !isOptionalString(value.sessionId)
      || !validTypes
    ) return null

    return {
      requestId: value.requestId,
      submittedAt: value.submittedAt,
      presetId: value.presetId as GenerationView,
      inputText: value.inputText,
      userId: value.userId,
      sceneId: value.sceneId,
      agentId: value.agentId,
      taskId: value.taskId,
      sessionId: value.sessionId,
      extractionTypes: value.extractionTypes as MemoryExtractionType[],
      status: 'pending',
      polling: true,
      restored: true,
    }
  } catch {
    return null
  }
}

export function loadStoredGenerationTask(storage: StorageLike = sessionStorage) {
  storage.removeItem(LEGACY_GENERATION_TASK_STORAGE_KEY)
  const raw = storage.getItem(GENERATION_TASK_STORAGE_KEY)
  if (!raw) return null
  const task = parseStoredGenerationTask(raw)
  if (!task) storage.removeItem(GENERATION_TASK_STORAGE_KEY)
  return task
}

export function storeGenerationTask(task: AsyncGenerationTask, storage: StorageLike = sessionStorage) {
  const stored: StoredGenerationTask = {
    version: 2,
    requestId: task.requestId,
    submittedAt: task.submittedAt,
    presetId: task.presetId,
    inputText: task.inputText,
    userId: task.userId,
    sceneId: task.sceneId,
    agentId: task.agentId,
    taskId: task.taskId,
    sessionId: task.sessionId,
    extractionTypes: task.extractionTypes,
  }
  storage.setItem(GENERATION_TASK_STORAGE_KEY, JSON.stringify(stored))
}

export function clearStoredGenerationTask(storage: StorageLike = sessionStorage) {
  storage.removeItem(GENERATION_TASK_STORAGE_KEY)
}

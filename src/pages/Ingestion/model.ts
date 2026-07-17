import type { MemoryImportRecord, MemoryWritePayload } from '@/api/types'

export type ImportMode = 'dialogue' | 'session' | 'task_process'

interface ImportModeMeta {
  label: string
  title: string
  description: string
  color: string
  fields: string[]
}

export const defaultImportMode: ImportMode = 'dialogue'

export const modeMeta: Record<ImportMode, ImportModeMeta> = {
  dialogue: {
    label: '对话记录',
    title: '导入对话记忆',
    description: '将用户与智能体的历史消息写入记忆生成流水线。',
    color: 'blue',
    fields: ['content', 'role', 'scene_id', 'task_id'],
  },
  session: {
    label: '历史会话',
    title: '导入历史会话',
    description: '按时间、来源和摘要导入已经结束的会话记录。',
    color: 'green',
    fields: ['session_summary', 'session_time', 'session_source', 'scene_id', 'task_id'],
  },
  task_process: {
    label: '任务过程',
    title: '导入任务过程',
    description: '导入任务目标、进展、待办事项和执行结果。',
    color: 'gold',
    fields: ['task_goal', 'task_progress', 'task_result', 'scene_id', 'task_id'],
  },
}

export function resolveImportMode(value: string | null | undefined): ImportMode {
  return value && value in modeMeta ? value as ImportMode : defaultImportMode
}

export function buildWritePayload(
  mode: ImportMode,
  record: MemoryImportRecord,
  userId: string,
  defaultSceneId: string,
): MemoryWritePayload {
  const base = {
    user_id: userId,
    scene_id: record.scene_id || defaultSceneId || undefined,
    task_id: record.task_id,
    interaction_type: mode,
  } satisfies MemoryWritePayload

  if (mode === 'session') {
    return {
      ...base,
      session_time: record.session_time,
      session_source: record.session_source || 'frontend_file_import',
      session_summary: record.session_summary || record.content,
    }
  }

  if (mode === 'task_process') {
    return {
      ...base,
      task_goal: record.task_goal,
      task_progress: record.task_progress || record.content,
      task_result: record.task_result,
    }
  }

  return {
    ...base,
    messages: [{ role: record.role || 'user', content: record.content }],
  }
}

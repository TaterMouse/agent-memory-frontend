import type { DialogueMessage, MemoryImportRecord } from '@/api/types'

const supportedRoles = new Set<DialogueMessage['role']>(['user', 'assistant', 'system'])

function normalizeRecord(value: unknown, index: number): MemoryImportRecord {
  if (typeof value !== 'object' || value === null) {
    throw new Error(`第 ${index + 1} 条记录不是对象`)
  }

  const record = value as Record<string, unknown>
  const optionalString = (key: string) =>
    typeof record[key] === 'string' ? record[key].trim() || undefined : undefined
  const content = optionalString('content')
    ?? optionalString('session_summary')
    ?? optionalString('task_progress')
    ?? optionalString('task_goal')
    ?? optionalString('task_result')
    ?? ''
  if (!content) {
    throw new Error(`第 ${index + 1} 条记录缺少 content`)
  }

  const role = typeof record.role === 'string' ? record.role.trim() : ''
  if (role && !supportedRoles.has(role as DialogueMessage['role'])) {
    throw new Error(`第 ${index + 1} 条记录的 role 不合法`)
  }

  const normalized: MemoryImportRecord = {
    content,
    role: (role as DialogueMessage['role']) || 'user',
    scene_id: optionalString('scene_id'),
    task_id: optionalString('task_id'),
  }

  const extraFields = [
    'session_time',
    'session_source',
    'session_summary',
    'task_goal',
    'task_progress',
    'task_result',
  ] as const
  extraFields.forEach((field) => {
    const value = optionalString(field)
    if (value) normalized[field] = value
  })

  return normalized
}

function parseCsvRow(line: string) {
  const cells: string[] = []
  let current = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"' && quoted && line[index + 1] === '"') {
      current += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      cells.push(current.trim())
      current = ''
    } else {
      current += character
    }
  }

  cells.push(current.trim())
  return cells
}

function parseCsv(text: string) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim())
  if (lines.length < 2) {
    throw new Error('CSV 至少需要表头和一条数据')
  }

  const headers = parseCsvRow(lines[0]).map((header) => header.toLowerCase())
  if (!headers.includes('content')) {
    throw new Error('CSV 表头必须包含 content')
  }

  return lines.slice(1).map((line, index) => {
    const cells = parseCsvRow(line)
    const record = Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex] ?? '']))
    return normalizeRecord(record, index)
  })
}

export function parseMemoryImportText(fileName: string, text: string) {
  const normalizedName = fileName.toLowerCase()

  if (normalizedName.endsWith('.csv')) {
    return parseCsv(text)
  }

  if (!normalizedName.endsWith('.json')) {
    throw new Error('仅支持 .json 或 .csv 文件')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('JSON 文件格式不正确')
  }

  const records = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' && parsed !== null && Array.isArray((parsed as { records?: unknown }).records)
      ? (parsed as { records: unknown[] }).records
      : null

  if (!records?.length) {
    throw new Error('JSON 需要是非空数组，或包含非空 records 数组')
  }

  return records.map(normalizeRecord)
}

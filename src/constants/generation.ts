import type { MemoryExtractionType } from '@/api/types'
import { appRoutes } from '@/constants/routes'

export type GenerationView =
  | 'all'
  | 'preference'
  | 'fact'
  | 'task-state'
  | 'decision'
  | 'conflict'
  | 'conflict-dedup'
  | 'similar-dedup'
  | 'fusion'
  | 'low-value'

export interface GenerationPreset {
  id: GenerationView
  title: string
  description: string
  extractionTypes: MemoryExtractionType[]
  focusActions?: string[]
  focusMemoryTypes?: string[]
  focusLabel?: string
  guidance: string
}

export const allExtractionTypes: MemoryExtractionType[] = [
  'key_fact',
  'task_state',
  'decision',
  'preference',
  'process',
  'feedback',
]

export const generationPresets: Record<GenerationView, GenerationPreset> = {
  all: {
    id: 'all',
    title: '记忆生成与去重融合',
    description: '调用后端真实生成流水线，查看抽取、去重、冲突检测、融合与入库结果。',
    extractionTypes: allExtractionTypes,
    guidance: '输入包含事实、偏好、任务或决策的文本，可一次查看完整处理结果。',
  },
  preference: {
    id: 'preference',
    title: '用户偏好提取',
    description: '从交互文本中提取稳定的用户选择和使用偏好，并展示后端真实处理决策。',
    extractionTypes: ['preference'],
    focusMemoryTypes: ['preference'],
    focusLabel: '偏好结果',
    guidance: '建议输入明确的选择、习惯或风格偏好，例如“我更喜欢使用 TypeScript”。',
  },
  fact: {
    id: 'fact',
    title: '关键事实提取',
    description: '识别文本中的关键事实，展示生成、去重及入库结果。',
    extractionTypes: ['key_fact'],
    focusMemoryTypes: ['key_fact', 'fact'],
    focusLabel: '事实结果',
    guidance: '建议输入含人物、时间、地点、项目或业务对象的确定性信息。',
  },
  'task-state': {
    id: 'task-state',
    title: '任务状态生成',
    description: '将任务进展、待办、阻塞和结果转化为可关联 Task ID 的记忆。',
    extractionTypes: ['task_state'],
    focusMemoryTypes: ['task_state', 'task'],
    focusLabel: '任务状态结果',
    guidance: '填写 Task ID，并输入当前进度、已完成事项、阻塞点或后续计划。',
  },
  decision: {
    id: 'decision',
    title: '历史决策沉淀',
    description: '提取决策、依据、适用条件和最终结论，形成可追溯记忆。',
    extractionTypes: ['decision'],
    focusMemoryTypes: ['decision'],
    focusLabel: '决策结果',
    guidance: '建议明确描述“决定了什么、为什么、在什么条件下适用”。',
  },
  conflict: {
    id: 'conflict',
    title: '冲突检测',
    description: '通过真实生成流水线观察新旧记忆是否产生冲突，以及后端给出的处理结果。',
    extractionTypes: allExtractionTypes,
    focusActions: ['conflict'],
    focusLabel: '冲突结果',
    guidance: '可先写入一条事实，再提交与之矛盾的新事实；页面只展示后端实际返回的冲突。',
  },
  'conflict-dedup': {
    id: 'conflict-dedup',
    title: '冲突记忆去重',
    description: '聚焦冲突场景中的覆盖、更新或丢弃决策，不模拟后端未返回的结果。',
    extractionTypes: allExtractionTypes,
    focusActions: ['conflict', 'update_existing', 'discard'],
    focusLabel: '冲突去重结果',
    guidance: '连续提交同一主题但内容不一致的文本，可验证后端的冲突去重策略。',
  },
  'similar-dedup': {
    id: 'similar-dedup',
    title: '相似记忆去重',
    description: '观察语义相似内容被融合、更新或丢弃的真实决策。',
    extractionTypes: allExtractionTypes,
    focusActions: ['merge', 'discard', 'update_existing'],
    focusLabel: '相似去重结果',
    guidance: '连续提交语义接近的表达，可观察后端是否进行融合、更新或跳过。',
  },
  fusion: {
    id: 'fusion',
    title: '记忆融合管理',
    description: '聚焦后端对相关记忆执行融合或更新后的结果明细。',
    extractionTypes: allExtractionTypes,
    focusActions: ['merge', 'update_existing'],
    focusLabel: '融合结果',
    guidance: '输入对已有记忆的补充信息，页面将展示后端实际返回的融合或更新记录。',
  },
  'low-value': {
    id: 'low-value',
    title: '低价值内容过滤',
    description: '展示生成流水线实际丢弃的低价值、重复或无有效信息内容。',
    extractionTypes: allExtractionTypes,
    focusActions: ['discard'],
    focusLabel: '过滤结果',
    guidance: '可输入寒暄、重复表述或缺少事实的信息，验证后端是否返回丢弃决策。',
  },
}

export const generationMenuViews: Exclude<GenerationView, 'all'>[] = [
  'preference',
  'fact',
  'task-state',
  'decision',
  'conflict',
  'conflict-dedup',
  'similar-dedup',
  'fusion',
  'low-value',
]

export function getGenerationPreset(value?: string | null) {
  if (value && value in generationPresets) return generationPresets[value as GenerationView]
  return generationPresets.all
}

export function getGenerationPath(view: GenerationView) {
  return view === 'all' ? appRoutes.generation : `${appRoutes.generation}?view=${view}`
}

const legacyCapabilityRedirects: Record<string, string> = {
  'agent-level-memory': appRoutes.memory,
  'preference-extraction': getGenerationPath('preference'),
  'fact-extraction': getGenerationPath('fact'),
  'task-state-generation': getGenerationPath('task-state'),
  'decision-settlement': getGenerationPath('decision'),
  'conflict-detection': getGenerationPath('conflict'),
  'conflict-memory-dedup': getGenerationPath('conflict-dedup'),
  'similar-memory-dedup': getGenerationPath('similar-dedup'),
  'memory-fusion-management': getGenerationPath('fusion'),
  'low-value-filter': getGenerationPath('low-value'),
}

export function getLegacyCapabilityRedirect(id?: string) {
  return (id && legacyCapabilityRedirects[id]) || appRoutes.overview
}

export function splitBatchText(value = '') {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
}

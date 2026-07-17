export type CapabilityStatus = 'planned' | 'partial' | 'available'

export interface CapabilityDefinition {
  id: string
  title: string
  group: string
  description: string
  status: CapabilityStatus
  steps: string[]
  backendRequirement: string
  relatedPath: string
  relatedLabel: string
}

export const capabilityRoutePrefix = '/capabilities'

export function getCapabilityPath(id: string) {
  return `${capabilityRoutePrefix}/${id}`
}

export const capabilityDefinitions: CapabilityDefinition[] = [
  {
    id: 'agent-level-memory',
    title: '智能体级记忆',
    group: '通用记忆建模与多层记忆管理',
    description: '按智能体维度沉淀稳定能力、操作习惯和跨任务经验。',
    status: 'planned',
    steps: ['选择智能体', '加载长期记忆', '按类型筛选', '查看关联任务'],
    backendRequirement: '需要按 agent_id 查询、分页和统计记忆的接口。',
    relatedPath: '/memory',
    relatedLabel: '查看现有记忆',
  },
  {
    id: 'preference-extraction',
    title: '用户偏好提取',
    group: '记忆生成与去重融合',
    description: '从历史交互中提取稳定、可解释的用户选择与使用偏好。',
    status: 'available',
    steps: ['读取候选内容', '偏好语义识别', '置信度评估', '生成偏好记忆'],
    backendRequirement: '已通过 /memory/generate 和 /memory/generate/batch 接入偏好抽取、置信度与处理明细。',
    relatedPath: '/generation',
    relatedLabel: '查看生成链路',
  },
  {
    id: 'fact-extraction',
    title: '关键事实提取',
    group: '记忆生成与去重融合',
    description: '识别人物、事件、时间、地点及业务对象等关键事实。',
    status: 'available',
    steps: ['输入内容切分', '实体与事实识别', '来源关联', '生成事实记忆'],
    backendRequirement: '已通过 /memory/generate 和 /memory/generate/batch 接入事实抽取与生成明细。',
    relatedPath: '/generation',
    relatedLabel: '查看生成链路',
  },
  {
    id: 'task-state-generation',
    title: '任务状态生成',
    group: '记忆生成与去重融合',
    description: '从任务过程数据中生成进展、待办、阻塞和结果记忆。',
    status: 'available',
    steps: ['读取任务过程', '识别状态变化', '汇总完成与待办', '写入任务记忆'],
    backendRequirement: '已支持 task_state 抽取，并可使用 Task ID 关联生成结果。',
    relatedPath: '/task',
    relatedLabel: '查看任务管理',
  },
  {
    id: 'decision-settlement',
    title: '历史决策沉淀',
    group: '记忆生成与去重融合',
    description: '保留重要决策、判断依据、适用场景与最终结果。',
    status: 'available',
    steps: ['识别决策语句', '提取依据与条件', '关联业务结果', '生成决策记忆'],
    backendRequirement: '已通过 decision 抽取类型接入历史决策生成，结果可在记忆管理中查询。',
    relatedPath: '/generation',
    relatedLabel: '查看生成链路',
  },
  {
    id: 'conflict-detection',
    title: '冲突检测',
    group: '记忆生成与去重融合',
    description: '发现新旧记忆在事实、状态、时间或适用条件上的冲突。',
    status: 'partial',
    steps: ['召回候选记忆', '比较关键字段', '计算冲突分数', '输出处理建议'],
    backendRequirement: '生成流水线已返回 conflict_count；冲突列表、分数和人工决策接口仍待补充。',
    relatedPath: '/generation',
    relatedLabel: '查看融合决策',
  },
  {
    id: 'conflict-memory-dedup',
    title: '冲突记忆去重',
    group: '记忆生成与去重融合',
    description: '对互相矛盾的记忆执行保留、覆盖、归档或条件化融合。',
    status: 'partial',
    steps: ['确认冲突对', '选择处理策略', '执行记忆变更', '保留变更轨迹'],
    backendRequirement: '后端写入流水线可自动处理冲突；人工选择策略、版本保留和批量决策接口仍待补充。',
    relatedPath: '/generation',
    relatedLabel: '查看融合决策',
  },
  {
    id: 'similar-memory-dedup',
    title: '相似记忆去重',
    group: '记忆生成与去重融合',
    description: '识别语义高度相似的重复内容，减少记忆冗余。',
    status: 'available',
    steps: ['相似记忆召回', '计算综合相似度', '确认重复关系', '合并或跳过'],
    backendRequirement: '生成流水线已自动执行相似召回、合并或跳过，并返回对应处理明细。',
    relatedPath: '/generation',
    relatedLabel: '查看融合决策',
  },
  {
    id: 'memory-fusion-management',
    title: '记忆融合管理',
    group: '记忆生成与去重融合',
    description: '将多条相关记忆整理为信息更完整的结构化记忆。',
    status: 'available',
    steps: ['选择候选记忆', '预览融合内容', '确认字段来源', '写入融合结果'],
    backendRequirement: '生成流水线已支持自动融合并返回 MERGE 结果；人工融合预览和来源追溯接口仍可继续增强。',
    relatedPath: '/generation',
    relatedLabel: '查看融合决策',
  },
  {
    id: 'low-value-filter',
    title: '低价值内容过滤',
    group: '记忆生成与去重融合',
    description: '过滤寒暄、重复表达、缺少事实依据和低置信度内容。',
    status: 'partial',
    steps: ['应用过滤规则', '计算价值分数', '人工抽样复核', '记录过滤原因'],
    backendRequirement: '生成流水线可返回 discard/SKIP 结果；独立价值评分、规则配置和过滤记录接口仍待补充。',
    relatedPath: '/generation',
    relatedLabel: '查看生成链路',
  },
]

export function findCapability(id?: string) {
  return capabilityDefinitions.find((capability) => capability.id === id)
}

export function findCapabilityByPath(pathname: string) {
  if (!pathname.startsWith(`${capabilityRoutePrefix}/`)) return undefined
  return findCapability(pathname.slice(capabilityRoutePrefix.length + 1))
}

export type CapabilityStatus = 'planned' | 'partial'

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
    id: 'memory-unit-model',
    title: '记忆单元建模',
    group: '通用记忆建模与多层记忆管理',
    description: '定义统一的记忆内容、类型、来源、状态、时间与关联标识结构。',
    status: 'partial',
    steps: ['查看模型字段', '校验字段约束', '提交模型版本', '同步业务页面'],
    backendRequirement: '需要记忆模型 Schema 查询与版本管理接口。',
    relatedPath: '/memory',
    relatedLabel: '查看记忆管理',
  },
  {
    id: 'memory-type-management',
    title: '记忆类型管理',
    group: '通用记忆建模与多层记忆管理',
    description: '维护用户偏好、关键事实、任务状态、历史决策等记忆分类。',
    status: 'partial',
    steps: ['读取类型字典', '新增或编辑类型', '设置显示规则', '应用到检索筛选'],
    backendRequirement: '需要记忆类型字典的增删改查接口。',
    relatedPath: '/memory',
    relatedLabel: '查看记忆列表',
  },
  {
    id: 'memory-status-management',
    title: '记忆状态管理',
    group: '通用记忆建模与多层记忆管理',
    description: '管理记忆的有效、归档、失效和待审核状态及其流转。',
    status: 'partial',
    steps: ['筛选当前状态', '查看变更原因', '执行状态切换', '记录操作轨迹'],
    backendRequirement: '需要状态变更、批量归档和状态历史接口。',
    relatedPath: '/memory',
    relatedLabel: '查看记忆管理',
  },
  {
    id: 'metadata-management',
    title: '元数据管理',
    group: '通用记忆建模与多层记忆管理',
    description: '维护场景、来源、标签、置信度和业务扩展字段。',
    status: 'planned',
    steps: ['读取元数据模板', '配置字段规则', '预览数据映射', '保存模板'],
    backendRequirement: '需要元数据模板、字段校验与映射配置接口。',
    relatedPath: '/ingestion?view=validation',
    relatedLabel: '查看数据校验',
  },
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
    status: 'planned',
    steps: ['读取候选内容', '偏好语义识别', '置信度评估', '生成偏好记忆'],
    backendRequirement: '需要偏好提取任务、处理结果和置信度接口。',
    relatedPath: '/generation',
    relatedLabel: '查看生成链路',
  },
  {
    id: 'fact-extraction',
    title: '关键事实提取',
    group: '记忆生成与去重融合',
    description: '识别人物、事件、时间、地点及业务对象等关键事实。',
    status: 'planned',
    steps: ['输入内容切分', '实体与事实识别', '来源关联', '生成事实记忆'],
    backendRequirement: '需要事实抽取结果、来源追溯和审核接口。',
    relatedPath: '/generation',
    relatedLabel: '查看生成链路',
  },
  {
    id: 'task-state-generation',
    title: '任务状态生成',
    group: '记忆生成与去重融合',
    description: '从任务过程数据中生成进展、待办、阻塞和结果记忆。',
    status: 'partial',
    steps: ['读取任务过程', '识别状态变化', '汇总完成与待办', '写入任务记忆'],
    backendRequirement: '需要任务过程分析与状态记忆生成接口。',
    relatedPath: '/task',
    relatedLabel: '查看任务管理',
  },
  {
    id: 'decision-settlement',
    title: '历史决策沉淀',
    group: '记忆生成与去重融合',
    description: '保留重要决策、判断依据、适用场景与最终结果。',
    status: 'planned',
    steps: ['识别决策语句', '提取依据与条件', '关联业务结果', '生成决策记忆'],
    backendRequirement: '需要决策识别、结果关联与历史决策查询接口。',
    relatedPath: '/generation',
    relatedLabel: '查看生成链路',
  },
  {
    id: 'conflict-detection',
    title: '冲突检测',
    group: '记忆生成与去重融合',
    description: '发现新旧记忆在事实、状态、时间或适用条件上的冲突。',
    status: 'planned',
    steps: ['召回候选记忆', '比较关键字段', '计算冲突分数', '输出处理建议'],
    backendRequirement: '需要冲突检测任务、冲突分数和决策建议接口。',
    relatedPath: '/generation',
    relatedLabel: '查看融合决策',
  },
  {
    id: 'conflict-memory-dedup',
    title: '冲突记忆去重',
    group: '记忆生成与去重融合',
    description: '对互相矛盾的记忆执行保留、覆盖、归档或条件化融合。',
    status: 'planned',
    steps: ['确认冲突对', '选择处理策略', '执行记忆变更', '保留变更轨迹'],
    backendRequirement: '需要冲突处理、版本保留和批量决策接口。',
    relatedPath: '/generation',
    relatedLabel: '查看融合决策',
  },
  {
    id: 'similar-memory-dedup',
    title: '相似记忆去重',
    group: '记忆生成与去重融合',
    description: '识别语义高度相似的重复内容，减少记忆冗余。',
    status: 'planned',
    steps: ['相似记忆召回', '计算综合相似度', '确认重复关系', '合并或跳过'],
    backendRequirement: '需要相似度检测、重复分组与合并执行接口。',
    relatedPath: '/generation',
    relatedLabel: '查看融合决策',
  },
  {
    id: 'memory-fusion-management',
    title: '记忆融合管理',
    group: '记忆生成与去重融合',
    description: '将多条相关记忆整理为信息更完整的结构化记忆。',
    status: 'planned',
    steps: ['选择候选记忆', '预览融合内容', '确认字段来源', '写入融合结果'],
    backendRequirement: '需要融合预览、融合执行和来源追溯接口。',
    relatedPath: '/generation',
    relatedLabel: '查看融合决策',
  },
  {
    id: 'low-value-filter',
    title: '低价值内容过滤',
    group: '记忆生成与去重融合',
    description: '过滤寒暄、重复表达、缺少事实依据和低置信度内容。',
    status: 'planned',
    steps: ['应用过滤规则', '计算价值分数', '人工抽样复核', '记录过滤原因'],
    backendRequirement: '需要价值评分、过滤规则和过滤记录查询接口。',
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

import { describe, expect, it } from 'vitest'
import {
  formatDashboardComparison,
  formatDashboardNumber,
  formatDashboardPercent,
  getAgentResultLabel,
  getAgentSceneLabel,
  getAlertPresentationStatus,
  serializeLatestContext,
} from '@/pages/Overview/dashboard-adapter'

describe('dashboard adapters', () => {
  it('uses explicit empty-state copy instead of claiming an unavailable endpoint', () => {
    expect(formatDashboardNumber(null)).toBe('暂无统计')
    expect(formatDashboardPercent(undefined)).toBe('暂无统计')
    expect(formatDashboardComparison(null)).toBe('暂未提供日环比')
  })

  it('formats real dashboard values and comparison directions', () => {
    expect(formatDashboardNumber(6010)).toBe('6,010')
    expect(formatDashboardPercent(0.3757)).toBe('37.6%')
    expect(formatDashboardComparison(0.3333)).toBe('较昨日 ↑ 33.3%')
    expect(formatDashboardComparison(-0.1)).toBe('较昨日 ↓ 10.0%')
    expect(formatDashboardComparison(0)).toBe('较昨日 → 0.0%')
  })

  it('keeps agent rows readable when optional backend fields are null', () => {
    const agent = { agent_id: 'agent_001', scene_id: null, scene_name: null, latest_result: null }
    expect(getAgentSceneLabel(agent)).toBe('未返回')
    expect(getAgentResultLabel(agent)).toBe('未返回')
    expect(getAgentSceneLabel({ ...agent, scene_id: 'scene_a' })).toBe('scene_a')
  })

  it('supports a missing latest_context contract without rendering an error state', () => {
    expect(serializeLatestContext(undefined)).toBeNull()
    expect(serializeLatestContext('  ')).toBeNull()
    expect(serializeLatestContext({ memory_count: 2 })).toContain('"memory_count": 2')
  })

  it('distinguishes explicit current/resolved alerts from historical records', () => {
    expect(getAlertPresentationStatus({ message: 'x', status: 'active' })).toBe('current')
    expect(getAlertPresentationStatus({ message: 'x', status: 'resolved' })).toBe('resolved')
    expect(getAlertPresentationStatus({ message: 'x' })).toBe('historical')
  })
})

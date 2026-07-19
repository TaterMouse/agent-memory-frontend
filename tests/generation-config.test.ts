import { describe, expect, it } from 'vitest'
import {
  generationMenuViews,
  generationPresets,
  getGenerationPath,
  getGenerationPreset,
  getLegacyCapabilityRedirect,
  splitBatchText,
} from '@/constants/generation'

describe('generation presets', () => {
  it('provides nine distinct real workbench entries', () => {
    const paths = generationMenuViews.map(getGenerationPath)

    expect(generationMenuViews).toHaveLength(9)
    expect(new Set(paths).size).toBe(9)
    expect(paths.every((path) => path.startsWith('/generation?view='))).toBe(true)
  })

  it('configures extraction and result focus for representative scenarios', () => {
    expect(generationPresets.preference.extractionTypes).toEqual(['preference'])
    expect(generationPresets.fact.focusMemoryTypes).toContain('key_fact')
    expect(generationPresets.fact.focusMemoryTypes).toContain('constraint')
    expect(generationPresets['task-state'].extractionTypes).toEqual(['task_state'])
    expect(generationPresets['similar-dedup'].focusActions).toEqual([
      'merge',
      'discard',
      'update_existing',
    ])
    expect(generationPresets['low-value'].focusActions).toEqual(['discard'])
  })

  it('falls back to the complete workbench for an unknown query', () => {
    expect(getGenerationPreset('unknown')).toBe(generationPresets.all)
    expect(getGenerationPreset(null)).toBe(generationPresets.all)
  })
})

describe('generation route compatibility', () => {
  it('redirects legacy capability links to their real workbench presets', () => {
    expect(getLegacyCapabilityRedirect('preference-extraction')).toBe('/generation?view=preference')
    expect(getLegacyCapabilityRedirect('memory-fusion-management')).toBe('/generation?view=fusion')
    expect(getLegacyCapabilityRedirect('agent-level-memory')).toBe('/memory')
    expect(getLegacyCapabilityRedirect('missing')).toBe('/')
  })
})

describe('batch input parsing', () => {
  it('trims blank lines and preserves one text per line', () => {
    expect(splitBatchText(' 第一条 \n\n第二条\r\n  第三条  ')).toEqual([
      '第一条',
      '第二条',
      '第三条',
    ])
  })
})

import { useMemo, useState } from 'react'
import { Space } from 'antd'
import { MemoryCard } from '@/components/business/MemoryCard'
import { MemoryFilterBar } from '@/components/business/MemoryFilterBar'
import { FeedbackState, PageContainer } from '@/components/common'
import { mockMemories } from '@/mock/memory.mock'

export default function MemoryPage() {
  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState('all')

  const filteredMemories = useMemo(() => {
    return mockMemories.filter((item) => {
      const matchKeyword = item.content.includes(keyword)
      const matchType = type === 'all' || item.memory_type === type
      return matchKeyword && matchType
    })
  }, [keyword, type])

  return (
    <PageContainer
      title="记忆管理页"
      description="这里保留给记忆列表、筛选、编辑和清理能力。A 已统一好筛选区和空状态模式，后续由 C 继续接真实接口。"
    >
      <Space orientation="vertical" size={16} style={{ display: 'flex' }}>
        <MemoryFilterBar
          keyword={keyword}
          type={type}
          onKeywordChange={setKeyword}
          onTypeChange={setType}
        />
        {filteredMemories.length ? (
          filteredMemories.map((memory) => <MemoryCard key={memory.memory_id} memory={memory} />)
        ) : (
          <FeedbackState
            status="empty"
            title="暂无匹配记忆"
            description="当前没有符合筛选条件的记忆数据。"
          />
        )}
      </Space>
    </PageContainer>
  )
}

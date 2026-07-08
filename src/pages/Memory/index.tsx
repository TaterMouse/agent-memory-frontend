import { useMemo, useState } from 'react'
import { Space } from 'antd'
import { MemoryCard } from '../../components/business/MemoryCard'
import { MemoryFilterBar } from '../../components/business/MemoryFilterBar'
import { EmptyState } from '../../components/common/EmptyState'
import { PageContainer } from '../../components/common/PageContainer'
import { mockMemories } from '../../mock/memory.mock'

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
      description="后续这里会接入记忆列表、编辑、删除和清空能力。"
    >
      <Space direction="vertical" size={16} style={{ display: 'flex' }}>
        <MemoryFilterBar
          keyword={keyword}
          type={type}
          onKeywordChange={setKeyword}
          onTypeChange={setType}
        />
        {filteredMemories.length ? (
          filteredMemories.map((memory) => <MemoryCard key={memory.memory_id} memory={memory} />)
        ) : (
          <EmptyState description="当前没有符合条件的记忆数据。" />
        )}
      </Space>
    </PageContainer>
  )
}

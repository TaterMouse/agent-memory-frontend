import type { ReactNode } from 'react'
import { Flex, Grid, Space, Typography } from 'antd'
import { PageSection } from '@/components/common/PageSection'

interface PageContainerProps {
  title: string
  description?: string
  extra?: ReactNode
  children: ReactNode
}

export function PageContainer({
  title,
  description,
  extra,
  children,
}: PageContainerProps) {
  const screens = Grid.useBreakpoint()
  const isCompact = screens.md !== true

  return (
    <Space orientation="vertical" size={16} style={{ display: 'flex' }}>
      <PageSection>
        <Flex
          vertical={isCompact}
          align={isCompact ? 'stretch' : 'flex-start'}
          justify="space-between"
          gap={12}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {title}
            </Typography.Title>
            {description ? (
              <Typography.Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
                {description}
              </Typography.Paragraph>
            ) : null}
          </div>
          {extra ? <div className="page-container-extra">{extra}</div> : null}
        </Flex>
      </PageSection>
      {children}
    </Space>
  )
}

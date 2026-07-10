import type { ReactNode } from 'react'
import { Space, Typography } from 'antd'
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
  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      <PageSection>
        <Space
          align="start"
          style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
        >
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {title}
            </Typography.Title>
            {description ? (
              <Typography.Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
                {description}
              </Typography.Paragraph>
            ) : null}
          </div>
          {extra}
        </Space>
      </PageSection>
      {children}
    </Space>
  )
}

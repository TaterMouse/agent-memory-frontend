import { Card } from 'antd'
import type { CardProps } from 'antd'

export function PageSection({ children, styles, ...props }: CardProps) {
  return (
    <Card
      bordered={false}
      styles={{
        ...styles,
        body: {
          padding: 24,
          ...styles?.body,
        },
      }}
      {...props}
    >
      {children}
    </Card>
  )
}

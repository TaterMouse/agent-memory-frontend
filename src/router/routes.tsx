import { Button } from 'antd'
import { createBrowserRouter, Link, Navigate } from 'react-router-dom'
import { AppErrorFallback } from '@/components/common'
import { appRoutes } from '@/constants/routes'
import { AppLayout } from '@/layouts/AppLayout'
import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'
import { appRouteConfigs } from '@/router/route-config'

const childRoutes = appRouteConfigs.map((route) => {
  if (route.path === appRoutes.chat) {
    return {
      index: true,
      element: route.element,
    }
  }

  return {
    path: route.path.replace(/^\//, ''),
    element: route.element,
  }
})

export const appRouter = createBrowserRouter([
  {
    path: appRoutes.chat,
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      ...childRoutes,
      {
        path: 'home',
        element: <Navigate replace to={appRoutes.chat} />,
      },
      {
        path: '*',
        element: (
          <AppErrorFallback
            title="页面不存在"
            subtitle="请检查访问路径是否正确。"
            extra={
              <Button type="primary">
                <Link to={appRoutes.chat}>返回首页</Link>
              </Button>
            }
          />
        ),
      },
    ],
  },
])

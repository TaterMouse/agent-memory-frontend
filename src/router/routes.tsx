import { Button } from 'antd'
import { createBrowserRouter, Link, Navigate } from 'react-router-dom'
import { AppErrorFallback } from '@/components/common'
import { appRoutes } from '@/constants/routes'
import { AppLayout } from '@/layouts/AppLayout'
import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'
import { appRouteConfigs } from '@/router/route-config'
import { CapabilityGuideRoutePage } from '@/router/LazyRoutePages'

const childRoutes = appRouteConfigs.map((route) => {
  if (route.path === appRoutes.overview) {
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
    path: appRoutes.overview,
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      ...childRoutes,
      {
        path: 'capabilities/:capabilityId',
        element: <CapabilityGuideRoutePage />,
      },
      {
        path: 'home',
        element: <Navigate replace to={appRoutes.overview} />,
      },
      {
        path: '*',
        element: (
          <AppErrorFallback
            title="页面不存在"
            subtitle="请检查访问路径是否正确。"
            extra={
              <Button type="primary">
                <Link to={appRoutes.overview}>返回首页</Link>
              </Button>
            }
          />
        ),
      },
    ],
  },
])

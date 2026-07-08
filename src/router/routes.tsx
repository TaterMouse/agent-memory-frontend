import { createBrowserRouter } from 'react-router-dom'
import { appRoutes } from '../constants/routes'
import { AppLayout } from '../layouts/AppLayout'
import ChatPage from '../pages/Chat'
import MemoryPage from '../pages/Memory'
import SettingsPage from '../pages/Settings'
import TaskPage from '../pages/Task'

export const appRouter = createBrowserRouter([
  {
    path: appRoutes.chat,
    element: (
      <AppLayout>
        <ChatPage />
      </AppLayout>
    ),
  },
  {
    path: appRoutes.memory,
    element: (
      <AppLayout>
        <MemoryPage />
      </AppLayout>
    ),
  },
  {
    path: appRoutes.task,
    element: (
      <AppLayout>
        <TaskPage />
      </AppLayout>
    ),
  },
  {
    path: appRoutes.settings,
    element: (
      <AppLayout>
        <SettingsPage />
      </AppLayout>
    ),
  },
])

import { lazy, Suspense } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'
import { FeedbackState } from '@/components/common'

const ChatPage = lazy(() => import('@/pages/Chat'))
const MemoryPage = lazy(() => import('@/pages/Memory'))
const SettingsPage = lazy(() => import('@/pages/Settings'))
const TaskPage = lazy(() => import('@/pages/Task'))

function LazyPage({ page: Page }: { page: LazyExoticComponent<ComponentType> }) {
  return (
    <Suspense fallback={<FeedbackState status="loading" description="页面加载中…" />}>
      <Page />
    </Suspense>
  )
}

export function ChatRoutePage() {
  return <LazyPage page={ChatPage} />
}

export function MemoryRoutePage() {
  return <LazyPage page={MemoryPage} />
}

export function SettingsRoutePage() {
  return <LazyPage page={SettingsPage} />
}

export function TaskRoutePage() {
  return <LazyPage page={TaskPage} />
}

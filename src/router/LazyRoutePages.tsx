import { lazy, Suspense } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'
import { FeedbackState } from '@/components/common'

const OverviewPage = lazy(() => import('@/pages/Overview'))
const ModernPrototypePage = lazy(() => import('@/pages/ModernPrototype'))
const AgentAccessPage = lazy(() => import('@/pages/AgentAccess'))
const SceneManagementPage = lazy(() => import('@/pages/SceneManagement'))
const CredentialManagementPage = lazy(() => import('@/pages/CredentialManagement'))
const IngestionPage = lazy(() => import('@/pages/Ingestion'))
const DataValidationPage = lazy(() => import('@/pages/DataValidation'))
const MemoryPage = lazy(() => import('@/pages/Memory'))
const RetrievalPage = lazy(() => import('@/pages/Retrieval'))
const GenerationPage = lazy(() => import('@/pages/Generation'))
const ContextPage = lazy(() => import('@/pages/Context'))
const SettingsPage = lazy(() => import('@/pages/Settings'))
const TaskPage = lazy(() => import('@/pages/Task'))
const MonitoringPage = lazy(() => import('@/pages/Monitoring'))

function LazyPage({ page: Page }: { page: LazyExoticComponent<ComponentType> }) {
  return (
    <Suspense fallback={<FeedbackState status="loading" description="页面加载中…" />}>
      <Page />
    </Suspense>
  )
}

export function OverviewRoutePage() {
  return <LazyPage page={OverviewPage} />
}

export function ModernPrototypeRoutePage() {
  return <LazyPage page={ModernPrototypePage} />
}

export function AgentAccessRoutePage() {
  return <LazyPage page={AgentAccessPage} />
}

export function SceneManagementRoutePage() {
  return <LazyPage page={SceneManagementPage} />
}

export function CredentialManagementRoutePage() {
  return <LazyPage page={CredentialManagementPage} />
}

export function IngestionRoutePage() {
  return <LazyPage page={IngestionPage} />
}

export function DataValidationRoutePage() {
  return <LazyPage page={DataValidationPage} />
}

export function MemoryRoutePage() {
  return <LazyPage page={MemoryPage} />
}

export function RetrievalRoutePage() {
  return <LazyPage page={RetrievalPage} />
}

export function GenerationRoutePage() {
  return <LazyPage page={GenerationPage} />
}

export function ContextRoutePage() {
  return <LazyPage page={ContextPage} />
}

export function SettingsRoutePage() {
  return <LazyPage page={SettingsPage} />
}

export function TaskRoutePage() {
  return <LazyPage page={TaskPage} />
}

export function MonitoringRoutePage() {
  return <LazyPage page={MonitoringPage} />
}

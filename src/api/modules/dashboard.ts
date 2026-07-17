import { request } from '@/api/request'
import type { AdminStatsResult, DashboardResult } from '@/api/types'

export function getAdminStats() {
  return request<AdminStatsResult>({
    url: '/api/v1/admin/stats',
    method: 'GET',
  })
}

export function getDashboard(hours = 24, trendDays = 7) {
  return request<DashboardResult>({
    url: '/api/v1/admin/dashboard',
    method: 'GET',
    params: {
      hours,
      trend_days: trendDays,
    },
  })
}

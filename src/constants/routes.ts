export const appRoutes = {
  chat: '/',
  memory: '/memory',
  task: '/task',
  settings: '/settings',
} as const

export type AppRoutePath = (typeof appRoutes)[keyof typeof appRoutes]

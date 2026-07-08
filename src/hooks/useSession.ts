import { useCallback } from 'react'
import { closeSession, createSession } from '@/api/modules/session'

export function useSession() {
  return {
    create: useCallback(createSession, []),
    close: useCallback(closeSession, []),
  }
}

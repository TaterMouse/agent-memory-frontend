import { Navigate, useParams } from 'react-router-dom'
import { getLegacyCapabilityRedirect } from '@/constants/generation'

export function LegacyCapabilityRedirect() {
  const { capabilityId } = useParams()
  return <Navigate replace to={getLegacyCapabilityRedirect(capabilityId)} />
}

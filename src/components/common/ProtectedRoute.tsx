import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  requireAgent?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireAgent = false,
}) => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // Developer admin/testing override (read early)
  const isDevAdmin = typeof window !== 'undefined' && !!localStorage.getItem('dev_admin_logged_in')
  const isEnvAdminEmail = user?.email === import.meta.env.VITE_TEST_ADMIN_EMAIL

  // Allow dev admin through admin routes even without user session
  if (requireAdmin && isDevAdmin) {
    return <>{children}</>
  }

  // Show a clean loading state while auth/profile are resolving
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  // If no authenticated user
  if (!user) {
    if (requireAdmin) {
      // For admin-only routes, send to admin login
      const redirect = encodeURIComponent(location.pathname + location.search)
      return <Navigate to={`/admin/login?redirect=${redirect}`} replace />
    }
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth?redirect=${redirect}`} replace />
  }

  // Admin-only routes
  if (requireAdmin) {
    const isAdmin = profile?.role === 'admin' || isEnvAdminEmail || isDevAdmin
    if (!isAdmin) return <Navigate to="/404" replace />
  }

  // Agent routes (admin also allowed)
  if (requireAgent) {
    const isAgentOrAdmin = profile?.role === 'agent' || profile?.role === 'admin'
    if (!isAgentOrAdmin) return <Navigate to="/404" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

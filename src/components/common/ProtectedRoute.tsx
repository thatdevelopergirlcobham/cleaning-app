import React from 'react'
// import type { UserProfile } from '../../contexts/AuthContext.types';
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

  // Shortened loading time for authentication check
  const [showLoading, setShowLoading] = React.useState(loading);

  React.useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 1000); // Show loader for max 1 second
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading && showLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const isDevAdmin = typeof window !== 'undefined' && !!localStorage.getItem('dev_admin_logged_in')

  if (!user) {
    // Allow developer admin access when dev flag is set and route requires admin
    if (requireAdmin && isDevAdmin) {
      // allow through (no user profile available but flagged as dev admin)
    } else {
      // Redirect to auth page with return url
      return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />
    }
  }

  // Check role-based access and admin email
  if (requireAdmin) {
    const isDevAdmin = typeof window !== 'undefined' && !!localStorage.getItem('dev_admin_logged_in')
    const isEnvAdminEmail = user?.email === import.meta.env.VITE_TEST_ADMIN_EMAIL
    if (profile?.role !== 'admin' && !isEnvAdminEmail && !isDevAdmin) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  if (requireAgent && profile?.role !== 'agent' && profile?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

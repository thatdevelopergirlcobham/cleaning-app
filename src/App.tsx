import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AuthProvider } from './contexts/AuthContext'
import { UIProvider } from './contexts/UIContext'
import { ToastProvider } from './contexts/ToastContext'
import NotificationProvider from './contexts/NotificationContext'
import { AIProvider } from './contexts/AIContext'
import LandingPage from './pages/LandingPage'

// Common Components
import Navbar from './components/Navbar';
import MobileBottomNav from './components/common/MobileBottomNav'
import ProtectedRoute from './components/common/ProtectedRoute'
import Toaster from './components/common/Toaster'
import AIChatBot from './components/common/AIChatBot'
import { MapView } from './components/MapView'
import UserReportsManager from './components/community/UserReportsManager'

// Community Pages
import HomeTau from './pages/community/HomeTau'
// import Events from './pages/community/Events'
// import AgentHire from './pages/community/AgentHire'
import Logout from './pages/auth/Logout'
import Profile from './pages/community/Profile'
import ReportDetailPage from './pages/community/ReportDetail'
import HireCleaners from './pages/community/HireCleaners'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import PendingReports from './pages/admin/PendingReports'
import Agents from './pages/admin/Agents'
import AdminLogin from './pages/admin/AdminLogin'

// Auth & Other Pages
import Auth from './pages/Auth'
import About from './pages/About'
import NotFound from './pages/NotFound'
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard'
import AgentHire from './pages/community/AgentHire'

// Redirect component for authenticated users visiting landing page
const AuthenticatedHomeRedirect: React.FC = () => {
  const { user } = useAuth()
  return user ? <Navigate to="/home" replace /> : <LandingPage />
}

const Shell: React.FC = () => {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdminRoute && <Navbar />}
      <main className="pb-16 md:pb-0">
        <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<AuthenticatedHomeRedirect />} />
                      
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/logout" element={<Logout />} />
                      <Route path="/about" element={<About />} />

                      
                      <Route path="/home" element={<HomeTau />} />

                      {/* Community Routes */}
                      <Route path="/reports/:id" element={<ReportDetailPage />} />
                      <Route path="/reports-map" element={<MapView />} />
                      <Route path="/my-reports" element={<UserReportsManager />} />
                      <Route path="/agents" element={<AgentHire />} />
                      <Route path="/hire-cleaners" element={<HireCleaners />} />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Routes */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/reports"
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <PendingReports />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/agents"
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <Agents />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/analytics"
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <AnalyticsDashboard />
                          </ProtectedRoute>
                        }
                      />

                      {/* Fallback Routes */}
                      <Route path="/404" element={<NotFound />} />
                      <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>

      {!isAdminRoute && <MobileBottomNav />}
      <Toaster />
      <AIChatBot />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <UIProvider>
          <ToastProvider>
            <NotificationProvider value={null}>
              <AIProvider>
                <Shell />
              </AIProvider>
            </NotificationProvider>
          </ToastProvider>
        </UIProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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

// Community Pages
import CommunityHome from './pages/community/CommunityHome'
import ReportNew from './pages/community/ReportNew'
import Events from './pages/community/Events'
import AgentHire from './pages/community/AgentHire'
import Profile from './pages/community/Profile'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import PendingReports from './pages/admin/PendingReports'
import Agents from './pages/admin/Agents'

// Auth & Other Pages
import Auth from './pages/Auth'
import About from './pages/About'
import NotFound from './pages/NotFound'
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard'

// Redirect component for authenticated users visiting landing page
const AuthenticatedHomeRedirect: React.FC = () => {
  const { user } = useAuth()
  return user ? <Navigate to="/home" replace /> : <LandingPage />
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <UIProvider>
          <ToastProvider>
            <NotificationProvider value={null}>
              <AIProvider>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="pb-16 md:pb-0">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<AuthenticatedHomeRedirect />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/about" element={<About />} />

                      {/* Authenticated User Routes */}
                      <Route
                        path="/home"
                        element={
                          // <ProtectedRoute>
                            <CommunityHome />
                          // </ProtectedRoute>
                        }
                      />

                      {/* Community Routes */}
                      <Route path="/report" element={<ReportNew />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/agents" element={<AgentHire />} />
                      <Route
                        path="/profile"
                        element={
                          // <ProtectedRoute>
                            <Profile />
                          // </ProtectedRoute>
                        }
                      />

                      {/* Admin Routes */}
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

                  <MobileBottomNav />
                  <Toaster />
                  <AIChatBot />
                </div>
              </AIProvider>
            </NotificationProvider>
          </ToastProvider>
        </UIProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
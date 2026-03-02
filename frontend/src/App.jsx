import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from './store/authStore'
import { useUIStore } from './store/uiStore'
import Layout from './components/layout/Layout'
import PageLoader from './components/common/PageLoader'
import ErrorBoundary from './components/common/ErrorBoundary'
import { useSocket } from './hooks/useSocket'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Auth/Login'))
const Register = lazy(() => import('./pages/Auth/Register'))
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'))
const VerifyEmail = lazy(() => import('./pages/Auth/VerifyEmail'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const EditProfile = lazy(() => import('./pages/EditProfile'))
const BrowseSessions = lazy(() => import('./pages/Sessions/BrowseSessions'))
const SessionDetail = lazy(() => import('./pages/Sessions/SessionDetail'))
const CreateSession = lazy(() => import('./pages/Sessions/CreateSession'))
const SessionRoom = lazy(() => import('./pages/Sessions/SessionRoom'))
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers'))
const NotFound = lazy(() => import('./pages/NotFound'))

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

function SocketInit() {
  useSocket()
  return null
}

export default function App() {
  const { isAuthenticated, refreshUser } = useAuthStore()
  const { theme } = useUIStore()

  // Apply saved theme on mount and changes
  useEffect(() => {
    const html = document.documentElement
    if (theme === 'light') {
      html.classList.add('light')
    } else {
      html.classList.remove('light')
    }
  }, [theme])

  // Refresh user (gets latest creditsBalance from DB) whenever auth state is active
  useEffect(() => {
    if (isAuthenticated) refreshUser()
  }, [isAuthenticated])

  return (
    <ErrorBoundary>
      {isAuthenticated && <SocketInit />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sessions" element={<BrowseSessions />} />
          <Route path="/sessions/:id" element={<SessionDetail />} />
          <Route path="/p/:slug" element={<Profile />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/sessions/create" element={<ProtectedRoute><CreateSession /></ProtectedRoute>} />
          </Route>
          <Route path="/sessions/:id/room" element={<ProtectedRoute><SessionRoom /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

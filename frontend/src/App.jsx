import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Domains from './pages/Domains'
import DomainEditor from './pages/DomainEditor'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Admin from './pages/Admin'

function PrivateRoute({ children }) {
  const { company, loading } = useAuth()
  if (loading) return <div className="loading-page"><span className="spinner" /></div>
  if (!company) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

function PublicRoute({ children }) {
  const { company, loading } = useAuth()
  if (loading) return <div className="loading-page"><span className="spinner" /></div>
  if (company) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"            element={<Landing />} />
      <Route path="/login"       element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register"    element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard"   element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/domains"     element={<PrivateRoute><Domains /></PrivateRoute>} />
      <Route path="/domains/:id" element={<PrivateRoute><DomainEditor /></PrivateRoute>} />
      <Route path="/analytics"   element={<PrivateRoute><Analytics /></PrivateRoute>} />
      <Route path="/settings"    element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/admin"       element={<Admin />} />
      <Route path="*"            element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
            },
            success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--bg)' } },
            error:   { iconTheme: { primary: 'var(--red)',   secondary: 'var(--bg)' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
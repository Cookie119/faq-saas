import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Database, BarChart2, Settings, LogOut, Shield } from 'lucide-react'

export default function Layout({ children }) {
  const { company, logout } = useAuth()
  const navigate = useNavigate()

  // Only show Admin link if the logged-in user's email matches the admin email
  // We detect this by checking sessionStorage admin credentials set in Admin.jsx
  const isAdmin = !!(
    sessionStorage.getItem('admin_email') && sessionStorage.getItem('admin_key')
  )

  const doLogout = () => {
    logout()
    navigate('/login')
  }

  const getTitle = () => {
    const path = window.location.pathname
    if (path === '/dashboard')       return 'Overview'
    if (path.startsWith('/domains')) return 'Domains'
    if (path === '/analytics')       return 'Analytics'
    if (path === '/settings')        return 'Settings'
    if (path === '/admin')           return 'Admin'
    return 'Dashboard'
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo_green.svg" alt="Ginkgo" />
          <div>
            <div className="logo-mark">ginkgo</div>
            <div className="logo-sub">Dashboard</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <LayoutDashboard size={15} /><span>Overview</span>
          </NavLink>

          <NavLink to="/domains" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Database size={15} /><span>Domains</span>
          </NavLink>

          <NavLink to="/analytics" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <BarChart2 size={15} /><span>Analytics</span>
          </NavLink>

          <NavLink to="/settings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Settings size={15} /><span>Settings</span>
          </NavLink>

          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <Shield size={15} /><span>Admin</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="plan-badge">
            <div className="plan-name">{company?.plan || 'Free'} Plan</div>
            <div className="plan-usage">{company?.name || 'User Account'}</div>
          </div>
          <button className="nav-item" style={{ width: '100%' }} onClick={doLogout}>
            <LogOut size={15} /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="topbar-title">{getTitle()}</div>
        </div>
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  )
}
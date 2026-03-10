import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Database, Settings, LogOut } from 'lucide-react'

export default function Layout({ children }) {
  const { company, logout } = useAuth()
  const navigate = useNavigate()

  const doLogout = () => {
    logout()
    navigate('/login')
  }

  // Helper to get current page title for the top bar
  const getTitle = () => {
    const path = window.location.pathname
    if (path === '/dashboard') return 'Overview'
    if (path.startsWith('/domains')) return 'Domains'
    if (path === '/settings') return 'Settings'
    return 'Dashboard'
  }

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">faqbot</div>
          <div className="logo-sub">Dashboard</div>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={16} /> 
            <span>Overview</span>
          </NavLink>
          
          <NavLink 
            to="/domains" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Database size={16} /> 
            <span>Domains</span>
          </NavLink>
          
          <NavLink 
            to="/settings" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Settings size={16} /> 
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="plan-badge">
            <div className="plan-name">{company?.plan || 'Free'} Plan</div>
            <div className="plan-usage">{company?.name || 'User Account'}</div>
          </div>
          <button className="nav-item" onClick={doLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
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
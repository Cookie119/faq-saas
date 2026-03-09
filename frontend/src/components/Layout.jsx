import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Database, Settings, LogOut } from 'lucide-react'

export default function Layout({ children }) {
  const { company, logout } = useAuth()
  const navigate = useNavigate()

  const doLogout = () => { logout(); navigate('/login') }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">faqbot</div>
          <div className="logo-sub">dashboard</div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={15} /> Overview
          </NavLink>
          <NavLink to="/domains" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Database size={15} /> Domains
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={15} /> Settings
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="plan-badge">
            <div className="plan-name">{company?.plan || 'free'}</div>
            <div className="plan-usage">{company?.name}</div>
          </div>
          <button className="nav-item" style={{ marginTop: 4 }} onClick={doLogout}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="topbar-title">
            {window.location.pathname === '/dashboard' && 'Overview'}
            {window.location.pathname.startsWith('/domains') && 'Domains'}
            {window.location.pathname === '/settings' && 'Settings'}
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
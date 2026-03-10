import { useState, useEffect } from 'react'
import axios from 'axios'
import { Shield, RefreshCw, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
// Import SCSS in main entry file

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const PLANS = ['free', 'pro', 'enterprise']

export default function Admin() {
  const [email,     setEmail]     = useState(sessionStorage.getItem('admin_email') || '')
  const [secretKey, setSecretKey] = useState(sessionStorage.getItem('admin_key') || '')
  const [authed, setAuthed] = useState(
    !!(sessionStorage.getItem('admin_email') && sessionStorage.getItem('admin_key'))
  )
  const [companies, setCompanies] = useState([])
  const [stats,     setStats]     = useState(null)
  const [loading,   setLoading]   = useState(false)

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('admin_email')
    const savedKey   = sessionStorage.getItem('admin_key')
    if (!savedEmail || !savedKey) return

    axios.post(`${BASE}/admin/login`, { email: savedEmail, secret_key: savedKey })
      .then(() => Promise.all([
        axios.get(`${BASE}/admin/companies`, { params: { email: savedEmail, secret_key: savedKey } }),
        axios.get(`${BASE}/admin/stats`,     { params: { email: savedEmail, secret_key: savedKey } }),
      ]))
      .then(([c, s]) => {
        setCompanies(c.data.companies)
        setStats(s.data)
        setAuthed(true)
      })
      .catch(() => {
        sessionStorage.removeItem('admin_email')
        sessionStorage.removeItem('admin_key')
      })
  }, [])

  const load = async () => {
    if (!email || !secretKey) return
    setLoading(true)
    try {
      await axios.post(`${BASE}/admin/login`, { email, secret_key: secretKey })
      const [c, s] = await Promise.all([
        axios.get(`${BASE}/admin/companies`, { params: { email, secret_key: secretKey } }),
        axios.get(`${BASE}/admin/stats`,     { params: { email, secret_key: secretKey } }),
      ])
      setCompanies(c.data.companies)
      setStats(s.data)
      setAuthed(true)
      sessionStorage.setItem('admin_email', email)
      sessionStorage.setItem('admin_key',   secretKey)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Access denied')
      setAuthed(false)
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    setLoading(true)
    try {
      const [c, s] = await Promise.all([
        axios.get(`${BASE}/admin/companies`, { params: { email, secret_key: secretKey } }),
        axios.get(`${BASE}/admin/stats`,     { params: { email, secret_key: secretKey } }),
      ])
      setCompanies(c.data.companies)
      setStats(s.data)
    } catch { toast.error('Refresh failed') }
    finally { setLoading(false) }
  }

  const changePlan = async (companyId, plan) => {
    try {
      await axios.put(`${BASE}/admin/companies/${companyId}/plan`, {
        email, secret_key: secretKey, plan,
      })
      toast.success(`Plan updated to ${plan}`)
      refresh()
    } catch { toast.error('Failed to update plan') }
  }

  const deleteCompany = async (company) => {
    if (!confirm(`Delete "${company.name}"? This removes ALL their domains and data permanently.`)) return
    try {
      await axios.delete(`${BASE}/admin/companies/${company.id}`, {
        data: { email, secret_key: secretKey },
      })
      toast.success('Company deleted')
      refresh()
    } catch { toast.error('Failed to delete') }
  }

  const signOut = () => {
    sessionStorage.removeItem('admin_email')
    sessionStorage.removeItem('admin_key')
    setAuthed(false)
    setEmail('')
    setSecretKey('')
  }

  // ── Login Gate ────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="auth-page">
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div className="flex-center mb-6" style={{ justifyContent: 'center' }}>
            <Shield size={20} style={{ color: '#2D6A4F', marginRight: 8 }} />
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', color: '#111' }}>
              Admin Access
            </h1>
          </div>
          <div className="card">
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="your ADMIN_EMAIL from .env"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Secret Key</label>
              <input
                className="form-input"
                type="password"
                placeholder="your generated admin key"
                value={secretKey}
                onChange={e => setSecretKey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && load()}
              />
            </div>
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={load}
              disabled={loading || !email || !secretKey}
            >
              {loading ? <span className="spinner" /> : <><Shield size={14} style={{marginRight: 6}} /> Access Admin Panel</>}
            </button>
            <div className="text-muted" style={{ marginTop: 16, fontSize: '0.75rem', textAlign: 'center' }}>
              Credentials set via <code style={{ color: '#2D6A4F', background: 'rgba(45,106,79,0.1)', padding: '2px 4px', borderRadius: '4px' }}>ADMIN_EMAIL</code> and{' '}
              <code style={{ color: '#2D6A4F', background: 'rgba(45,106,79,0.1)', padding: '2px 4px', borderRadius: '4px' }}>ADMIN_SECRET_KEY_HASH</code>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Admin Panel ────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="flex-center mb-6" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', color: '#111', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={20} style={{ color: '#2D6A4F' }} />
            Admin Panel
          </h1>
          <div className="text-muted">Logged in as {email} · {companies.length} companies</div>
        </div>
        <div className="flex-center" style={{ gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={refresh} disabled={loading}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn btn-ghost btn-sm" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </div>

      {stats && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Total Companies</div>
            <div className="stat-value">{stats.total_companies}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Total Domains</div>
            <div className="stat-value">{stats.total_domains}</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-label">Total Questions</div>
            <div className="stat-value">{stats.total_questions}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Plan Split</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-amber">{stats.plan_breakdown.free} free</span>
              <span className="badge badge-blue">{stats.plan_breakdown.pro} pro</span>
              <span className="badge badge-green">{stats.plan_breakdown.enterprise} ent.</span>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Plan</th>
                <th>Domains</th>
                <th>This Month</th>
                <th>All Time</th>
                <th>Joined</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontFamily: "'DM Serif Display', serif", color: '#111' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#7a7a76' }}>{c.email}</div>
                  </td>
                  <td>
                    <select
                      value={c.plan}
                      onChange={e => changePlan(c.id, e.target.value)}
                      className="form-select"
                    >
                      {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td>{c.domains}</td>
                  <td style={{ color: c.questions_used > 400 ? '#B57A1A' : '#3a3a38', fontWeight: 500 }}>
                    {c.questions_used}
                  </td>
                  <td>{c.total_questions}</td>
                  <td className="text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteCompany(c)}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      login(data)
      toast.success(`Welcome back!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        
        <Link to="/" className="auth-logo">
            <img src="/logo_green.svg" alt="Logo" />
            <span>ginkgo</span>
        </Link>
        <div className="auth-tagline">// Multi-tenant FAQ intelligence</div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
          </div>
          
          <button 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} 
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Sign in →'}
          </button>
        </form>

        <div className="auth-switch">
          No account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  )
}
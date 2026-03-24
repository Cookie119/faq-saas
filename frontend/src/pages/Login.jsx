import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function getErrorMessage(err) {
  const detail = err?.response?.data?.detail
  if (!detail) return 'Login failed. Please try again.'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map(d => d.msg || d.message || JSON.stringify(d)).join(', ')
  return 'Login failed. Please try again.'
}

function validate(form) {
  if (!form.email.trim()) return 'Email is required'
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRe.test(form.email.trim())) return 'Enter a valid email address'
  if (!form.password) return 'Password is required'
  return null
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const f = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setErrors(p => ({ ...p, [field]: '' }))
  }

  const submit = async (e) => {
    e.preventDefault()

    // client-side validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const errs = {}
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!emailRe.test(form.email)) errs.email = 'Enter a valid email (e.g. you@example.com)'
    if (!form.password) errs.password = 'Password is required'

    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      if (!data) throw new Error('Empty response')
      login(data)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
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

        <form onSubmit={submit} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={f('email')}
              style={errors.email ? { borderColor: 'var(--red)' } : {}}
            />
            {errors.email && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.email}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={f('password')}
              style={errors.password ? { borderColor: 'var(--red)' } : {}}
            />
            {errors.password && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.password}</div>}
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Sign in →'}
          </button>
        </form>

        <div className="auth-switch">
          No account? <Link to="/register">Create one</Link>
        </div>

      </div>
      <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
        <Link to="/forgot-password"
          style={{ fontSize: '0.78rem', color: 'var(--green)', textDecoration: 'none' }}>
          Forgot password?
        </Link>
      </div>
    </div>
  )
}
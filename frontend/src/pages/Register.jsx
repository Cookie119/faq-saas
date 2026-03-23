import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function getErrorMessage(err) {
  const detail = err?.response?.data?.detail
  if (!detail) return 'Registration failed. Please try again.'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map(d => d.msg || d.message || JSON.stringify(d)).join(', ')
  return 'Registration failed. Please try again.'
}

export default function Register() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const f = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setErrors(p => ({ ...p, [field]: '' }))
  }

  const submit = async (e) => {
    e.preventDefault()

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const errs = {}

    if (!form.name.trim())
      errs.name = 'Company name is required'
    else if (form.name.trim().length < 2)
      errs.name = 'Company name must be at least 2 characters'

    if (!form.email.trim())
      errs.email = 'Email is required'
    else if (!emailRe.test(form.email.trim()))
      errs.email = 'Enter a valid email (e.g. you@example.com)'

    if (!form.password)
      errs.password = 'Password is required'
    else if (form.password.length < 8)
      errs.password = 'Password must be at least 8 characters'

    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const { data } = await authAPI.register(form)
      if (!data) throw new Error('Empty response')
      login(data)
      toast.success('Account created! Your API key is ready.')
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
        <div className="auth-tagline">// deploy your first bot in 2 minutes</div>

        <form onSubmit={submit} noValidate>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              className="form-input"
              placeholder="Acme Corp"
              value={form.name}
              onChange={f('name')}
              style={errors.name ? { borderColor: 'var(--red)' } : {}}
            />
            {errors.name && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.name}</div>}
          </div>
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
              placeholder="min 8 characters"
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
            {loading ? <span className="spinner" /> : 'Create account →'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
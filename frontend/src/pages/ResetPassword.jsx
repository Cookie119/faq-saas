import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [token,     setToken]    = useState('')
  const [password,  setPassword] = useState('')
  const [confirm,   setConfirm]  = useState('')
  const [loading,   setLoading]  = useState(false)
  const [done,      setDone]     = useState(false)
  const [errors,    setErrors]   = useState({})

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    if (!t) navigate('/forgot-password')
    else setToken(t)
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!password)              errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (!confirm)               errs.confirm  = 'Please confirm your password'
    else if (password !== confirm) errs.confirm = 'Passwords do not match'

    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    try {
      await axios.post(`${BASE}/auth/reset-password`, {
        token,
        new_password: password,
      })
      setDone(true)
      toast.success('Password updated!')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Reset failed. The link may have expired.'
      toast.error(msg)
      if (msg.toLowerCase().includes('expired')) {
        setTimeout(() => navigate('/forgot-password'), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <img src="/logo_green.svg" alt="Ginkgo" />
          <span>ginkgo</span>
        </Link>
        <div className="auth-tagline">// set a new password</div>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--green-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 24,
            }}>
              ✓
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)', marginBottom: 8 }}>
              Password updated!
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink3)', lineHeight: 1.6 }}>
              Redirecting you to sign in…
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink3)', marginBottom: 24, lineHeight: 1.6 }}>
              Choose a strong new password for your account.
            </p>
            <form onSubmit={submit} noValidate>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="min 8 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                  style={errors.password ? { borderColor: 'var(--red)' } : {}}
                  autoFocus
                />
                {errors.password && (
                  <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.password}</div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="repeat your password"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })) }}
                  style={errors.confirm ? { borderColor: 'var(--red)' } : {}}
                />
                {errors.confirm && (
                  <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.confirm}</div>
                )}
              </div>
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : 'Update password →'}
              </button>
            </form>

            <div className="auth-switch">
              <Link to="/forgot-password">Request a new link</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

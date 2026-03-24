import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function ForgotPassword() {
  const [email,     setEmail]   = useState('')
  const [loading,   setLoading] = useState(false)
  const [sent,      setSent]    = useState(false)
  const [error,     setError]   = useState('')

  const submit = async (e) => {
    e.preventDefault()
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim())          { setError('Email is required'); return }
    if (!emailRe.test(email))   { setError('Enter a valid email address'); return }
    setError('')
    setLoading(true)
    try {
      await axios.post(`${BASE}/auth/forgot-password`, { email: email.trim() })
      setSent(true)
    } catch {
      // Always show success to prevent user enumeration
      setSent(true)
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
        <div className="auth-tagline">// password recovery</div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--green-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 24,
            }}>
              ✉️
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)', marginBottom: 8 }}>
              Check your inbox
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink3)', lineHeight: 1.6, marginBottom: 24 }}>
              If <strong style={{ color: 'var(--ink2)' }}>{email}</strong> is registered,
              you'll receive a reset link shortly. Check your spam folder if it doesn't arrive.
            </p>
            <Link to="/login" style={{
              fontSize: '0.85rem', color: 'var(--green)',
              textDecoration: 'none', fontWeight: 600,
            }}>
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink3)', marginBottom: 24, lineHeight: 1.6 }}>
              Enter your account email and we'll send you a link to reset your password.
            </p>
            <form onSubmit={submit} noValidate>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  style={error ? { borderColor: 'var(--red)' } : {}}
                  autoFocus
                />
                {error && (
                  <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{error}</div>
                )}
              </div>
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : 'Send reset link →'}
              </button>
            </form>

            <div className="auth-switch">
              Remember it? <Link to="/login">Sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

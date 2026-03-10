import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
// Ensure your SCSS is imported in your main.jsx or App.jsx

export default function Register() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authAPI.register(form)
      login(data)
      toast.success('Account created! Your API key is ready.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
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

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              className="form-input"
              placeholder="Acme Corp"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
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
              placeholder="min 8 characters"
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
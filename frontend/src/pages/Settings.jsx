import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api/client'
import { Copy, RefreshCw, Check, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const { company, apiKey, logout } = useAuth()
  const [rotating, setRotating] = useState(false)
  const [copied,   setCopied]   = useState(false)
  const [currentKey, setCurrentKey] = useState(apiKey)

  const copyKey = () => {
    navigator.clipboard.writeText(currentKey)
    setCopied(true)
    toast.success('API key copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const rotateKey = async () => {
    if (!confirm('Rotate API key? Your current key will stop working immediately.')) return
    setRotating(true)
    try {
      const { data } = await authAPI.rotateKey()
      localStorage.setItem('api_key', data.api_key)
      setCurrentKey(data.api_key)
      toast.success('API key rotated!')
    } catch {
      toast.error('Failed to rotate key')
    } finally {
      setRotating(false)
    }
  }

  return (
    <div className="page">
      <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>
        Settings
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
        {/* Account */}
        <div className="card">
          <div className="card-title">Account</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div className="form-label">Company Name</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{company?.name}</div>
            </div>
            <div>
              <div className="form-label">Plan</div>
              <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{company?.plan}</span>
            </div>
          </div>
        </div>

        {/* API Key */}
        <div className="card">
          <div className="card-title">API Key</div>
          <div className="text-muted mb-4">
            Use this key in the <code style={{ color: 'var(--accent)' }}>X-API-Key</code> header when calling <code style={{ color: 'var(--accent)' }}>POST /ask</code> from your website.
          </div>
          <div className="api-key-box">
            <div className="api-key-text">{currentKey}</div>
            <button className="btn btn-ghost btn-sm" onClick={copyKey}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={rotateKey} disabled={rotating}>
              {rotating ? <span className="spinner" /> : <RefreshCw size={13} />}
              Rotate Key
            </button>
          </div>
        </div>

        {/* Usage example */}
        <div className="card">
          <div className="card-title">Integration Example</div>
          <pre style={{
            background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            padding: '14px', fontSize: '0.72rem', color: 'var(--accent)', overflowX: 'auto', lineHeight: 1.7
          }}>{`fetch("https://faq-saas.onrender.com/ask", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "${currentKey?.slice(0, 20)}..."
  },
  body: JSON.stringify({
    domain_id: "your-slug",
    question: "User's question here"
  })
})`}</pre>
        </div>

        {/* Logout */}
        <div className="card">
          <div className="card-title">Session</div>
          <button className="btn btn-danger" onClick={logout}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
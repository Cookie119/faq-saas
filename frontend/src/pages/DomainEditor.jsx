import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { domainsAPI, askAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Upload, Send, Bot, FileText, Save, Shield, Plus, X, Code, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const isNew = (id) => id === 'new'

// ── Embed Code Panel ──────────────────────────────────────────────
function EmbedPanel({ domain, apiKey }) {
  const [mode,    setMode]    = useState('bubble')
  const [color,   setColor]   = useState('#84B179')
  const [title,   setTitle]   = useState(domain?.display_name || 'Ask a question')
  const [pos,     setPos]     = useState('right')
  const [copied,  setCopied]  = useState(false)

  const snippet = mode === 'bubble'
    ? `<script
  src="${BASE}/static/widget.js"
  data-domain="${domain?.slug || 'your-domain'}"
  data-api-key="${apiKey || 'YOUR_API_KEY'}"
  data-mode="bubble"
  data-color="${color}"
  data-title="${title}"
  data-position="${pos}"
  data-api-url="${BASE}"
><\/script>`
    : `<!-- Add this where you want the chat to appear -->
<div id="ginkgo-chat"></div>

<script
  src="${BASE}/static/widget.js"
  data-domain="${domain?.slug || 'your-domain'}"
  data-api-key="${apiKey || 'YOUR_API_KEY'}"
  data-mode="inline"
  data-target="#ginkgo-chat"
  data-color="${color}"
  data-title="${title}"
  data-api-url="${BASE}"
><\/script>`

  const copy = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    toast.success('Embed code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card">
      <div className="card-title">
        <Code size={14} style={{ marginRight: 8 }} /> Embed Widget
      </div>
      <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 16 }}>
        Paste this snippet into any webpage to add a chat widget backed by this domain.
      </p>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['bubble', 'inline'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '5px 14px', borderRadius: 6, border: '1px solid',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', textTransform: 'capitalize',
              background: mode === m ? 'var(--green)' : 'transparent',
              color:      mode === m ? '#fff' : 'var(--ink2)',
              borderColor: mode === m ? 'var(--green)' : 'var(--border2)',
              transition: 'all .15s',
            }}
          >{m}</button>
        ))}
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Accent color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              style={{ width: 34, height: 34, border: '1px solid var(--border2)', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'var(--bg3)' }} />
            <input className="form-input" value={color} onChange={e => setColor(e.target.value)}
              style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }} />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Widget title</label>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        {mode === 'bubble' && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Position</label>
            <select className="form-select" style={{ width: '100%' }} value={pos} onChange={e => setPos(e.target.value)}>
              <option value="right">Bottom right</option>
              <option value="left">Bottom left</option>
            </select>
          </div>
        )}
      </div>

      {/* Code block */}
      <div style={{ position: 'relative' }}>
        <pre style={{
          background: 'var(--bg3)', border: '1px solid var(--border2)',
          borderRadius: 8, padding: '14px 16px',
          fontFamily: 'DM Mono, monospace', fontSize: '0.72rem',
          lineHeight: 1.75, color: 'var(--ink2)',
          overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}>
          {snippet}
        </pre>
        <button
          onClick={copy}
          style={{
            position: 'absolute', top: 10, right: 10,
            background: 'var(--bg2)', border: '1px solid var(--border2)',
            borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink2)',
            fontFamily: 'inherit', transition: 'all .15s',
          }}
        >
          {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>

      {/* Attributes reference */}
      <details style={{ marginTop: 14 }}>
        <summary style={{ fontSize: '0.78rem', color: 'var(--ink3)', cursor: 'pointer', userSelect: 'none' }}>
          All data-* attributes
        </summary>
        <div style={{
          marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4,
          fontFamily: 'DM Mono, monospace', fontSize: '0.72rem',
        }}>
          {[
            ['data-domain',      'required', 'Your domain slug'],
            ['data-api-key',     'required', 'Your API key'],
            ['data-api-url',     'optional', 'API base URL (default: production)'],
            ['data-mode',        'optional', '"bubble" (default) or "inline"'],
            ['data-target',      'optional', 'CSS selector for inline mode'],
            ['data-color',       'optional', 'Accent hex color (default: #84B179)'],
            ['data-text-color',  'optional', 'Button text color (default: #ffffff)'],
            ['data-title',       'optional', 'Chat header title'],
            ['data-placeholder', 'optional', 'Input placeholder text'],
            ['data-position',    'optional', '"right" or "left" (bubble mode)'],
          ].map(([attr, req, desc]) => (
            <div key={attr} style={{ display: 'flex', gap: 10, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--green)', minWidth: 160 }}>{attr}</span>
              <span style={{ color: 'var(--ink3)', minWidth: 60 }}>{req}</span>
              <span style={{ color: 'var(--ink2)' }}>{desc}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────
export default function DomainEditor() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { apiKey }  = useAuth()
  const fileRef     = useRef()

  const [form, setForm] = useState({
    slug: '', display_name: '', persona: '', tone: 'helpful and professional',
    language: 'English', fallback_msg: '',
  })
  const [domain,    setDomain]    = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [file,      setFile]      = useState(null)

  const [allowedOrigins, setAllowedOrigins] = useState([])
  const [newOrigin,      setNewOrigin]      = useState('')
  const [savingOrigins,  setSavingOrigins]  = useState(false)

  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [asking,   setAsking]   = useState(false)
  const chatRef = useRef()

  useEffect(() => {
    if (!isNew(id)) {
      domainsAPI.list().then(r => {
        const d = r.data.domains.find(x => x.id === id)
        if (!d) { navigate('/domains'); return }
        setDomain(d)
        setForm({
          slug: d.slug, display_name: d.display_name,
          persona: d.persona || '', tone: d.tone || 'helpful and professional',
          language: d.language || 'English', fallback_msg: d.fallback_msg || '',
        })
        setAllowedOrigins(d.allowed_origins || [])
      })
    }
  }, [id])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isNew(id)) {
        const { data } = await domainsAPI.create(form)
        toast.success('Domain created!')
        navigate(`/domains/${data.id}`)
      } else {
        await domainsAPI.update(id, form)
        toast.success('Domain updated!')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed')
    } finally { setSaving(false) }
  }

  const uploadFile = async () => {
    if (!file || isNew(id)) return
    setUploading(true)
    try {
      const { data } = await domainsAPI.upload(id, file)
      setDomain(data)
      toast.success(`Uploaded! ${data.chunk_count} chunks indexed.`)
      setFile(null)
      fileRef.current.value = ''
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally { setUploading(false) }
  }

  const addOrigin = () => {
    let origin = newOrigin.trim().toLowerCase()
    if (!origin) return
    if (!origin.startsWith('http')) origin = 'https://' + origin
    origin = origin.replace(/\/$/, '')
    if (allowedOrigins.includes(origin)) { toast.error('Already added'); return }
    setAllowedOrigins(p => [...p, origin])
    setNewOrigin('')
  }

  const removeOrigin = (o) => setAllowedOrigins(p => p.filter(x => x !== o))

  const saveOrigins = async () => {
    setSavingOrigins(true)
    try {
      await domainsAPI.update(id, { allowed_origins: allowedOrigins })
      toast.success(allowedOrigins.length === 0
        ? 'Restrictions removed — all origins allowed'
        : `${allowedOrigins.length} allowed origin(s) saved`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed')
    } finally { setSavingOrigins(false) }
  }

  const askQuestion = async (e) => {
    e.preventDefault()
    if (!question.trim() || !domain?.slug) return
    const q = question.trim()
    setQuestion('')
    setMessages(p => [...p, { role: 'user', content: q }])
    setAsking(true)
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const { data } = await askAPI.ask(apiKey, domain.slug, q, history)
      setMessages(p => [...p, { role: 'assistant', content: data.answer }])
    } catch (err) {
      const msg = err.response?.data?.detail || 'Error getting response'
      setMessages(p => [...p, { role: 'assistant', content: `⚠ ${msg}` }])
    } finally { setAsking(false) }
  }

  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  return (
    <div className="page">
      <div className="flex-center mb-6" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">
            {isNew(id) ? 'New Domain' : form.display_name || 'Edit Domain'}
          </h1>
          <div className="text-muted">
            {isNew(id) ? 'Configure your bot identity and knowledge base' : `slug: ${form.slug}`}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Bot Identity */}
          <div className="card">
            <div className="card-title">Bot Identity</div>
            <form onSubmit={save}>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input className="form-input" placeholder="GreenRoots Plant Store" value={form.display_name} onChange={f('display_name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Slug <span className="text-muted">(used in API calls)</span></label>
                <input className="form-input" placeholder="greenroots" value={form.slug} onChange={f('slug')}
                  pattern="[a-z0-9\-]+" title="Lowercase letters, numbers, hyphens only"
                  disabled={!isNew(id)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Persona</label>
                <input className="form-input" placeholder="a friendly plant expert for GreenRoots" value={form.persona} onChange={f('persona')} />
              </div>
              <div className="form-group">
                <label className="form-label">Tone</label>
                <input className="form-input" placeholder="warm, helpful, concise" value={form.tone} onChange={f('tone')} />
              </div>
              <div className="form-group">
                <label className="form-label">Language</label>
                <input className="form-input" placeholder="English" value={form.language} onChange={f('language')} />
              </div>
              <div className="form-group">
                <label className="form-label">Fallback Message</label>
                <input className="form-input" placeholder="I'm not sure, please contact support." value={form.fallback_msg} onChange={f('fallback_msg')} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
                {saving ? <span className="spinner" /> : <><Save size={14} /> {isNew(id) ? 'Create Domain' : 'Save Changes'}</>}
              </button>
            </form>
          </div>

          {/* Knowledge Base */}
          {!isNew(id) && (
            <div className="card">
              <div className="card-title"><FileText size={14} /> Knowledge Base</div>
              {domain?.chunk_count > 0 && (
                <div className="flex-center gap-2" style={{
                  padding: '10px 14px', background: 'var(--green-light)',
                  borderRadius: 8, border: '1px solid var(--border2)', marginBottom: 14
                }}>
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>●</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--ink)', fontWeight: 500 }}>{domain.chunk_count} chunks indexed</span>
                  <span className="text-muted" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
                    Updated {new Date(domain.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]) }}
                style={{
                  border: `2px dashed ${file ? 'var(--green)' : 'var(--border2)'}`,
                  borderRadius: 10, padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
                  background: file ? 'var(--green-light)' : 'var(--bg3)',
                  transition: 'all .2s',
                }}
              >
                <Upload size={22} style={{ color: 'var(--ink3)', marginBottom: 8 }} />
                <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--ink)' }}>
                  {file ? file.name : 'Drop your .md file here'}
                </div>
                <div className="text-muted" style={{ fontSize: '0.78rem', marginTop: 4 }}>
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click to browse'}
                </div>
              </div>
              <input ref={fileRef} type="file" accept=".md" style={{ display: 'none' }}
                onChange={e => setFile(e.target.files[0])} />
              {file && (
                <button className="btn btn-primary" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                  onClick={uploadFile} disabled={uploading}>
                  {uploading ? <span className="spinner" /> : <><Upload size={14} /> Upload & Index</>}
                </button>
              )}
            </div>
          )}

          {/* Allowed Origins */}
          {!isNew(id) && (
            <div className="card">
              <div className="card-title"><Shield size={14} /> Allowed Origins</div>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 12 }}>
                Restrict which websites can use this bot. Leave empty to allow all origins.
              </p>
              {allowedOrigins.length === 0 && (
                <div style={{
                  padding: '10px 14px', marginBottom: 12, borderRadius: 8,
                  background: 'rgba(160,128,48,.1)', border: '1px solid rgba(160,128,48,.25)',
                  fontSize: '0.8rem', color: 'var(--gold)',
                }}>
                  ⚠ No restrictions — any website can call this bot
                </div>
              )}
              {allowedOrigins.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {allowedOrigins.map(origin => (
                    <div key={origin} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 12px', background: 'var(--bg3)',
                      border: '1px solid var(--border2)', borderRadius: 7,
                      fontFamily: 'DM Mono, monospace', fontSize: '0.8rem',
                    }}>
                      <span style={{ color: 'var(--green)' }}>{origin}</span>
                      <button onClick={() => removeOrigin(origin)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)', padding: 2 }}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" placeholder="https://myshop.com"
                  value={newOrigin} onChange={e => setNewOrigin(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOrigin())}
                  style={{ flex: 1 }} />
                <button className="btn btn-ghost" onClick={addOrigin} disabled={!newOrigin.trim()}>
                  <Plus size={14} />
                </button>
              </div>
              <button className="btn btn-primary" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                onClick={saveOrigins} disabled={savingOrigins}>
                {savingOrigins ? <span className="spinner" /> : <><Shield size={14} /> Save Origins</>}
              </button>
            </div>
          )}

          {/* Embed Widget */}
          {!isNew(id) && domain?.chunk_count > 0 && (
            <EmbedPanel domain={domain} apiKey={apiKey} />
          )}
        </div>

        {/* ── RIGHT COLUMN — Bot Tester ── */}
        {!isNew(id) && (
          <div className="card" style={{ position: 'sticky', top: 72, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 96px)' }}>
            <div className="card-title"><Bot size={14} /> Live Bot Tester</div>
            {domain?.chunk_count > 0 ? (
              <>
                <div ref={chatRef} style={{
                  flex: 1, overflowY: 'auto', padding: 14,
                  background: 'var(--bg3)', borderRadius: 8,
                  border: '1px solid var(--border)',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  marginBottom: 12, minHeight: 200,
                }}>
                  {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--ink3)', fontSize: '0.85rem', margin: 'auto' }}>
                      Ask a question to test your bot
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '80%', padding: '9px 13px',
                        borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        background: m.role === 'user' ? 'var(--green)' : 'var(--bg2)',
                        color: m.role === 'user' ? '#fff' : 'var(--ink)',
                        border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                        fontSize: '0.88rem', lineHeight: 1.5,
                      }}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {asking && (
                    <div style={{ display: 'flex' }}>
                      <div style={{ padding: '10px 13px', background: 'var(--bg2)', borderRadius: '12px 12px 12px 2px', border: '1px solid var(--border)' }}>
                        <span className="spinner" />
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={askQuestion} style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" placeholder="Ask something…"
                    value={question} onChange={e => setQuestion(e.target.value)} disabled={asking} />
                  <button className="btn btn-primary" type="submit" disabled={asking || !question.trim()}>
                    <Send size={15} />
                  </button>
                </form>
              </>
            ) : (
              <div className="empty-state">
                <FileText size={32} />
                <p>Upload a .md file first to enable the bot tester</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
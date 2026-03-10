import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { domainsAPI, askAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Upload, Send, Bot, FileText, Save, Shield, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

const isNew = (id) => id === 'new'

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

  // Allowed origins state
  const [allowedOrigins,  setAllowedOrigins]  = useState([])
  const [newOrigin,       setNewOrigin]       = useState('')
  const [savingOrigins,   setSavingOrigins]   = useState(false)

  // Bot tester state
  const [messages,  setMessages]  = useState([])
  const [question,  setQuestion]  = useState('')
  const [asking,    setAsking]    = useState(false)
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
    } finally {
      setSaving(false)
    }
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
    } finally {
      setUploading(false)
    }
  }

  const addOrigin = () => {
    let origin = newOrigin.trim().toLowerCase()
    if (!origin) return
    // Auto-add https:// if missing
    if (!origin.startsWith('http')) origin = 'https://' + origin
    // Strip trailing slash
    origin = origin.replace(/\/$/, '')
    if (allowedOrigins.includes(origin)) {
      toast.error('Already added')
      return
    }
    setAllowedOrigins(p => [...p, origin])
    setNewOrigin('')
  }

  const removeOrigin = (origin) => {
    setAllowedOrigins(p => p.filter(o => o !== origin))
  }

  const saveOrigins = async () => {
    setSavingOrigins(true)
    try {
      await domainsAPI.update(id, { allowed_origins: allowedOrigins })
      toast.success(allowedOrigins.length === 0
        ? 'Restrictions removed — all origins allowed'
        : `${allowedOrigins.length} allowed origin(s) saved`
      )
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed')
    } finally {
      setSavingOrigins(false)
    }
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
    } finally {
      setAsking(false)
    }
  }

  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  return (
    <div className="page">
      <div className="flex-center mb-6" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 800 }}>
            {isNew(id) ? 'New Domain' : form.display_name || 'Edit Domain'}
          </h1>
          <div className="text-muted">
            {isNew(id) ? 'Configure your bot identity and knowledge base' : `slug: ${form.slug}`}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left — config form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

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
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <input className="form-input" placeholder="English" value={form.language} onChange={f('language')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Fallback Message</label>
                <input className="form-input" placeholder="Please email support@yourco.com" value={form.fallback_msg} onChange={f('fallback_msg')} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? <span className="spinner" /> : <><Save size={14} /> {isNew(id) ? 'Create Domain' : 'Save Changes'}</>}
              </button>
            </form>
          </div>

          {/* Upload */}
          {!isNew(id) && (
            <div className="card">
              <div className="card-title">
                <FileText size={13} style={{ display: 'inline', marginRight: 6 }} />Knowledge Base
              </div>
              {domain?.chunk_count > 0 && (
                <div className="flex-center gap-2 mb-4" style={{ padding: '8px 12px', background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <span className="text-green">●</span>
                  <span style={{ fontSize: '0.8rem' }}>{domain.chunk_count} chunks indexed</span>
                  <span className="text-muted" style={{ marginLeft: 'auto' }}>Updated {new Date(domain.updated_at).toLocaleDateString()}</span>
                </div>
              )}
              <div
                className={`upload-zone ${file ? 'drag-over' : ''}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]) }}
              >
                <div className="upload-icon"><Upload size={28} /></div>
                <div className="upload-title">{file ? file.name : 'Drop your .md file here'}</div>
                <div className="upload-sub">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click to browse'}</div>
              </div>
              <input ref={fileRef} type="file" accept=".md" style={{ display: 'none' }}
                onChange={e => setFile(e.target.files[0])} />
              {file && (
                <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={uploadFile} disabled={uploading}>
                  {uploading ? <span className="spinner" /> : <><Upload size={14} /> Upload & Index</>}
                </button>
              )}
            </div>
          )}

          {/* Allowed Origins */}
          {!isNew(id) && (
            <div className="card">
              <div className="card-title">
                <Shield size={13} style={{ display: 'inline', marginRight: 6 }} />Allowed Origins
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: 12 }}>
                Restrict which websites can use this bot. Leave empty to allow all origins.
              </div>

              {/* Origin list */}
              {allowedOrigins.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {allowedOrigins.map(origin => (
                    <div key={origin} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 10px', background: 'var(--bg-2)',
                      border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                      fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                    }}>
                      <span style={{ color: 'var(--green)' }}>{origin}</span>
                      <button
                        onClick={() => removeOrigin(origin)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2 }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {allowedOrigins.length === 0 && (
                <div style={{
                  padding: '8px 12px', marginBottom: 12,
                  background: 'var(--bg-2)', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)', fontSize: '0.75rem',
                  color: 'var(--amber)',
                }}>
                  ⚠ No restrictions — any website can call this bot with your API key
                </div>
              )}

              {/* Add origin input */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  placeholder="https://myshop.com"
                  value={newOrigin}
                  onChange={e => setNewOrigin(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOrigin())}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-ghost btn-sm" onClick={addOrigin} disabled={!newOrigin.trim()}>
                  <Plus size={14} /> Add
                </button>
              </div>

              <button
                className="btn btn-primary"
                style={{ marginTop: 12 }}
                onClick={saveOrigins}
                disabled={savingOrigins}
              >
                {savingOrigins ? <span className="spinner" /> : <><Shield size={14} /> Save Origins</>}
              </button>
            </div>
          )}
        </div>

        {/* Right — bot tester */}
        {!isNew(id) && (
          <div className="card" style={{ position: 'sticky', top: 76 }}>
            <div className="card-title">
              <Bot size={13} style={{ display: 'inline', marginRight: 6 }} />Live Bot Tester
            </div>
            {domain?.chunk_count > 0 ? (
              <>
                <div className="chat-window" ref={chatRef}>
                  {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.78rem', margin: 'auto' }}>
                      Ask a question to test your bot
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`chat-msg ${m.role === 'user' ? 'user' : 'bot'}`}>
                      <div className="chat-bubble">{m.content}</div>
                    </div>
                  ))}
                  {asking && (
                    <div className="chat-msg bot">
                      <div className="chat-bubble"><span className="spinner" /></div>
                    </div>
                  )}
                </div>
                <form onSubmit={askQuestion} className="chat-input-row">
                  <input
                    className="form-input"
                    placeholder="Ask something..."
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    disabled={asking}
                  />
                  <button className="btn btn-primary" type="submit" disabled={asking || !question.trim()}>
                    <Send size={13} />
                  </button>
                </form>
              </>
            ) : (
              <div className="empty-state">
                <FileText />
                <p>Upload a .md file first to enable the bot tester</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
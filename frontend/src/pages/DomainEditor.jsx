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
    if (!origin.startsWith('http')) origin = 'https://' + origin
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
      {/* Header */}
      <div className="flex-center mb-6" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', color: '#111' }}>
            {isNew(id) ? 'New Domain' : form.display_name || 'Edit Domain'}
          </h1>
          <div className="text-muted">
            {isNew(id) ? 'Configure your bot identity and knowledge base' : `ID: ${form.slug}`}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '24px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

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
                <input className="form-input" placeholder="Please email support@yourco.com" value={form.fallback_msg} onChange={f('fallback_msg')} />
              </div>
              <button className="btn-primary" type="submit" disabled={saving} style={{ marginTop: '8px' }}>
                {saving ? <span className="spinner" /> : <><Save size={14} style={{marginRight: 6}} /> {isNew(id) ? 'Create Domain' : 'Save Changes'}</>}
              </button>
            </form>
          </div>

          {/* Upload */}
          {!isNew(id) && (
            <div className="card">
              <div className="card-title">
                <FileText size={14} style={{ marginRight: 8 }} /> Knowledge Base
              </div>
              {domain?.chunk_count > 0 && (
                <div className="flex-center gap-2 mb-4" style={{ padding: '10px 14px', background: '#F0F7F4', borderRadius: '8px', border: '1px solid #D8E8E0' }}>
                  <span style={{ color: '#2D6A4F', fontWeight: 600 }}>●</span>
                  <span style={{ fontSize: '0.85rem', color: '#111' }}>{domain.chunk_count} chunks indexed</span>
                  <span className="text-muted" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>Updated {new Date(domain.updated_at).toLocaleDateString()}</span>
                </div>
              )}
              <div
                className="upload-zone"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]) }}
                style={{
                  border: `2px dashed ${file ? '#2D6A4F' : '#D0D0C8'}`,
                  borderRadius: '12px', padding: '32px',
                  textAlign: 'center', cursor: 'pointer',
                  background: file ? 'rgba(45, 106, 79, 0.03)' : 'transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ color: '#777', marginBottom: 8 }}><Upload size={24} /></div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#111' }}>{file ? file.name : 'Drop your .md file here'}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>{file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click to browse'}</div>
              </div>
              <input ref={fileRef} type="file" accept=".md" style={{ display: 'none' }}
                onChange={e => setFile(e.target.files[0])} />
              {file && (
                <button className="btn-primary" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }} onClick={uploadFile} disabled={uploading}>
                  {uploading ? <span className="spinner" /> : <><Upload size={14} style={{marginRight: 6}} /> Upload & Index</>}
                </button>
              )}
            </div>
          )}

          {/* Allowed Origins */}
          {!isNew(id) && (
            <div className="card">
              <div className="card-title">
                <Shield size={14} style={{ marginRight: 8 }} /> Allowed Origins
              </div>
              <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 12 }}>
                Restrict which websites can use this bot. Leave empty to allow all origins.
              </div>

              {allowedOrigins.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {allowedOrigins.map(origin => (
                    <div key={origin} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 12px', background: '#FDFDF9',
                      border: '1px solid #E8E8E4', borderRadius: '8px',
                      fontFamily: "'DM Mono', monospace", fontSize: '0.8rem',
                    }}>
                      <span style={{ color: '#2D6A4F' }}>{origin}</span>
                      <button
                        onClick={() => removeOrigin(origin)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a7a76', padding: 2 }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {allowedOrigins.length === 0 && (
                <div style={{
                  padding: '10px 14px', marginBottom: 12,
                  background: '#FFF8E1', borderRadius: '8px',
                  border: '1px solid #FFE082', fontSize: '0.8rem',
                  color: '#B57A1A',
                }}>
                  ⚠ No restrictions — any website can call this bot with your API key
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  placeholder="https://myshop.com"
                  value={newOrigin}
                  onChange={e => setNewOrigin(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOrigin())}
                  style={{ flex: 1 }}
                />
                <button className="btn-ghost" onClick={addOrigin} disabled={!newOrigin.trim()}>
                  <Plus size={14} />
                </button>
              </div>

              <button
                className="btn-primary"
                style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                onClick={saveOrigins}
                disabled={savingOrigins}
              >
                {savingOrigins ? <span className="spinner" /> : <><Shield size={14} style={{marginRight: 6}} /> Save Origins</>}
              </button>
            </div>
          )}
        </div>

        {/* Right Column — Bot Tester */}
        {!isNew(id) && (
          <div className="card" style={{ position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 110px)' }}>
            <div className="card-title">
              <Bot size={14} style={{ marginRight: 8 }} /> Live Bot Tester
            </div>
            {domain?.chunk_count > 0 ? (
              <>
                <div 
                  ref={chatRef}
                  style={{
                    flex: 1, overflowY: 'auto', padding: '16px',
                    background: '#FAFAF8', borderRadius: '8px',
                    border: '1px solid #E8E8E4',
                    display: 'flex', flexDirection: 'column', gap: '12px',
                    marginBottom: '12px'
                  }}
                >
                  {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#7a7a76', fontSize: '0.85rem', margin: 'auto' }}>
                      Ask a question to test your bot
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                    }}>
                      <div style={{
                        maxWidth: '80%', padding: '10px 14px',
                        borderRadius: m.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                        background: m.role === 'user' ? '#111' : '#fff',
                        color: m.role === 'user' ? '#fff' : '#111',
                        border: m.role === 'user' ? 'none' : '1px solid #E8E8E4',
                        fontSize: '0.9rem', lineHeight: 1.5,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {asking && (
                     <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{
                           padding: '12px', background: '#fff', borderRadius: '12px',
                           border: '1px solid #E8E8E4'
                        }}>
                          <span className="spinner" />
                        </div>
                     </div>
                  )}
                </div>
                <form onSubmit={askQuestion} style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="form-input"
                    placeholder="Ask something..."
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    disabled={asking}
                  />
                  <button className="btn-primary" type="submit" disabled={asking || !question.trim()}>
                    <Send size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div className="text-muted" style={{ textAlign: 'center', padding: '40px 0' }}>
                <FileText style={{ margin: '0 auto 12px', opacity: 0.3 }} size={32} />
                <p style={{ fontSize: '0.85rem' }}>Upload a .md file first to enable the bot tester</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
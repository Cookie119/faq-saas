import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { domainsAPI, askAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Upload, Send, Bot, FileText, Save, Shield, Plus, X, Code, Copy, Check, Pencil, Eye, ArrowLeft } from 'lucide-react'
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
    language: 'English', fallback_msg: '', enable_suggestions: false,
  })
  const [domain,    setDomain]    = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files,     setFiles]     = useState([])      // selected files to upload
  const [domFiles,  setDomFiles]  = useState([])      // files already on server
  const [deletingFile, setDeletingFile] = useState('')

  // MD editor state
  const [editingFile,   setEditingFile]   = useState(null)   // { id, filename, raw_content }
  const [editorContent, setEditorContent] = useState('')
  const [editorTab,     setEditorTab]     = useState('edit') // 'edit' | 'preview'
  const [savingContent, setSavingContent] = useState(false)
  const [loadingFile,   setLoadingFile]   = useState('')

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
          enable_suggestions: d.enable_suggestions || false,
        })
        setAllowedOrigins(d.allowed_origins || [])
        setDomFiles(d.files || [])
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

  const uploadFiles = async () => {
    if (!files.length || isNew(id)) return
    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))
      const token = localStorage.getItem('token')
      const res   = await fetch(`${BASE}/domains/${id}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Upload failed')

      if (data.uploaded?.length) toast.success(`${data.uploaded.length} file(s) uploaded — ${data.chunk_count} chunks indexed`)
      if (data.errors?.length)   data.errors.forEach(e => toast.error(e))

      setDomFiles(data.files || [])
      setDomain(d => ({ ...d, chunk_count: data.chunk_count }))
      setFiles([])
      fileRef.current.value = ''
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally { setUploading(false) }
  }

  const deleteFile = async (fileId, filename) => {
    if (!confirm(`Remove "${filename}" from this domain?`)) return
    setDeletingFile(fileId)
    try {
      const token = localStorage.getItem('token')
      const res   = await fetch(`${BASE}/domains/${id}/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Delete failed')
      setDomFiles(p => p.filter(f => f.id !== fileId))
      setDomain(d => ({ ...d, chunk_count: data.chunk_count }))
      toast.success(`"${filename}" removed`)
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    } finally { setDeletingFile('') }
  }

  const openEditor = async (file) => {
    setLoadingFile(file.id)
    try {
      const token = localStorage.getItem('token')
      const res   = await fetch(`${BASE}/domains/${id}/files/${file.id}/content`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to load file')
      setEditingFile(data)
      setEditorContent(data.raw_content)
      setEditorTab('edit')
    } catch (err) {
      toast.error(err.message || 'Could not open file')
    } finally { setLoadingFile('') }
  }

  const saveContent = async () => {
    if (!editingFile) return
    setSavingContent(true)
    try {
      const token = localStorage.getItem('token')
      const res   = await fetch(`${BASE}/domains/${id}/files/${editingFile.id}/content`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ raw_content: editorContent }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Save failed')
      toast.success(`Saved & re-indexed — ${data.chunk_count} total chunks`)
      setDomain(d => ({ ...d, chunk_count: data.chunk_count }))
      setDomFiles(p => p.map(f => f.id === editingFile.id
        ? { ...f, chunk_count: data.file_chunks }
        : f
      ))
      setEditingFile(null)
    } catch (err) {
      toast.error(err.message || 'Save failed')
    } finally { setSavingContent(false) }
  }

  // Simple markdown → HTML for preview (no dependencies)
  const renderMarkdown = (md) => {
    return md
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hul])/gm, '')
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
      setMessages(p => [...p, {
        role: 'assistant',
        content: data.answer,
        suggestions: data.suggestions || [],
      }])
    } catch (err) {
      const msg = err.response?.data?.detail || 'Error getting response'
      setMessages(p => [...p, { role: 'assistant', content: `⚠ ${msg}`, suggestions: [] }])
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

              {/* Suggestions toggle */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', background: 'var(--bg3)',
                  border: '1px solid var(--border2)', borderRadius: 8,
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>
                      Follow-up suggestions
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink3)' }}>
                      Show 2 clickable follow-up questions after each answer
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, enable_suggestions: !p.enable_suggestions }))}
                    style={{
                      width: 44, height: 24, borderRadius: 12, border: 'none',
                      background: form.enable_suggestions ? 'var(--green)' : 'var(--border2)',
                      cursor: 'pointer', position: 'relative', transition: 'background .2s',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: 3,
                      left: form.enable_suggestions ? 23 : 3,
                      transition: 'left .2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                    }} />
                  </button>
                </div>
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

              {/* ── MD Editor (shown when editing a file) ── */}
              {editingFile && (
                <div style={{ marginBottom: 16 }}>
                  {/* Editor header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => setEditingFile(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)', display: 'flex', padding: 2 }}
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>
                        {editingFile.filename}
                      </span>
                    </div>
                    {/* Edit / Preview tabs */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['edit', 'preview'].map(tab => (
                        <button key={tab} onClick={() => setEditorTab(tab)} style={{
                          padding: '4px 12px', borderRadius: 6, border: '1px solid',
                          fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                          fontFamily: 'inherit', textTransform: 'capitalize',
                          background: editorTab === tab ? 'var(--green)' : 'transparent',
                          color:      editorTab === tab ? '#fff' : 'var(--ink3)',
                          borderColor: editorTab === tab ? 'var(--green)' : 'var(--border2)',
                        }}>
                          {tab === 'edit' ? <><Pencil size={10} style={{ marginRight: 4 }} />Edit</> : <><Eye size={10} style={{ marginRight: 4 }} />Preview</>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Editor or Preview */}
                  {editorTab === 'edit' ? (
                    <textarea
                      value={editorContent}
                      onChange={e => setEditorContent(e.target.value)}
                      spellCheck={false}
                      style={{
                        width: '100%', minHeight: 320,
                        background: 'var(--bg3)', border: '1px solid var(--border2)',
                        borderRadius: 8, padding: '12px 14px',
                        fontFamily: 'DM Mono, monospace', fontSize: '0.78rem',
                        lineHeight: 1.75, color: 'var(--ink)',
                        resize: 'vertical', outline: 'none',
                        transition: 'border-color .15s',
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--green)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border2)'}
                    />
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(editorContent) }}
                      style={{
                        minHeight: 320, padding: '14px 16px',
                        background: 'var(--bg2)', border: '1px solid var(--border)',
                        borderRadius: 8, fontSize: '0.85rem', lineHeight: 1.7,
                        color: 'var(--ink)', overflowY: 'auto',
                      }}
                    />
                  )}

                  {/* Save / Cancel */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                      onClick={saveContent} disabled={savingContent}>
                      {savingContent ? <span className="spinner" /> : <><Save size={13} /> Save & Re-index</>}
                    </button>
                    <button className="btn btn-ghost" onClick={() => setEditingFile(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Existing files list — hidden when editing */}
              {!editingFile && (
                <>
                  {domFiles.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      {domFiles.map(f => (
                        <div key={f.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '9px 12px', background: 'var(--bg3)',
                          border: '1px solid var(--border2)', borderRadius: 8,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <span style={{
                              fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                              background: 'var(--green-light)', color: 'var(--green)',
                              padding: '2px 6px', borderRadius: 4, fontFamily: 'DM Mono, monospace',
                            }}>{f.file_type}</span>
                            <span style={{ fontSize: '0.83rem', color: 'var(--ink)', fontWeight: 500 }}>{f.filename}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--ink3)' }}>{f.chunk_count} chunks</span>
                          </div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              onClick={() => openEditor(f)}
                              disabled={!!loadingFile}
                              title="Edit content"
                              style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: 5, cursor: 'pointer', color: 'var(--ink3)', padding: '3px 7px', display: 'flex', transition: 'all .15s' }}
                              onMouseEnter={e => { e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.borderColor = 'var(--green)' }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink3)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
                            >
                              {loadingFile === f.id ? <span className="spinner" style={{ width: 11, height: 11 }} /> : <Pencil size={12} />}
                            </button>
                            <button
                              onClick={() => deleteFile(f.id, f.filename)}
                              disabled={deletingFile === f.id}
                              title="Remove file"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)', padding: '3px 4px', display: 'flex' }}
                            >
                              {deletingFile === f.id ? <span className="spinner" style={{ width: 11, height: 11 }} /> : <X size={13} />}
                            </button>
                          </div>
                        </div>
                      ))}
                      <div style={{ fontSize: '0.72rem', color: 'var(--ink3)', paddingLeft: 2 }}>
                        {domain?.chunk_count || 0} total chunks indexed
                      </div>
                    </div>
                  )}

                  {/* Upload zone */}
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); setFiles(Array.from(e.dataTransfer.files)) }}
                    style={{
                      border: `2px dashed ${files.length ? 'var(--green)' : 'var(--border2)'}`,
                      borderRadius: 10, padding: '24px 20px', textAlign: 'center', cursor: 'pointer',
                      background: files.length ? 'var(--green-light)' : 'var(--bg3)',
                      transition: 'all .2s',
                    }}
                  >
                    <Upload size={20} style={{ color: 'var(--ink3)', marginBottom: 8 }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--ink)' }}>
                      {files.length
                        ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
                        : 'Drop files here or click to browse'}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>
                      {files.length
                        ? files.map(f => f.name).join(', ')
                        : '.md  .txt  .pdf  .docx  .csv — multiple files supported'}
                    </div>
                  </div>
                  <input
                    ref={fileRef} type="file" style={{ display: 'none' }}
                    accept=".md,.txt,.pdf,.docx,.csv"
                    multiple
                    onChange={e => setFiles(Array.from(e.target.files))}
                  />
                  {files.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                        onClick={uploadFiles} disabled={uploading}>
                        {uploading ? <span className="spinner" /> : <><Upload size={13} /> Upload & Index</>}
                      </button>
                      <button className="btn btn-ghost" onClick={() => { setFiles([]); fileRef.current.value = '' }}>
                        <X size={13} />
                      </button>
                    </div>
                  )}
                </>
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
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
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
                      {/* Suggestion chips */}
                      {m.role === 'assistant' && m.suggestions?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6, maxWidth: '90%' }}>
                          {m.suggestions.map((s, si) => (
                            <button
                              key={si}
                              onClick={() => {
                                setQuestion(s)
                                // auto-submit
                                setMessages(p => [...p, { role: 'user', content: s }])
                                setAsking(true)
                                const history = messages.map(m => ({ role: m.role, content: m.content }))
                                askAPI.ask(apiKey, domain.slug, s, history)
                                  .then(({ data }) => setMessages(p => [...p, {
                                    role: 'assistant', content: data.answer, suggestions: data.suggestions || []
                                  }]))
                                  .catch(() => setMessages(p => [...p, { role: 'assistant', content: '⚠ Error', suggestions: [] }]))
                                  .finally(() => setAsking(false))
                              }}
                              disabled={asking}
                              style={{
                                padding: '5px 11px', borderRadius: 20,
                                border: '1px solid var(--border2)',
                                background: 'var(--bg2)', color: 'var(--green)',
                                fontSize: '0.75rem', fontWeight: 500,
                                cursor: asking ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit', transition: 'all .15s',
                                opacity: asking ? 0.5 : 1,
                              }}
                              onMouseEnter={e => e.target.style.background = 'var(--green-light)'}
                              onMouseLeave={e => e.target.style.background = 'var(--bg2)'}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
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
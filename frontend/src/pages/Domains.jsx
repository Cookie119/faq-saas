import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { domainsAPI } from '../api/client'
import { Plus, Upload, Settings, Trash2, ToggleLeft, ToggleRight, Bot } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Domains() {
  const [domains, setDomains]   = useState([])
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  const load = () => {
    domainsAPI.list()
      .then(r => setDomains(r.data.domains))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const toggleActive = async (domain) => {
    try {
      await domainsAPI.update(domain.id, { is_active: !domain.is_active })
      toast.success(domain.is_active ? 'Domain deactivated' : 'Domain activated')
      load()
    } catch { toast.error('Failed to update domain') }
  }

  const deleteDomain = async (domain) => {
    if (!confirm(`Delete "${domain.display_name}"? This cannot be undone.`)) return
    try {
      await domainsAPI.delete(domain.id)
      toast.success('Domain deleted')
      load()
    } catch { toast.error('Failed to delete domain') }
  }

  if (loading) return <div className="loading-page"><span className="spinner" /></div>

  return (
    <div className="page">
      <div className="flex-center mb-6" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 800 }}>Domains</h1>
          <div className="text-muted">{domains.length} domain{domains.length !== 1 ? 's' : ''} configured</div>
        </div>
        <Link to="/domains/new" className="btn btn-primary">
          <Plus size={14} /> New Domain
        </Link>
      </div>

      {domains.length === 0 ? (
        <div className="card empty-state">
          <Bot />
          <p>No domains yet. Create one and upload a .md knowledge base to get started.</p>
          <Link to="/domains/new" className="btn btn-primary" style={{ marginTop: 16 }}>
            <Plus size={14} /> Create First Domain
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Slug</th>
                  <th>Chunks</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {domains.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontFamily: 'var(--font-head)' }}>{d.display_name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{d.persona?.slice(0, 60) || 'No persona set'}</div>
                    </td>
                    <td><span className="badge badge-blue">{d.slug}</span></td>
                    <td>
                      {d.chunk_count > 0
                        ? <span className="text-green">{d.chunk_count} chunks</span>
                        : <span className="text-muted">No file</span>}
                    </td>
                    <td>
                      {d.is_active
                        ? <span className="badge badge-green">● Active</span>
                        : <span className="badge badge-red">○ Inactive</span>}
                    </td>
                    <td className="text-muted">{new Date(d.updated_at).toLocaleDateString()}</td>
                    <td>
                      <div className="flex-center gap-2">
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/domains/${d.id}`)}>
                          <Settings size={13} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(d)} title={d.is_active ? 'Deactivate' : 'Activate'}>
                          {d.is_active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteDomain(d)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
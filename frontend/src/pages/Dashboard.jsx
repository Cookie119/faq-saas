import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { analyticsAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Database, MessageSquare, Zap, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const { company } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [plan, setPlan]           = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([analyticsAPI.summary(), analyticsAPI.plan()])
      .then(([a, p]) => { setAnalytics(a.data); setPlan(p.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-page"><span className="spinner" /><span>Loading...</span></div>

  const usagePct = plan ? Math.min(100, (plan.questions_used / plan.questions_limit) * 100) : 0
  const fillClass = usagePct > 90 ? 'red' : usagePct > 70 ? 'amber' : ''

  return (
    <div className="page">
      <div className="flex-center gap-2 mb-6" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 800 }}>
            {company?.name}
          </h1>
          <div className="text-muted">Overview — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
        </div>
        <Link to="/domains/new" className="btn btn-primary">
          <Zap size={14} /> New Domain
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Questions This Month</div>
          <div className="stat-value">{analytics?.questions_this_month ?? 0}</div>
          <div className="stat-sub">of {plan?.questions_limit?.toLocaleString()} limit</div>
          <div className="progress-bar">
            <div className={`progress-fill ${fillClass}`} style={{ width: `${usagePct}%` }} />
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-label">Total Questions</div>
          <div className="stat-value">{analytics?.total_questions ?? 0}</div>
          <div className="stat-sub">all time</div>
        </div>

        <div className="stat-card amber">
          <div className="stat-label">Active Domains</div>
          <div className="stat-value">{plan?.domains_used ?? 0}</div>
          <div className="stat-sub">of {plan?.domains_limit === 999999 ? '∞' : plan?.domains_limit} allowed</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Plan</div>
          <div className="stat-value" style={{ fontSize: '1.4rem', textTransform: 'capitalize' }}>{plan?.plan ?? 'free'}</div>
          <div className="stat-sub">{plan?.max_md_size_kb}KB max file size</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Top domains */}
        <div className="card">
          <div className="card-title"><Database size={13} style={{ display: 'inline', marginRight: 6 }} />Top Domains</div>
          {analytics?.top_domains?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analytics.top_domains.map((d, i) => (
                <div key={i} className="flex-center gap-2" style={{ justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem' }}>{d.domain}</span>
                  <span className="badge badge-blue">{d.questions} q</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted">No questions yet. Upload a domain and start asking.</div>
          )}
        </div>

        {/* Recent questions */}
        <div className="card">
          <div className="card-title"><MessageSquare size={13} style={{ display: 'inline', marginRight: 6 }} />Recent Questions</div>
          {analytics?.recent_questions?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analytics.recent_questions.slice(0, 5).map((q, i) => (
                <div key={i}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text)' }}>{q.question}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>{q.domain} · {new Date(q.at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted">Questions will appear here after your first /ask call.</div>
          )}
        </div>
      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { analyticsAPI } from '../api/client'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar, CartesianGrid
} from 'recharts'
import { TrendingUp, MessageSquare, Database } from 'lucide-react'

// Custom Tooltip using standard styles
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', border: '1px solid #E8E8E4',
      borderRadius: '8px', padding: '8px 12px',
      fontFamily: "'DM Mono', monospace", fontSize: '0.75rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      <div style={{ color: '#7a7a76', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#2D6A4F', fontWeight: 600 }}>{payload[0].value} questions</div>
    </div>
  )
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [plan,      setPlan]      = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([analyticsAPI.summary(), analyticsAPI.plan()])
      .then(([a, p]) => { setAnalytics(a.data); setPlan(p.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="loading-page">
      <span className="spinner" />
      <span>Loading...</span>
    </div>
  )

  // Build daily chart data
  const dailyMap = {}
  analytics?.recent_questions?.forEach(q => {
    const day = new Date(q.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    dailyMap[day] = (dailyMap[day] || 0) + 1
  })
  const dailyData = Object.entries(dailyMap)
    .map(([date, count]) => ({ date, count }))
    .slice(-14)

  // Domain bar chart data
  const domainData = (analytics?.top_domains || []).map(d => ({
    name: d.domain.length > 14 ? d.domain.slice(0, 14) + '…' : d.domain,
    questions: d.questions
  }))

  const usagePct = plan ? Math.min(100, (plan.questions_used / plan.questions_limit) * 100) : 0
  const fillClass = usagePct > 90 ? 'red' : usagePct > 70 ? 'amber' : ''

  return (
    <div className="page">
      {/* Header */}
      <div className="mb-6">
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', color: '#111' }}>Analytics</h1>
        <div className="text-muted">Last 30 days performance</div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">This Month</div>
          <div className="stat-value">{analytics?.questions_this_month ?? 0}</div>
          <div className="stat-sub">questions asked</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">All Time</div>
          <div className="stat-value">{analytics?.total_questions ?? 0}</div>
          <div className="stat-sub">total questions</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-label">Usage</div>
          <div className="stat-value">{Math.round(usagePct)}%</div>
          <div className="stat-sub">{plan?.questions_used} / {plan?.questions_limit?.toLocaleString()}</div>
          <div className="progress-bar" style={{ marginTop: 8 }}>
            <div className={`progress-fill ${fillClass}`} style={{ width: `${usagePct}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Domains</div>
          <div className="stat-value">{plan?.domains_used ?? 0}</div>
          <div className="stat-sub">of {plan?.domains_limit === 999999 ? '∞' : plan?.domains_limit}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Daily Activity Chart */}
        <div className="card">
          <div className="card-title">
            <TrendingUp size={14} style={{ marginRight: 8 }} /> Daily Activity
          </div>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={dailyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2D6A4F" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7a7a76', fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#7a7a76', fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#2D6A4F" strokeWidth={2} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-muted" style={{ textAlign: 'center', padding: '40px 0' }}>
              <TrendingUp style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} size={24} />
              <p style={{ fontSize: '0.85rem' }}>No activity yet this month</p>
            </div>
          )}
        </div>

        {/* Questions per Domain Chart */}
        <div className="card">
          <div className="card-title">
            <Database size={14} style={{ marginRight: 8 }} /> Questions per Domain
          </div>
          {domainData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={domainData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#7a7a76', fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#7a7a76', fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="questions" fill="#2D6A4F" radius={[3, 3, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-muted" style={{ textAlign: 'center', padding: '40px 0' }}>
              <Database style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} size={24} />
              <p style={{ fontSize: '0.85rem' }}>No domain activity yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Questions Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E8E8E4' }}>
          <div className="card-title" style={{ marginBottom: 0 }}>
            <MessageSquare size={14} style={{ marginRight: 8 }} /> Recent Questions
          </div>
        </div>
        {analytics?.recent_questions?.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Domain</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recent_questions.map((q, i) => (
                  <tr key={i}>
                    <td style={{ maxWidth: 400 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#111' }}>
                        {q.question}
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{q.domain}</span></td>
                    <td className="text-muted">{new Date(q.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-muted" style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: '0.85rem' }}>Questions will appear here after your first /ask call</p>
          </div>
        )}
      </div>
    </div>
  )
}
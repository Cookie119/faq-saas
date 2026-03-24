import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { CreditCard, Zap, CheckCircle, AlertCircle, ExternalLink, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const PLANS = [
  {
    key:   'free',
    name:  'Free',
    price: '$0',
    per:   'forever',
    color: 'var(--ink3)',
    feats: ['1 domain', '500 questions / month', '500 KB knowledge base', 'API key access', 'Community support'],
  },
  {
    key:   'pro',
    name:  'Pro',
    price: '$29',
    per:   'per month',
    color: 'var(--green)',
    hot:   true,
    feats: ['10 domains', '10,000 questions / month', '5 MB knowledge base', 'Origin restrictions', 'Priority support'],
  },
  {
    key:   'enterprise',
    name:  'Enterprise',
    price: '$99',
    per:   'per month',
    color: 'var(--gold)',
    feats: ['Unlimited domains', 'Unlimited questions', '20 MB knowledge base', 'SLA guarantee', 'Dedicated support'],
  },
]

function planRank(p) { return { free: 0, pro: 1, enterprise: 2 }[p] ?? 0 }

export default function Billing() {
  
  const [status,   setStatus]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [upgrading, setUpgrading] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get(`${BASE}/billing/status`, { headers: authHeaders })
      .then(r => setStatus(r.data))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false))
  }, [])

  const handlePlanClick = async (plan) => {
    const current = status?.plan || company?.plan || 'free'
    if (plan.key === current) return

    setUpgrading(plan.key)
    try {
      const { data } = await axios.post(
        `${BASE}/billing/create-checkout-session`,
        {
          plan:        plan.key,
          success_url: window.location.origin + '/billing?success=true',
          cancel_url:  window.location.origin + '/billing',
        },
        { headers: authHeaders }
      )
      // Redirect to Stripe checkout or portal
      window.location.href = data.url
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not start checkout')
    } finally {
      setUpgrading('')
    }
  }

  const openPortal = async () => {
    setUpgrading('portal')
    try {
      const { data } = await axios.post(
        `${BASE}/billing/portal`,
        { return_url: window.location.origin + '/billing' },
        { headers: authHeaders }
      )
      window.location.href = data.url
    } catch (err) {
      toast.error('Could not open billing portal')
    } finally {
      setUpgrading('')
    }
  }

  // Show success banner if redirected back from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      toast.success('Subscription activated! Your plan has been upgraded.')
      window.history.replaceState({}, '', '/billing')
    }
  }, [])

  const currentPlan = status?.plan || company?.plan || 'free'
  const periodEnd   = status?.current_period_end
    ? new Date(status.current_period_end * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null
  const cancelAtEnd = status?.cancel_at_period_end

  return (
    <div className="page">
      <div className="flex-center mb-6" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Billing</h1>
          <div className="text-muted">Manage your subscription and plan</div>
        </div>
        {status?.stripe_subscription_id && (
          <button
            className="btn btn-ghost"
            onClick={openPortal}
            disabled={upgrading === 'portal'}
            style={{ display: 'flex', alignItems: 'center', gap: 7 }}
          >
            {upgrading === 'portal' ? <span className="spinner" /> : <ExternalLink size={14} />}
            Manage subscription
          </button>
        )}
      </div>

      {/* Current plan status card */}
      {!loading && (
        <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'var(--green-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={20} style={{ color: 'var(--green)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)', textTransform: 'capitalize' }}>
                {currentPlan} Plan
              </div>
              {cancelAtEnd && periodEnd && (
                <div style={{ fontSize: '0.78rem', color: 'var(--gold)', marginTop: 2 }}>
                  ⚠ Cancels {periodEnd} — access continues until then
                </div>
              )}
              {!cancelAtEnd && periodEnd && (
                <div style={{ fontSize: '0.78rem', color: 'var(--ink3)', marginTop: 2 }}>
                  Renews {periodEnd}
                </div>
              )}
              {!periodEnd && (
                <div style={{ fontSize: '0.78rem', color: 'var(--ink3)', marginTop: 2 }}>No active subscription</div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`badge badge-${currentPlan === 'free' ? 'amber' : 'green'}`} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
              {status?.subscription_status || (currentPlan === 'free' ? 'free' : 'active')}
            </span>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        {PLANS.map(plan => {
          const isCurrent  = plan.key === currentPlan
          const isUpgrade  = planRank(plan.key) > planRank(currentPlan)
          const isDowngrade = planRank(plan.key) < planRank(currentPlan)
          const busy       = upgrading === plan.key

          return (
            <div key={plan.key} style={{
              background: isCurrent ? 'var(--bg2)' : 'var(--bg2)',
              border: `1px solid ${isCurrent ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: 12,
              padding: '28px 24px',
              display: 'flex', flexDirection: 'column',
              position: 'relative',
              transition: 'transform .2s, box-shadow .2s',
              boxShadow: isCurrent ? '0 0 0 1px var(--green)' : 'none',
            }}>

              {isCurrent && (
                <div style={{
                  position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--green)', color: '#fff',
                  fontSize: '0.68rem', fontWeight: 700, letterSpacing: '.05em',
                  padding: '3px 12px', borderRadius: 100, whiteSpace: 'nowrap',
                }}>
                  CURRENT PLAN
                </div>
              )}

              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: plan.color, marginBottom: 14 }}>
                {plan.name}
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.6rem', lineHeight: 1, color: 'var(--ink)', marginBottom: 2, letterSpacing: '-.02em' }}>
                {plan.price}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink3)', marginBottom: 20 }}>{plan.per}</div>

              <div style={{ height: 1, background: 'var(--border)', marginBottom: 18 }} />

              <ul style={{ listStyle: 'none', flex: 1, marginBottom: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.feats.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: 'var(--ink2)' }}>
                    <CheckCircle size={13} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button disabled style={{
                  width: '100%', padding: '10px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--ink3)', fontSize: '0.82rem', fontWeight: 600,
                  cursor: 'default', fontFamily: 'inherit',
                }}>
                  Current plan
                </button>
              ) : plan.key === 'free' ? (
                <button
                  onClick={openPortal}
                  disabled={!!upgrading}
                  style={{
                    width: '100%', padding: '10px', borderRadius: 8,
                    border: '1px solid var(--border2)', background: 'transparent',
                    color: 'var(--ink2)', fontSize: '0.82rem', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Downgrade to Free
                </button>
              ) : (
                <button
                  onClick={() => handlePlanClick(plan)}
                  disabled={!!upgrading}
                  style={{
                    width: '100%', padding: '10px', borderRadius: 8,
                    border: 'none',
                    background: isUpgrade ? 'var(--green)' : 'var(--bg3)',
                    color: isUpgrade ? '#fff' : 'var(--ink2)',
                    fontSize: '0.82rem', fontWeight: 700,
                    cursor: upgrading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    transition: 'background .15s',
                    opacity: upgrading && !busy ? 0.5 : 1,
                  }}
                >
                  {busy
                    ? <span className="spinner" style={{ borderTopColor: isUpgrade ? '#fff' : 'var(--green)' }} />
                    : isUpgrade
                      ? <><Zap size={13} /> Upgrade to {plan.name}</>
                      : `Switch to ${plan.name}`
                  }
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Test mode notice */}
      <div style={{
        marginTop: 24, padding: '12px 16px', borderRadius: 8,
        background: 'rgba(160,128,48,.08)', border: '1px solid rgba(160,128,48,.2)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <AlertCircle size={15} style={{ color: 'var(--gold)', flexShrink: 0 }} />
        <span style={{ fontSize: '0.78rem', color: 'var(--ink2)' }}>
          Stripe is in <strong>test mode</strong> — no real charges. Use card <code style={{ fontFamily: 'DM Mono, monospace', background: 'var(--bg3)', padding: '1px 5px', borderRadius: 3 }}>4242 4242 4242 4242</code>, any future expiry, any CVC.
        </span>
      </div>
    </div>
  )
}

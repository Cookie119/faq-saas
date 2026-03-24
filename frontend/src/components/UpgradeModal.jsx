import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Zap, CheckCircle } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const UPGRADE_PLANS = [
  {
    key:   'pro',
    name:  'Pro',
    price: '₹900.00/mo',
    color: 'var(--green)',
    feats: ['10 domains', '10,000 questions / month', '5 MB knowledge base', 'Origin restrictions'],
  },
  {
    key:   'enterprise',
    name:  'Enterprise',
    price: '₹1800.00/mo',
    color: 'var(--gold)',
    feats: ['Unlimited domains', 'Unlimited questions', '20 MB knowledge base', 'SLA + dedicated support'],
  },
]

export default function UpgradeModal({ reason, onClose }) {
  const token = localStorage.getItem('token')
  const navigate  = useNavigate()
  const [upgrading, setUpgrading] = useState('')

  const handleUpgrade = async (plan) => {
    setUpgrading(plan.key)
    try {
      const { data } = await axios.post(
        `${BASE}/billing/create-checkout-session`,
        {
          plan:        plan.key,
          success_url: window.location.origin + '/billing?success=true',
          cancel_url:  window.location.origin + window.location.pathname,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      window.location.href = data.url
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not start checkout')
      setUpgrading('')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--bg2)', borderRadius: 16,
        border: '1px solid var(--border)',
        width: '100%', maxWidth: 560,
        boxShadow: '0 24px 80px rgba(0,0,0,.3)',
        overflow: 'hidden',
        animation: 'fadeUp .25s ease both',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'var(--green-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={16} style={{ color: 'var(--green)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>Upgrade your plan</div>
              {reason && <div style={{ fontSize: '0.75rem', color: 'var(--ink3)', marginTop: 1 }}>{reason}</div>}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ink3)', padding: 4, borderRadius: 6,
            display: 'flex', alignItems: 'center',
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Plans */}
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {UPGRADE_PLANS.map(plan => (
            <div key={plan.key} style={{
              border: '1px solid var(--border)',
              borderRadius: 10, padding: '18px 16px',
              display: 'flex', flexDirection: 'column',
              background: 'var(--bg3)',
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: plan.color, marginBottom: 6 }}>
                {plan.name}
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', color: 'var(--ink)', marginBottom: 12, letterSpacing: '-.02em' }}>
                {plan.price}
              </div>
              <ul style={{ listStyle: 'none', flex: 1, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {plan.feats.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: '0.78rem', color: 'var(--ink2)' }}>
                    <CheckCircle size={11} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan)}
                disabled={!!upgrading}
                style={{
                  width: '100%', padding: '9px', borderRadius: 7, border: 'none',
                  background: 'var(--green)', color: '#fff',
                  fontSize: '0.8rem', fontWeight: 700,
                  cursor: upgrading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: upgrading && upgrading !== plan.key ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {upgrading === plan.key
                  ? <span className="spinner" />
                  : <>Upgrade to {plan.name} <Zap size={12} /></>
                }
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px 16px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--ink3)' }}>
            Test mode · use card 4242 4242 4242 4242
          </span>
          <button
            onClick={() => { onClose(); navigate('/billing') }}
            style={{ fontSize: '0.75rem', color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
          >
            See all plans →
          </button>
        </div>
      </div>
    </div>
  )
}
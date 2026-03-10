import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAFAF8', color: '#111', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 48px;
          transition: all 0.3s ease;
        }
        .nav.scrolled {
          background: rgba(250,250,248,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #E8E8E4;
          padding: 14px 48px;
        }
        .nav-logo {
          font-family: 'DM Serif Display', serif;
          font-size: 1.4rem;
          color: #111;
          text-decoration: none;
          letter-spacing: -0.02em;
        }
        .nav-logo span { color: #2D6A4F; font-style: italic; }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-link {
          font-size: 0.88rem; font-weight: 400; color: #555;
          text-decoration: none; transition: color 0.2s;
        }
        .nav-link:hover { color: #111; }
        .btn-nav {
          padding: 8px 20px; border-radius: 6px;
          font-size: 0.88rem; font-weight: 500; cursor: pointer;
          transition: all 0.2s; border: none;
        }
        .btn-outline {
          background: transparent; color: #111;
          border: 1.5px solid #D0D0C8;
        }
        .btn-outline:hover { border-color: #111; }
        .btn-dark {
          background: #111; color: #fff;
        }
        .btn-dark:hover { background: #2D6A4F; }

        /* Hero */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 120px 24px 80px;
          text-align: center;
          position: relative;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 100px;
          background: #F0F7F4; border: 1px solid #C8E0D8;
          font-size: 0.78rem; font-weight: 500; color: #2D6A4F;
          margin-bottom: 32px;
          animation: fadeUp 0.6s ease both;
        }
        .hero-eyebrow::before {
          content: ''; width: 6px; height: 6px; border-radius: 50%;
          background: #2D6A4F;
        }
        .hero-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(3rem, 7vw, 5.5rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: #111;
          max-width: 800px;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .hero-title em {
          font-style: italic; color: #2D6A4F;
        }
        .hero-sub {
          margin-top: 24px;
          font-size: 1.1rem; font-weight: 300; color: #666;
          max-width: 520px; line-height: 1.7;
          animation: fadeUp 0.6s 0.2s ease both;
        }
        .hero-cta {
          display: flex; gap: 12px; margin-top: 40px;
          animation: fadeUp 0.6s 0.3s ease both;
        }
        .btn-primary-lg {
          padding: 14px 32px; border-radius: 8px;
          font-size: 0.95rem; font-weight: 500; cursor: pointer;
          background: #111; color: #fff; border: none;
          transition: all 0.2s; letter-spacing: -0.01em;
        }
        .btn-primary-lg:hover { background: #2D6A4F; transform: translateY(-1px); }
        .btn-ghost-lg {
          padding: 14px 32px; border-radius: 8px;
          font-size: 0.95rem; font-weight: 400; cursor: pointer;
          background: transparent; color: #555;
          border: 1.5px solid #D8D8D0; transition: all 0.2s;
        }
        .btn-ghost-lg:hover { border-color: #111; color: #111; }

        /* Hero code preview */
        .hero-code {
          margin-top: 64px; width: 100%; max-width: 600px;
          background: #1A1A18; border-radius: 12px;
          overflow: hidden; text-align: left;
          box-shadow: 0 24px 60px rgba(0,0,0,0.15);
          animation: fadeUp 0.6s 0.4s ease both;
        }
        .code-bar {
          display: flex; align-items: center; gap: 6px;
          padding: 12px 16px; background: #242420;
          border-bottom: 1px solid #333;
        }
        .code-dot { width: 10px; height: 10px; border-radius: 50%; }
        .code-body {
          padding: 20px 24px;
          font-family: 'DM Mono', monospace;
          font-size: 0.78rem; line-height: 1.8; color: #A8A89C;
        }
        .c-green { color: #74C69D; }
        .c-blue  { color: #74B0D4; }
        .c-str   { color: #E8C87C; }
        .c-dim   { color: #666; }

        /* Section commons */
        section { padding: 100px 24px; }
        .container { max-width: 1100px; margin: 0 auto; }
        .section-label {
          font-size: 0.75rem; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: #2D6A4F; margin-bottom: 16px;
        }
        .section-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          letter-spacing: -0.025em; line-height: 1.1; color: #111;
          margin-bottom: 16px;
        }
        .section-sub {
          font-size: 1rem; color: #777; line-height: 1.7;
          max-width: 480px;
        }

        /* How it works */
        .steps {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 2px; margin-top: 56px;
          background: #E8E8E4; border-radius: 12px; overflow: hidden;
        }
        .step {
          background: #FAFAF8; padding: 40px 36px;
          position: relative;
        }
        .step-num {
          font-family: 'DM Serif Display', serif;
          font-size: 3.5rem; color: #E8E8E4;
          line-height: 1; margin-bottom: 20px;
        }
        .step-title {
          font-size: 1rem; font-weight: 600; color: #111;
          margin-bottom: 10px; letter-spacing: -0.01em;
        }
        .step-desc { font-size: 0.88rem; color: #777; line-height: 1.7; }
        .step-tag {
          display: inline-block; margin-top: 16px;
          padding: 4px 10px; border-radius: 4px;
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem; background: #F0F7F4; color: #2D6A4F;
        }

        /* Features */
        .features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 24px; margin-top: 56px;
        }
        .feature {
          padding: 32px; border-radius: 10px;
          border: 1px solid #E8E8E4;
          transition: border-color 0.2s, transform 0.2s;
        }
        .feature:hover { border-color: #2D6A4F; transform: translateY(-2px); }
        .feature-icon {
          width: 40px; height: 40px; border-radius: 8px;
          background: #F0F7F4; display: flex; align-items: center;
          justify-content: center; font-size: 1.1rem; margin-bottom: 16px;
        }
        .feature-title {
          font-size: 0.95rem; font-weight: 600; color: #111;
          margin-bottom: 8px; letter-spacing: -0.01em;
        }
        .feature-desc { font-size: 0.85rem; color: #777; line-height: 1.65; }

        /* Pricing */
        .pricing-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 16px; margin-top: 56px; align-items: start;
        }
        .plan {
          border-radius: 12px; padding: 36px 32px;
          border: 1.5px solid #E8E8E4;
          transition: border-color 0.2s;
        }
        .plan:hover { border-color: #C0C0B8; }
        .plan.featured {
          border-color: #111; background: #111; color: #fff;
        }
        .plan-name {
          font-size: 0.78rem; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: #999; margin-bottom: 12px;
        }
        .plan.featured .plan-name { color: #666; }
        .plan-price {
          font-family: 'DM Serif Display', serif;
          font-size: 3rem; letter-spacing: -0.03em; line-height: 1;
          color: #111; margin-bottom: 4px;
        }
        .plan.featured .plan-price { color: #fff; }
        .plan-period { font-size: 0.82rem; color: #999; margin-bottom: 28px; }
        .plan.featured .plan-period { color: #666; }
        .plan-features { list-style: none; margin-bottom: 32px; }
        .plan-features li {
          font-size: 0.88rem; color: #555; padding: 7px 0;
          border-bottom: 1px solid #F0F0EC;
          display: flex; align-items: center; gap: 10px;
        }
        .plan.featured .plan-features li { color: #BBB; border-color: #222; }
        .plan-features li::before { content: '—'; color: #2D6A4F; font-weight: 700; flex-shrink: 0; }
        .plan.featured .plan-features li::before { color: #74C69D; }
        .plan-btn {
          width: 100%; padding: 12px; border-radius: 7px;
          font-size: 0.9rem; font-weight: 500; cursor: pointer;
          transition: all 0.2s; border: 1.5px solid #D8D8D0;
          background: transparent; color: #111; letter-spacing: -0.01em;
        }
        .plan-btn:hover { border-color: #111; }
        .plan.featured .plan-btn {
          background: #fff; color: #111; border-color: #fff;
        }
        .plan.featured .plan-btn:hover { background: #74C69D; border-color: #74C69D; }
        .plan-badge {
          display: inline-block; padding: 4px 10px; border-radius: 4px;
          font-size: 0.7rem; font-weight: 500; letter-spacing: 0.06em;
          text-transform: uppercase; background: #2D6A4F; color: #fff;
          margin-bottom: 12px;
        }

        /* Footer */
        footer {
          border-top: 1px solid #E8E8E4;
          padding: 40px 48px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .footer-logo {
          font-family: 'DM Serif Display', serif;
          font-size: 1.1rem; color: #111;
        }
        .footer-logo span { color: #2D6A4F; font-style: italic; }
        .footer-copy { font-size: 0.8rem; color: #AAA; }

        /* Divider */
        .divider {
          height: 1px; background: #E8E8E4;
          margin: 0 48px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .nav { padding: 16px 20px; }
          .nav.scrolled { padding: 12px 20px; }
          .nav-links { gap: 16px; }
          .steps, .features-grid, .pricing-grid { grid-template-columns: 1fr; }
          .hero-cta { flex-direction: column; align-items: center; }
          footer { flex-direction: column; gap: 12px; text-align: center; }
          .divider { margin: 0 20px; }
          section { padding: 70px 20px; }
        }
      `}</style>

      {/* Nav */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <a href="#" className="nav-logo">faq<span>bot</span></a>
        <div className="nav-links">
          <a href="#how" className="nav-link">How it works</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <button className="btn-nav btn-outline" onClick={() => navigate('/login')}>Sign in</button>
          <button className="btn-nav btn-dark" onClick={() => navigate('/register')}>Get started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" ref={heroRef}>
        <div className="hero-eyebrow">AI-powered FAQ bots for your business</div>
        <h1 className="hero-title">
          Answer every question,<br /><em>automatically.</em>
        </h1>
        <p className="hero-sub">
          Upload your docs. Get an AI bot that answers customer questions 24/7 — embed it anywhere in minutes.
        </p>
        <div className="hero-cta">
          <button className="btn-primary-lg" onClick={() => navigate('/register')}>
            Start for free →
          </button>
          <button className="btn-ghost-lg" onClick={() => navigate('/login')}>
            Sign in
          </button>
        </div>

        <div className="hero-code">
          <div className="code-bar">
            <div className="code-dot" style={{ background: '#FF5F57' }} />
            <div className="code-dot" style={{ background: '#FEBC2E' }} />
            <div className="code-dot" style={{ background: '#28C840' }} />
            <span style={{ marginLeft: 8, fontSize: '0.72rem', color: '#666', fontFamily: 'DM Mono, monospace' }}>integration.js</span>
          </div>
          <div className="code-body">
            <div><span className="c-dim">// One API call. That's it.</span></div>
            <div style={{ marginTop: 8 }}>
              <span className="c-blue">const</span> <span className="c-green">res</span> = <span className="c-blue">await</span> <span style={{ color: '#E8E8E4' }}>fetch(</span><span className="c-str">"https://faq-saas.onrender.com/ask"</span><span style={{ color: '#E8E8E4' }}>, {'{'}</span>
            </div>
            <div style={{ paddingLeft: 16 }}>
              <span style={{ color: '#E8E8E4' }}>method: </span><span className="c-str">"POST"</span><span style={{ color: '#E8E8E4' }}>,</span>
            </div>
            <div style={{ paddingLeft: 16 }}>
              <span style={{ color: '#E8E8E4' }}>headers: {'{'} </span>
              <span className="c-str">"X-API-Key"</span>
              <span style={{ color: '#E8E8E4' }}>: </span>
              <span className="c-str">"sk_live_••••••"</span>
              <span style={{ color: '#E8E8E4' }}> {'}'}</span>
            </div>
            <div style={{ paddingLeft: 16 }}>
              <span style={{ color: '#E8E8E4' }}>body: </span><span className="c-blue">JSON</span><span style={{ color: '#E8E8E4' }}>.stringify({'{'} domain_id: </span><span className="c-str">"my-faq"</span><span style={{ color: '#E8E8E4' }}>, question {'}'}</span>
            </div>
            <div><span style={{ color: '#E8E8E4' }}>{'}'});</span></div>
            <div style={{ marginTop: 8 }}>
              <span className="c-dim">// → {'{'} answer: "Our return policy is 30 days..." {'}'}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* How it works */}
      <section id="how">
        <div className="container">
          <div className="section-label">How it works</div>
          <h2 className="section-title">Up and running<br />in three steps</h2>
          <div className="steps">
            <div className="step">
              <div className="step-num">01</div>
              <div className="step-title">Upload your docs</div>
              <div className="step-desc">Write your FAQ content in Markdown. Upload it to your dashboard — our engine indexes it into searchable chunks instantly.</div>
              <span className="step-tag">.md file upload</span>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <div className="step-title">Configure your bot</div>
              <div className="step-desc">Set a persona, tone, and language. Define a fallback message for unanswered questions. Restrict which domains can use your bot.</div>
              <span className="step-tag">dashboard settings</span>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <div className="step-title">Embed anywhere</div>
              <div className="step-desc">Call our API from any website, app, or platform using your API key. One POST request returns an AI-generated answer in milliseconds.</div>
              <span className="step-tag">POST /ask</span>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Features */}
      <section id="features">
        <div className="container">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything you need,<br />nothing you don't</h2>
          <p className="section-sub">Built for developers and businesses who want a working FAQ bot — not a months-long integration project.</p>

          <div className="features-grid">
            {[
              { icon: '🤖', title: 'AI-powered answers', desc: 'Powered by Groq + Llama 3. Answers are grounded in your content — no hallucinations, no off-topic replies.' },
              { icon: '🔑', title: 'API key auth', desc: 'Each account gets a unique API key. Rotate it anytime from your dashboard. Restrict usage to specific domains.' },
              { icon: '🛡️', title: 'Origin restrictions', desc: 'Lock each bot to specific domains. Even if your key leaks, unauthorized websites are blocked at the API level.' },
              { icon: '📊', title: 'Usage analytics', desc: 'See every question asked, which domains drive traffic, and how close you are to your monthly limit.' },
              { icon: '⚡', title: 'BM25 search', desc: 'Fast keyword-based retrieval finds the most relevant chunks from your docs before passing them to the AI.' },
              { icon: '🌐', title: 'Multi-language', desc: 'Configure your bot to respond in any language. Serve global audiences without maintaining separate bots.' },
              { icon: '📁', title: 'Multiple domains', desc: 'Run separate bots for different products, support topics, or brands — all under one account.' },
              { icon: '📈', title: 'Plan limits', desc: 'Free, Pro, and Enterprise tiers with clear question and domain limits. Upgrade when you need to scale.' },
              { icon: '🔄', title: 'Conversation history', desc: 'Pass message history with each request for context-aware multi-turn conversations.' },
            ].map((f, i) => (
              <div className="feature" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Pricing */}
      <section id="pricing">
        <div className="container">
          <div className="section-label">Pricing</div>
          <h2 className="section-title">Simple, honest pricing</h2>
          <p className="section-sub">Start free. Upgrade when your usage grows. No surprise charges.</p>

          <div className="pricing-grid">
            {/* Free */}
            <div className="plan">
              <div className="plan-name">Free</div>
              <div className="plan-price">$0</div>
              <div className="plan-period">forever</div>
              <ul className="plan-features">
                <li>1 domain / bot</li>
                <li>500 questions / month</li>
                <li>500 KB knowledge base</li>
                <li>API access</li>
                <li>Analytics dashboard</li>
              </ul>
              <button className="plan-btn" onClick={() => navigate('/register')}>Get started free</button>
            </div>

            {/* Pro */}
            <div className="plan featured">
              <div className="plan-badge">Most popular</div>
              <div className="plan-name">Pro</div>
              <div className="plan-price">$19</div>
              <div className="plan-period">per month</div>
              <ul className="plan-features">
                <li>10 domains / bots</li>
                <li>10,000 questions / month</li>
                <li>5 MB knowledge base</li>
                <li>Origin restrictions</li>
                <li>Priority support</li>
              </ul>
              <button className="plan-btn" onClick={() => navigate('/register')}>Start Pro trial</button>
            </div>

            {/* Enterprise */}
            <div className="plan">
              <div className="plan-name">Enterprise</div>
              <div className="plan-price">$99</div>
              <div className="plan-period">per month</div>
              <ul className="plan-features">
                <li>Unlimited domains</li>
                <li>Unlimited questions</li>
                <li>20 MB knowledge base</li>
                <li>Custom integrations</li>
                <li>Dedicated support</li>
              </ul>
              <button className="plan-btn" onClick={() => navigate('/register')}>Contact sales</button>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Footer */}
      <footer>
        <div className="footer-logo">faq<span>bot</span></div>
        <div className="footer-copy">© {new Date().getFullYear()} faqbot. Built with FastAPI + React.</div>
      </footer>
    </div>
  )
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ── CSS (injected once) ───────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --bg: #FAFAF8;
    --ink: #111110;
    --ink2: #3a3a38;
    --ink3: #7a7a76;
    --green: #2D6A4F;
    --green2: #1B4332;
    --green-light: #D8F3DC;
    --gold: #B57A1A;
    --border: rgba(0,0,0,0.08);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--ink); font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }

  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px; height: 64px;
    background: rgba(250,250,248,0.88); backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border);
    transition: box-shadow 0.2s;
  }
  .nav.scrolled { box-shadow: 0 2px 20px rgba(0,0,0,0.07); }
  .nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .nav-logo { width: 34px; height: 34px; object-fit: contain; transition: transform 0.3s ease; }
  .nav-brand:hover .nav-logo { transform: rotate(-8deg) scale(1.05); }
  .nav-brand-name { font-family: 'DM Serif Display', serif; font-size: 20px; color: var(--ink); }
  .nav-links { display: flex; align-items: center; gap: 32px; }
  .nav-link { font-size: 14px; font-weight: 500; color: var(--ink2); text-decoration: none; transition: color 0.15s; }
  .nav-link:hover { color: var(--green); }
  .nav-cta { background: var(--green); color: #fff; border: none; border-radius: 8px; padding: 9px 22px; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s, transform 0.15s; }
  .nav-cta:hover { background: var(--green2); transform: translateY(-1px); }

  .hero {
    min-height: 100vh; display: flex; align-items: center;
    padding: 96px 48px 72px; position: relative; overflow: hidden;
  }
  .hero::before {
    content: ''; position: absolute; top: -100px; right: -200px;
    width: 700px; height: 700px; border-radius: 50%;
    background: radial-gradient(circle, rgba(181,122,26,0.07) 0%, transparent 65%);
    pointer-events: none;
  }
  .hero-content { max-width: 580px; position: relative; z-index: 2; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--green-light); color: var(--green2);
    border-radius: 100px; padding: 5px 16px;
    font-size: 11.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
    margin-bottom: 32px;
  }
  .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: blink 2s ease-in-out infinite; }
  .hero-h1 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(44px, 5.5vw, 68px);
    line-height: 1.08; letter-spacing: -0.025em;
    color: var(--ink); margin-bottom: 22px;
  }
  .hero-h1 em { font-style: italic; color: var(--green); }
  .hero-sub { font-size: 18px; line-height: 1.7; color: var(--ink2); margin-bottom: 40px; max-width: 480px; }
  .hero-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 52px; }
  .btn-primary { background: var(--green); color: #fff; border: none; border-radius: 10px; padding: 14px 30px; font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s, transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 18px rgba(45,106,79,0.28); }
  .btn-primary:hover { background: var(--green2); transform: translateY(-2px); box-shadow: 0 8px 28px rgba(45,106,79,0.34); }
  .btn-ghost { background: transparent; color: var(--ink); border: 1.5px solid rgba(0,0,0,0.14); border-radius: 10px; padding: 13px 26px; font-size: 15px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: border-color 0.15s, background 0.15s; }
  .btn-ghost:hover { border-color: var(--green); background: rgba(45,106,79,0.04); color: var(--green); }

  /* Code block */
  .hero-code {
    background: #0F1117; border-radius: 14px; padding: 22px 26px;
    font-family: 'DM Mono', monospace; font-size: 12.5px; line-height: 1.75;
    max-width: 500px; border: 1px solid rgba(255,255,255,0.05);
    box-shadow: 0 24px 64px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.03);
  }
  .code-dots { display: flex; gap: 7px; margin-bottom: 18px; }
  .code-dot { width: 11px; height: 11px; border-radius: 50%; }
  .c-r { background: #FF5F57; } .c-y { background: #FFBD2E; } .c-g { background: #28C840; }
  .t-comment { color: #6A9955; } .t-key { color: #9CDCFE; } .t-str { color: #CE9178; }
  .t-method { color: #DCDCAA; } .t-punct { color: #666; } .t-val { color: #B5CEA8; }

  /* Floating golden leaf */
  .hero-leaf {
    position: absolute; right: -20px; top: 50%;
    transform: translateY(-52%);
    width: min(500px, 44vw); aspect-ratio: 1;
    z-index: 1; pointer-events: none;
  }
  .hero-leaf img {
    width: 100%; height: 100%; object-fit: contain;
    animation: leafDrift 10s ease-in-out infinite;
    filter: drop-shadow(0 30px 60px rgba(181,122,26,0.22));
  }
  .hero-leaf-glow {
    position: absolute; inset: -15%; border-radius: 50%;
    background: radial-gradient(circle, rgba(181,122,26,0.1) 0%, transparent 70%);
    animation: glowPulse 10s ease-in-out infinite;
    pointer-events: none;
  }

  /* Section layout */
  .section { padding: 108px 48px; }
  .section-inner { max-width: 960px; margin: 0 auto; }
  .section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--green); margin-bottom: 10px; }
  .section-h2 { font-family: 'DM Serif Display', serif; font-size: clamp(32px, 3.8vw, 50px); line-height: 1.12; letter-spacing: -0.022em; color: var(--ink); margin-bottom: 14px; }
  .section-sub { font-size: 17px; color: var(--ink2); line-height: 1.65; max-width: 520px; }
  .tc { text-align: center; } .tc .section-sub { margin: 0 auto; }

  /* How it works */
  .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-top: 64px; background: var(--border); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; }
  .step { padding: 36px 32px; background: #fff; transition: background 0.2s; }
  .step:hover { background: #FDFDF9; }
  .step-num { font-family: 'DM Serif Display', serif; font-size: 52px; line-height: 1; color: rgba(45,106,79,0.18); margin-bottom: 22px; }
  .step-h { font-size: 17px; font-weight: 600; color: var(--ink); margin-bottom: 10px; }
  .step-p { font-size: 14px; color: var(--ink3); line-height: 1.7; }

  /* Features dark */
  .features-bg { background: #0F1117; }
  .features-bg .section-h2 { color: #F8F8F6; }
  .features-bg .section-sub { color: rgba(248,248,246,0.45); }
  .features-bg .section-label { color: #68C68E; }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; margin-top: 64px; background: rgba(255,255,255,0.05); border-radius: 18px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); }
  .feat { padding: 32px; background: #0F1117; transition: background 0.2s; }
  .feat:hover { background: #14181F; }
  .feat-icon { font-size: 26px; margin-bottom: 14px; }
  .feat-h { font-size: 15px; font-weight: 600; color: #F8F8F6; margin-bottom: 8px; }
  .feat-p { font-size: 13.5px; color: rgba(248,248,246,0.4); line-height: 1.65; }

  /* Pricing */
  .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 64px; }
  .pc { padding: 38px 32px; border: 1px solid var(--border); border-radius: 18px; background: #fff; transition: transform 0.2s, box-shadow 0.2s; }
  .pc:hover { transform: translateY(-5px); box-shadow: 0 16px 50px rgba(0,0,0,0.09); }
  .pc.hot { background: var(--green); border-color: var(--green); }
  .pc-plan { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink3); margin-bottom: 18px; }
  .pc.hot .pc-plan { color: rgba(255,255,255,0.6); }
  .pc-price { font-family: 'DM Serif Display', serif; font-size: 52px; line-height: 1; color: var(--ink); margin-bottom: 4px; }
  .pc.hot .pc-price { color: #fff; }
  .pc-period { font-size: 13px; color: var(--ink3); margin-bottom: 30px; }
  .pc.hot .pc-period { color: rgba(255,255,255,0.6); }
  .pc-features { list-style: none; margin-bottom: 32px; }
  .pc-features li { font-size: 13.5px; color: var(--ink2); padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.06); display: flex; gap: 9px; align-items: flex-start; }
  .pc-features li::before { content: "✓"; font-weight: 700; color: var(--green); font-size: 12px; margin-top: 2px; flex-shrink: 0; }
  .pc.hot .pc-features li { color: rgba(255,255,255,0.85); border-bottom-color: rgba(255,255,255,0.1); }
  .pc.hot .pc-features li::before { color: #A8DFC0; }
  .pc-btn { width: 100%; padding: 13px; border-radius: 10px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; border: 1.5px solid var(--green); background: transparent; color: var(--green); transition: all 0.15s; }
  .pc-btn:hover { background: var(--green); color: #fff; }
  .pc.hot .pc-btn { background: rgba(255,255,255,0.95); color: var(--green); border-color: transparent; }
  .pc.hot .pc-btn:hover { background: #fff; }

  footer { border-top: 1px solid var(--border); padding: 36px 48px; display: flex; align-items: center; justify-content: space-between; }
  .footer-brand { display: flex; align-items: center; gap: 9px; font-family: 'DM Serif Display', serif; font-size: 18px; color: var(--ink); }
  .footer-copy { font-size: 13px; color: var(--ink3); }

  /* Animations */
  @keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
  @keyframes leafDrift {
    0%,100% { transform: translateY(0) rotate(0deg); }
    25%      { transform: translateY(-22px) rotate(3deg); }
    50%      { transform: translateY(-8px) rotate(-1deg); }
    75%      { transform: translateY(-28px) rotate(2deg); }
  }
  @keyframes glowPulse { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  .fu  { opacity:0; animation: fadeUp 0.75s cubic-bezier(.16,1,.3,1) forwards; }
  .d1  { animation-delay:.08s } .d2  { animation-delay:.22s } .d3  { animation-delay:.36s }
  .d4  { animation-delay:.5s  } .d5  { animation-delay:.64s }

  @media (max-width: 900px) {
    .hero-leaf { display: none; }
    .steps, .features-grid, .pricing-grid { grid-template-columns: 1fr; }
    .nav-links { display: none; }
    .section { padding: 64px 24px; }
    .hero { padding: 96px 24px 64px; }
    .nav { padding: 0 24px; }
    footer { flex-direction: column; gap: 10px; text-align: center; padding: 32px 24px; }
  }
`;

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.createElement("style");
    el.id = "landing-styles";
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.getElementById("landing-styles")?.remove();
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ background: "#FAFAF8", minHeight: "100vh" }}>

      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <a className="nav-brand" href="/">
          <img className="nav-logo" src="/logo_green.svg" alt="Ginkgo leaf logo" />
          <span className="nav-brand-name">ginkgo</span>
        </a>
        <div className="nav-links">
          <a className="nav-link" href="#how-it-works">How it works</a>
          <a className="nav-link" href="#features">Features</a>
          <a className="nav-link" href="#pricing">Pricing</a>
          <a className="nav-link" href="/login">Sign in</a>
        </div>
        <button className="nav-cta" onClick={() => navigate("/register")}>
          Start free →
        </button>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge fu">
            <span className="hero-badge-dot" />
            Now in public beta
          </div>
          <h1 className="hero-h1 fu d1">
            Your docs,<br />
            <em>answered instantly</em>
          </h1>
          <p className="hero-sub fu d2">
            Upload a markdown knowledge base. Get a hosted FAQ bot your team or customers
            can query over API — no training, no pipelines, no infrastructure.
          </p>
          <div className="hero-actions fu d3">
            <button className="btn-primary" onClick={() => navigate("/register")}>
              Get started free
            </button>
            <button className="btn-ghost" onClick={() => navigate("/login")}>
              Sign in
            </button>
          </div>

          {/* Syntax-highlighted code preview */}
          <div className="hero-code fu d4">
            <div className="code-dots">
              <div className="code-dot c-r" />
              <div className="code-dot c-y" />
              <div className="code-dot c-g" />
            </div>
            <div><span className="t-comment">// Ask anything from your docs</span></div>
            <div style={{ marginTop: 12 }}>
              <span className="t-key">const</span>
              <span style={{ color: "#cdd6f4" }}> res </span>
              <span className="t-punct">= await </span>
              <span className="t-method">fetch</span>
              <span className="t-punct">(</span>
              <span className="t-str">'https://api.ginkgo.sh/ask'</span>
              <span className="t-punct">, {"{"}</span>
            </div>
            <div style={{ paddingLeft: 20 }}>
              <span className="t-key">method</span>
              <span className="t-punct">: </span>
              <span className="t-str">'POST'</span>
              <span className="t-punct">,</span>
            </div>
            <div style={{ paddingLeft: 20 }}>
              <span className="t-key">headers</span>
              <span className="t-punct">: {"{"} </span>
              <span className="t-str">'X-API-Key'</span>
              <span className="t-punct">: </span>
              <span className="t-str">sk_live_••••••</span>
              <span className="t-punct"> {"}"},</span>
            </div>
            <div style={{ paddingLeft: 20 }}>
              <span className="t-key">body</span>
              <span className="t-punct">: </span>
              <span className="t-method">JSON.stringify</span>
              <span className="t-punct">({"{"}</span>
            </div>
            <div style={{ paddingLeft: 40 }}>
              <span className="t-key">domain_id</span>
              <span className="t-punct">: </span>
              <span className="t-str">'my-product-docs'</span>
              <span className="t-punct">,</span>
            </div>
            <div style={{ paddingLeft: 40 }}>
              <span className="t-key">question</span>
              <span className="t-punct">: </span>
              <span className="t-str">'How do I reset my password?'</span>
            </div>
            <div style={{ paddingLeft: 20 }}><span className="t-punct">{"})"})</span></div>
            <div><span className="t-punct">{"});"}</span></div>
            <div style={{ marginTop: 14 }}>
              <span className="t-comment">{"// → { answer: \"Go to Settings → Security → Reset\" }"}</span>
            </div>
          </div>
        </div>

        {/* Animated golden autumn leaf */}
        <div className="hero-leaf fu d5">
          <div className="hero-leaf-glow" />
          <img
            src="/logo_gold.svg"
            alt=""
            aria-hidden="true"
          />
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────── */}
      <section className="section" id="how-it-works" style={{ background: "#fff" }}>
        <div className="section-inner">
          <div className="tc">
            <div className="section-label">Process</div>
            <h2 className="section-h2">Up and running in minutes</h2>
            <p className="section-sub">No ML expertise needed. Write your docs, drop them in, start answering.</p>
          </div>
          <div className="steps">
            {[
              { n: "01", h: "Upload your .md files", p: "Paste your docs, FAQs, or any markdown knowledge base into your domain. We handle chunking and indexing automatically." },
              { n: "02", h: "Get your API key", p: "Every domain ships with a unique API key. Use it in your app, website, or Slack bot. Rotate it any time from the dashboard." },
              { n: "03", h: "Query from anywhere", p: "POST a question, get a grounded answer with source references in milliseconds. Scales to as many users as you need." },
            ].map((s, i) => (
              <div key={i} className="step">
                <div className="step-num">{s.n}</div>
                <div className="step-h">{s.h}</div>
                <p className="step-p">{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="section features-bg" id="features">
        <div className="section-inner">
          <div className="tc">
            <div className="section-label">Features</div>
            <h2 className="section-h2">Everything you need, nothing you don't</h2>
            <p className="section-sub">Built for developers who want power without complexity.</p>
          </div>
          <div className="features-grid">
            {[
              { icon: "🔍", h: "BM25 Search", p: "Keyword-aware retrieval finds the most relevant chunks, not just semantic neighbours." },
              { icon: "⚡", h: "Sub-second latency", p: "Powered by Llama 3.1 via Groq. Fast responses even on large documents." },
              { icon: "🔑", h: "API key auth", p: "Simple X-API-Key header. Rotate keys, scope per domain, revoke instantly." },
              { icon: "🌐", h: "Origin restrictions", p: "Lock each domain to specific origins. Prevent unauthorized embedding." },
              { icon: "📊", h: "Usage analytics", p: "Track queries per domain, daily trends, and monthly limits from your dashboard." },
              { icon: "🗂️", h: "Multi-domain", p: "Run separate knowledge bases for different products, teams, or clients." },
              { icon: "📝", h: "Markdown native", p: "Upload .md files directly. We chunk, index, and search them intelligently." },
              { icon: "🔒", h: "Isolated tenants", p: "Every company's data is fully isolated. No cross-contamination, ever." },
              { icon: "🚀", h: "Free tier", p: "Start with 500 questions/month at no cost. Upgrade only when you're ready." },
            ].map((f, i) => (
              <div key={i} className="feat">
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-h">{f.h}</div>
                <p className="feat-p">{f.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────── */}
      <section className="section" id="pricing">
        <div className="section-inner">
          <div className="tc">
            <div className="section-label">Pricing</div>
            <h2 className="section-h2">Simple, honest pricing</h2>
            <p className="section-sub">No seats, no surprises. Pay for what you use.</p>
          </div>
          <div className="pricing-grid">
            {[
              { plan: "Free", price: "$0", period: "forever", feats: ["1 domain", "500 questions / month", "500KB knowledge base", "API key access", "Community support"], cta: "Start free" },
              { plan: "Pro", price: "$29", period: "per month", feats: ["10 domains", "10,000 questions / month", "5MB knowledge base", "Origin restrictions", "Priority support"], cta: "Get Pro", hot: true },
              { plan: "Enterprise", price: "Custom", period: "contact us", feats: ["Unlimited domains", "Unlimited questions", "20MB knowledge base", "SLA guarantee", "Dedicated support"], cta: "Contact us" },
            ].map((p, i) => (
              <div key={i} className={`pc${p.hot ? " hot" : ""}`}>
                <div className="pc-plan">{p.plan}</div>
                <div className="pc-price">{p.price}</div>
                <div className="pc-period">{p.period}</div>
                <ul className="pc-features">
                  {p.feats.map((f, j) => <li key={j}>{f}</li>)}
                </ul>
                <button className="pc-btn" onClick={() => navigate(p.plan === "Enterprise" ? "/contact" : "/register")}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer>
        <div className="footer-brand">
          <img src="/logo_green.svg" alt="" style={{ width: 22, height: 22, objectFit: "contain" }} />
          ginkgo
        </div>
        <div className="footer-copy">© {new Date().getFullYear()} Ginkgo. Built for developers.</div>
      </footer>

    </div>
  );
}
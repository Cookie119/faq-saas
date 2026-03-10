import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const RobotIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>;
const KeyIcon      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3"/></svg>;
const ShieldIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const ChartIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const BoltIcon     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const GlobeIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const FolderIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
const TrendingIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const HistoryIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

const FEATS = [
  { Icon: RobotIcon,    h: "AI-powered answers",   p: "Llama 3.1 via Groq reads your docs and returns grounded answers — never hallucinated." },
  { Icon: KeyIcon,      h: "API key auth",          p: "Simple X-API-Key header. Rotate, scope per domain, or revoke instantly." },
  { Icon: ShieldIcon,   h: "Origin restrictions",   p: "Lock each domain to allowed origins. Unauthorized requests get a clean 403." },
  { Icon: ChartIcon,    h: "Usage analytics",       p: "Daily query trends, per-domain breakdowns, and monthly limit tracking." },
  { Icon: BoltIcon,     h: "Sub-second latency",    p: "BM25 retrieval + Groq inference. Fast enough to use inline, anywhere." },
  { Icon: GlobeIcon,    h: "Embed anywhere",        p: "One fetch call. Works in React, Vue, plain JS, Slack bots, or any HTTP client." },
  { Icon: FolderIcon,   h: "Multi-domain support",  p: "Separate knowledge bases per product, team, or client — all one account." },
  { Icon: TrendingIcon, h: "Query trends",          p: "See which questions spike over time and which domains drive the most usage." },
  { Icon: HistoryIcon,  h: "Question history log",  p: "Full log of every question asked, with timestamp and answer — queryable from your dashboard." },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#F9F9F7;--bg2:#fff;--ink:#0E0E0C;--ink2:#3C3C3A;--ink3:#888884;--ink4:#C0C0BB;
  --green:#2A6049;--green2:#194034;--gtint:#E6F4EE;--line:#E8E8E4;
  --fb:'DM Sans',sans-serif;--fd:'DM Serif Display',serif;--fm:'DM Mono',monospace;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:var(--fb);-webkit-font-smoothing:antialiased}

/* ── NAV ── */
.nav{
  position:fixed;top:0;left:0;right:0;z-index:200;height:60px;
  display:flex;align-items:center;justify-content:space-between;padding:0 48px;
  background:rgba(249,249,247,.94);backdrop-filter:blur(20px);
  border-bottom:1px solid transparent;transition:border-color .2s,box-shadow .2s;
}
.nav.on{border-color:var(--line)}
.nav-brand{display:flex;align-items:center;gap:9px;text-decoration:none}
.nav-logo{width:30px;height:30px;object-fit:contain;transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
.nav-brand:hover .nav-logo{transform:rotate(-10deg) scale(1.1)}
.nav-name{font-family:var(--fd);font-size:19px;color:var(--ink)}
.nav-links{display:flex;align-items:center;gap:32px}
.nav-link{font-size:13.5px;font-weight:500;color:var(--ink2);text-decoration:none;transition:color .15s}
.nav-link:hover{color:var(--green)}
.nav-r{display:flex;align-items:center;gap:10px}
.btn-si{background:transparent;color:var(--ink2);border:1px solid var(--line);border-radius:7px;padding:7px 16px;font-size:13.5px;font-weight:500;font-family:var(--fb);cursor:pointer;transition:border-color .15s,color .15s}
.btn-si:hover{border-color:var(--ink3);color:var(--ink)}
.btn-sf{background:var(--ink);color:#fff;border:1px solid var(--ink);border-radius:7px;padding:7px 18px;font-size:13.5px;font-weight:500;font-family:var(--fb);cursor:pointer;transition:background .15s,transform .12s}
.btn-sf:hover{background:#2a2a28;transform:translateY(-1px)}

/* ── HERO  (TRUE 2-COL SPLIT) ── */
.hero-wrap{
  width:100%;min-height:100vh;
  display:grid;
  grid-template-columns:1fr 1fr;
  align-items:center;
  padding-top:60px;          /* nav height */
  overflow:hidden;
  background:var(--bg);
}

/* left column */
.hero-left{
  padding:80px 56px 80px 64px;
  display:flex;flex-direction:column;align-items:flex-start;
}
.eyebrow{
  display:inline-flex;align-items:center;gap:7px;
  border:1px solid var(--line);border-radius:100px;padding:4px 14px 4px 8px;
  font-size:12px;font-weight:600;color:var(--ink2);letter-spacing:.04em;text-transform:uppercase;
  margin-bottom:28px;background:var(--bg2);
}
.eyebrow-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:blink 2.4s ease-in-out infinite}
.hero-h1{
  font-family:var(--fd);font-size:clamp(44px,4.8vw,68px);
  line-height:1.05;letter-spacing:-.03em;color:var(--ink);margin-bottom:20px;
  text-align:left;
}
.hero-h1 em{font-style:italic;color:var(--green)}
.hero-sub{font-size:16.5px;line-height:1.72;color:var(--ink2);max-width:460px;margin-bottom:36px;text-align:left}
.hero-ctas{display:flex;gap:12px;align-items:center;margin-bottom:48px;flex-wrap:wrap}
.btn-p{background:var(--green);color:#fff;border:none;border-radius:9px;padding:13px 26px;font-size:14px;font-weight:600;font-family:var(--fb);cursor:pointer;letter-spacing:-.01em;transition:background .15s,transform .12s,box-shadow .15s;box-shadow:0 3px 14px rgba(42,96,73,.2)}
.btn-p:hover{background:var(--green2);transform:translateY(-2px);box-shadow:0 8px 22px rgba(42,96,73,.28)}
.btn-o{background:transparent;color:var(--ink);border:1px solid var(--line);border-radius:9px;padding:12px 22px;font-size:14px;font-weight:500;font-family:var(--fb);cursor:pointer;transition:border-color .15s,background .15s}
.btn-o:hover{border-color:var(--ink3);background:rgba(0,0,0,.025)}

/* code block */
.code{background:#0C0D10;border-radius:12px;border:1px solid rgba(255,255,255,.06);padding:20px 22px;font-family:var(--fm);font-size:12px;line-height:1.8;max-width:460px;width:100%;box-shadow:0 16px 48px rgba(0,0,0,.2)}
.cdots{display:flex;gap:6px;margin-bottom:14px}
.cdot{width:10px;height:10px;border-radius:50%}
.cr2{background:#FF5F57}.cy2{background:#FEBC2E}.cg2{background:#28C840}
.t-c{color:#6A9955}.t-k{color:#9CDCFE}.t-s{color:#CE9178}.t-m{color:#DCDCAA}.t-p{color:#4a4a4a}.t-w{color:#CDD6F4}

/* right column — leaf */
.hero-right{
  height:100%;min-height:100vh;
  display:flex;align-items:center;justify-content:center;
  position:relative;
  background:linear-gradient(135deg,rgba(176,116,21,.06) 0%,rgba(249,249,247,0) 60%);
  padding:80px 48px 80px 0;
}
.hero-right::before{
  content:'';position:absolute;top:10%;right:-10%;
  width:70%;height:70%;border-radius:50%;
  background:radial-gradient(circle,rgba(176,116,21,.1) 0%,transparent 65%);
  pointer-events:none;
}
.leaf-box{width:min(480px,90%);aspect-ratio:1;position:relative}
.leaf-glow{position:absolute;inset:-15%;border-radius:50%;background:radial-gradient(circle,rgba(176,116,21,.12) 0%,transparent 65%);animation:glow 9s ease-in-out infinite}
.leaf-img{width:100%;height:100%;object-fit:contain;animation:drift 9s ease-in-out infinite;filter:drop-shadow(0 24px 52px rgba(176,116,21,.22))}

/* ── SECTIONS ── */
.sec{padding:100px 64px}
.inn{max-width:1040px;margin:0 auto}
.lbl{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--green);margin-bottom:10px}
.sh2{font-family:var(--fd);font-size:clamp(28px,3.5vw,46px);line-height:1.1;letter-spacing:-.025em;color:var(--ink);margin-bottom:12px}
.sub{font-size:16px;color:var(--ink2);line-height:1.68;max-width:500px}
.ctr{text-align:center}.ctr .sub{margin:0 auto}

/* ── STEPS ── */
.steps{display:grid;grid-template-columns:repeat(3,1fr);margin-top:56px;border:1px solid var(--line);border-radius:14px;overflow:hidden}
.step{padding:36px 30px;border-right:1px solid var(--line);background:var(--bg2);transition:background .2s}
.step:last-child{border-right:none}
.step:hover{background:#FAFFF9}
.sn{font-family:var(--fd);font-size:42px;line-height:1;color:var(--gtint);margin-bottom:18px}
.sh{font-size:15.5px;font-weight:600;color:var(--ink);margin-bottom:8px;letter-spacing:-.01em}
.sp{font-size:13px;color:var(--ink3);line-height:1.7}

/* ── FEATURES ── */
.dark-sec{background:#0E0E0C}
.dark-sec .sh2{color:#F5F5F2}
.dark-sec .sub{color:rgba(245,245,242,.4)}
.dark-sec .lbl{color:#5DB887}
.feats{display:grid;grid-template-columns:repeat(3,1fr);margin-top:56px;border:1px solid rgba(255,255,255,.07);border-radius:14px;overflow:hidden}
.feat{padding:28px 26px;border-right:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06);background:#0E0E0C;transition:background .2s}
.feat:hover{background:#131311}
.feat:nth-child(3n){border-right:none}
.feat:nth-child(7),.feat:nth-child(8),.feat:nth-child(9){border-bottom:none}
.fi{
  width:38px;height:38px;border-radius:9px;
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);
  display:flex;align-items:center;justify-content:center;
  color:rgba(245,245,242,.5);margin-bottom:14px;
  transition:background .2s,color .2s,border-color .2s;
  flex-shrink:0;
}
.feat:hover .fi{background:rgba(42,96,73,.28);color:#7FD4A8;border-color:rgba(42,96,73,.35)}
.fh{font-size:14px;font-weight:600;color:#F5F5F2;margin-bottom:6px;letter-spacing:-.01em}
.fp{font-size:12.5px;color:rgba(245,245,242,.35);line-height:1.65}

/* ── PRICING ── */
.pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:56px}
.pc{padding:34px 28px;border:1px solid var(--line);border-radius:14px;background:var(--bg2);display:flex;flex-direction:column;transition:transform .2s,box-shadow .2s}
.pc:hover{transform:translateY(-4px);box-shadow:0 14px 44px rgba(0,0,0,.08)}
.pc.hot{background:var(--ink);border-color:var(--ink)}
.pb{font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3);margin-bottom:18px}
.hot .pb{color:rgba(255,255,255,.38)}
.pp{font-family:var(--fd);font-size:48px;line-height:1;color:var(--ink);margin-bottom:2px;letter-spacing:-.03em}
.hot .pp{color:#fff}
.pper{font-size:12px;color:var(--ink3);margin-bottom:24px}
.hot .pper{color:rgba(255,255,255,.38)}
.pdiv{height:1px;background:var(--line);margin-bottom:20px}
.hot .pdiv{background:rgba(255,255,255,.1)}
.pfl{list-style:none;flex:1;margin-bottom:24px}
.pfl li{font-size:13px;color:var(--ink2);padding:6px 0;display:flex;align-items:flex-start;gap:8px;border-bottom:1px solid rgba(0,0,0,.04)}
.pfl li:last-child{border-bottom:none}
.pfl li::before{content:"✓";font-weight:700;color:var(--green);font-size:10.5px;margin-top:3px;flex-shrink:0}
.hot .pfl li{color:rgba(255,255,255,.7);border-bottom-color:rgba(255,255,255,.06)}
.hot .pfl li::before{color:#5DB887}
.pbtn{width:100%;padding:11px;border-radius:8px;font-size:13px;font-weight:600;font-family:var(--fb);cursor:pointer;letter-spacing:-.01em;transition:all .15s;border:1px solid var(--line);background:transparent;color:var(--ink)}
.pbtn:hover{background:var(--ink);color:#fff;border-color:var(--ink)}
.hot .pbtn{background:#fff;color:var(--ink);border-color:transparent}
.hot .pbtn:hover{background:rgba(255,255,255,.88)}

/* ── FOOTER ── */
.footer{border-top:1px solid var(--line);padding:32px 64px;display:flex;align-items:center;justify-content:space-between}
.fbrand{display:flex;align-items:center;gap:8px;font-family:var(--fd);font-size:17px;color:var(--ink)}
.fcopy{font-size:12px;color:var(--ink4)}

/* ── ANIMATIONS ── */
@keyframes blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.75)}}
@keyframes drift{0%,100%{transform:translateY(0) rotate(0deg)}30%{transform:translateY(-20px) rotate(3deg)}65%{transform:translateY(-8px) rotate(-1.5deg)}}
@keyframes glow{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
@keyframes up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}

.u{opacity:0;animation:up .7s cubic-bezier(.16,1,.3,1) forwards}
.u1{animation-delay:.05s}.u2{animation-delay:.15s}.u3{animation-delay:.26s}.u4{animation-delay:.38s}.u5{animation-delay:.52s}

/* ── RESPONSIVE ── */
@media(max-width:900px){
  .hero-wrap{grid-template-columns:1fr;min-height:auto}
  .hero-right{display:none}
  .hero-left{padding:100px 28px 64px}
  .nav{padding:0 24px}
  .nav-links{display:none}
  .steps,.feats,.pgrid{grid-template-columns:1fr}
  .feat{border-right:none}
  .sec{padding:72px 24px}
  .footer{flex-direction:column;gap:8px;text-align:center;padding:28px 24px}
}
`;

export default function Landing() {
  const navigate = useNavigate();
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = document.createElement("style");
    el.id = "lnd";
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.getElementById("lnd")?.remove();
  }, []);

  useEffect(() => {
    const fn = () => setOn(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div>
      {/* NAV */}
      <nav className={`nav${on ? " on" : ""}`}>
        <a className="nav-brand" href="/">
          <img className="nav-logo" src="/logo_green.svg" alt="Ginkgo" />
          <span className="nav-name">ginkgo</span>
        </a>
        <div className="nav-links">
          <a className="nav-link" href="#how-it-works">How it works</a>
          <a className="nav-link" href="#features">Features</a>
          <a className="nav-link" href="#pricing">Pricing</a>
        </div>
        <div className="nav-r">
          <button className="btn-si" onClick={() => navigate("/login")}>Sign in</button>
          <button className="btn-sf" onClick={() => navigate("/register")}>Start free</button>
        </div>
      </nav>

      {/* HERO — TRUE 2-COL */}
      <div className="hero-wrap">
        {/* LEFT: all text content */}
        <div className="hero-left">
          <div className="eyebrow u">
            <span className="eyebrow-dot" />
            Public beta · Free to start
          </div>
          <h1 className="hero-h1 u u1">
            Your docs,<br />
            <em>answered instantly</em>
          </h1>
          <p className="hero-sub u u2">
            Upload a markdown knowledge base. Get a hosted FAQ bot your team or customers
            can query over API — no training, no pipelines, no infrastructure.
          </p>
          <div className="hero-ctas u u3">
            <button className="btn-p" onClick={() => navigate("/register")}>Get started free</button>
            <button className="btn-o" onClick={() => navigate("/login")}>Sign in</button>
          </div>
          <div className="code u u4">
            <div className="cdots">
              <div className="cdot cr2"/><div className="cdot cy2"/><div className="cdot cg2"/>
            </div>
            <div><span className="t-c">// Ask anything from your docs</span></div>
            <div style={{marginTop:10}}>
              <span className="t-k">const </span><span className="t-w">res </span>
              <span className="t-p">= await </span><span className="t-m">fetch</span>
              <span className="t-p">(</span><span className="t-s">'https://api.ginkgo.sh/ask'</span><span className="t-p">, {"{"}</span>
            </div>
            <div style={{paddingLeft:16}}>
              <span className="t-k">method</span><span className="t-p">: </span><span className="t-s">'POST'</span><span className="t-p">,</span>
            </div>
            <div style={{paddingLeft:16}}>
              <span className="t-k">headers</span><span className="t-p">: {"{"}</span><span className="t-s">'X-API-Key'</span><span className="t-p">: </span><span className="t-s">sk_live_••••</span><span className="t-p">{"}"},</span>
            </div>
            <div style={{paddingLeft:16}}>
              <span className="t-k">body</span><span className="t-p">: </span><span className="t-m">JSON.stringify</span><span className="t-p">({"{"}</span>
            </div>
            <div style={{paddingLeft:32}}><span className="t-k">domain_id</span><span className="t-p">: </span><span className="t-s">'my-docs'</span><span className="t-p">,</span></div>
            <div style={{paddingLeft:32}}><span className="t-k">question</span><span className="t-p">: </span><span className="t-s">'How do I reset my password?'</span></div>
            <div style={{paddingLeft:16}}><span className="t-p">{"})"})</span></div>
            <div><span className="t-p">{"});"}</span></div>
            <div style={{marginTop:12}}><span className="t-c">{"// → { answer: \"Go to Settings → Security → Reset\" }"}</span></div>
          </div>
        </div>

        {/* RIGHT: golden leaf only */}
        <div className="hero-right u u5">
          <div className="leaf-box">
            <div className="leaf-glow" />
            <img className="leaf-img" src="/logo_gold.svg" alt="" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="sec" id="how-it-works" style={{background:"#fff",borderTop:"1px solid #E8E8E4"}}>
        <div className="inn">
          <div className="ctr">
            <div className="lbl">Process</div>
            <h2 className="sh2">Up and running in minutes</h2>
            <p className="sub">No ML expertise needed. Write your docs, drop them in, start answering.</p>
          </div>
          <div className="steps">
            {[
              {n:"01",h:"Upload your .md files",  p:"Paste your docs or FAQs into your domain. We chunk and index automatically."},
              {n:"02",h:"Get your API key",        p:"Every domain ships with a unique key. Use it in your app, bot, or website. Rotate any time."},
              {n:"03",h:"Query from anywhere",     p:"POST a question, get a grounded answer with source refs in milliseconds."},
            ].map((s,i)=>(
              <div key={i} className="step">
                <div className="sn">{s.n}</div>
                <div className="sh">{s.h}</div>
                <p className="sp">{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="sec dark-sec" id="features">
        <div className="inn">
          <div className="ctr">
            <div className="lbl">Features</div>
            <h2 className="sh2">Everything you need</h2>
            <p className="sub">Built for developers who want power without complexity.</p>
          </div>
          <div className="feats">
            {FEATS.map(({Icon,h,p},i)=>(
              <div key={i} className="feat">
                <div className="fi"><Icon /></div>
                <div className="fh">{h}</div>
                <p className="fp">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="sec" id="pricing" style={{background:"var(--bg)",borderTop:"1px solid #E8E8E4"}}>
        <div className="inn">
          <div className="ctr">
            <div className="lbl">Pricing</div>
            <h2 className="sh2">Simple, honest pricing</h2>
            <p className="sub">No seats, no surprises. Pay for what you use.</p>
          </div>
          <div className="pgrid">
            {[
              {badge:"Free",       price:"$0",     per:"forever",   hot:false, feats:["1 domain","500 questions / month","500 KB knowledge base","API key access","Community support"],                 cta:"Start free"},
              {badge:"Pro",        price:"$29",    per:"per month", hot:true,  feats:["10 domains","10,000 questions / month","5 MB knowledge base","Origin restrictions","Priority support"],         cta:"Get Pro"},
              {badge:"Enterprise", price:"Custom", per:"contact us",hot:false, feats:["Unlimited domains","Unlimited questions","20 MB knowledge base","SLA guarantee","Dedicated support"],           cta:"Contact us"},
            ].map((p,i)=>(
              <div key={i} className={`pc${p.hot?" hot":""}`}>
                <div className="pb">{p.badge}</div>
                <div className="pp">{p.price}</div>
                <div className="pper">{p.per}</div>
                <div className="pdiv"/>
                <ul className="pfl">
                  {p.feats.map((f,j)=><li key={j}>{f}</li>)}
                </ul>
                <button className="pbtn" onClick={()=>navigate(p.badge==="Enterprise"?"/contact":"/register")}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="fbrand">
          <img src="/logo_green.svg" alt="" style={{width:22,height:22,objectFit:"contain"}}/>
          ginkgo
        </div>
        <div className="fcopy">© {new Date().getFullYear()} Ginkgo · Built for developers</div>
      </footer>
    </div>
  );
}
(function () {
  'use strict';

  const script = document.currentScript || document.querySelector('script[data-domain]');
  if (!script) return;

  const cfg = {
    domain:      script.getAttribute('data-domain')      || '',
    apiKey:      script.getAttribute('data-api-key')     || '',
    apiUrl:      script.getAttribute('data-api-url')     || 'https://faq-saas.onrender.com',
    mode:        script.getAttribute('data-mode')        || 'bubble',
    target:      script.getAttribute('data-target')      || '',
    theme:       script.getAttribute('data-theme')       || 'card',
    color:       script.getAttribute('data-color')       || '#84B179',
    textColor:   script.getAttribute('data-text-color')  || '#ffffff',
    title:       script.getAttribute('data-title')       || 'Ask a question',
    placeholder: script.getAttribute('data-placeholder') || 'Type your question…',
    position:    script.getAttribute('data-position')    || 'right',
  };

  if (!cfg.domain || !cfg.apiKey) {
    console.warn('[ginkgo] data-domain and data-api-key are required.');
    return;
  }

  function hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '132,177,121';
  }
  
  const rgb = hexToRgb(cfg.color);
  const pos  = cfg.position === 'left' ? 'left:0' : 'right:0';
  const posB = cfg.position === 'left' ? 'left:20px' : 'right:20px';

  // ── SVG icons ─────────────────────────────────────────────────
  const svgChat  = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>`;
  const svgClose = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  const svgSend  = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>`;
  const svgBot   = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2zm9 7H3a1 1 0 00-1 1v7a2 2 0 002 2h16a2 2 0 002-2v-7a1 1 0 00-1-1zm-9 9a2 2 0 110-4 2 2 0 010 4zm-4-2a1 1 0 110-2 1 1 0 010 2zm8 0a1 1 0 110-2 1 1 0 010 2z"/></svg>`;
  const svgPen   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;

  // ── Shared CSS ─────────────────────────────────────────────────
  // Added mobile overrides for full-screen experience
  const BASE_CSS = `
    :root {
      --gk-color: ${cfg.color};
      --gk-rgb: ${rgb};
      --gk-text: ${cfg.textColor};
    }
    .gk-wrap *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
    
    /* Scroll Lock for mobile */
    body.gk-noscroll { overflow: hidden; }
    
    /* Messages Area */
    .gk-msgs{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth; padding: 16px 20px;}
    .gk-msgs::-webkit-scrollbar{width:4px}
    .gk-msgs::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:4px}
    .gk-msg{display:flex;flex-direction:column;max-width:90%}
    .gk-msg.u{align-items:flex-end;margin-left:auto}
    .gk-msg.b{align-items:flex-start;margin-right:auto}
    .gk-bub{padding:10px 14px;font-size:14px;line-height:1.6;word-break:break-word;box-shadow: 0 1px 2px rgba(0,0,0,0.05);}
    .gk-msg.u .gk-bub{background:var(--gk-color);color:var(--gk-text);border-radius:18px 18px 4px 18px}
    .gk-msg.b .gk-bub{background:#fff;color:#222;border-radius:18px 18px 18px 4px;border:1px solid #e5e5e5}
    .gk-time{font-size:10px;color:#aaa;margin-top:4px;padding:0 4px;font-weight:500}
    
    /* Typing Indicator */
    .gk-typing{display:flex;gap:5px;padding:12px 16px;background:#fff;border:1px solid #e5e5e5;border-radius:18px;box-shadow:0 1px 2px rgba(0,0,0,.05)}
    .gk-dot{width:6px;height:6px;border-radius:50%;background:var(--gk-color);opacity:0.4;animation:gkB 1.2s ease-in-out infinite}
    .gk-dot:nth-child(2){animation-delay:.15s}
    .gk-dot:nth-child(3){animation-delay:.3s}
    @keyframes gkB{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
    
    /* Suggestions */
    .gk-chips{display:flex;flex-wrap:wrap;gap:6px;padding:4px 0 8px}
    .gk-chip{padding:6px 12px;border-radius:16px;border:1px solid rgba(var(--gk-rgb),.25);background:rgba(var(--gk-rgb),.06);color:var(--gk-color);font-size:12px;font-weight:500;cursor:pointer;transition:all .2s;font-family:inherit}
    .gk-chip:hover{background:rgba(var(--gk-rgb),.15);transform:translateY(-1px)}
    .gk-chip:disabled{opacity:.4;cursor:not-allowed}
    
    /* Welcome Screen */
    .gk-welcome{text-align:center;padding:30px 20px;color:#888;display:flex;flex-direction:column;align-items:center;gap:8px;justify-content:center;height:100%}
    .gk-welcome-icon{width:48px;height:48px;border-radius:50%;background:rgba(var(--gk-rgb),.1);display:flex;align-items:center;justify-content:center;color:var(--gk-color);margin-bottom:8px}
    .gk-welcome-icon svg{width:24px;height:24px}
    .gk-welcome p{font-size:14px;line-height:1.5;max-width:220px}
    
    /* Branding */
    .gk-brand{text-align:center;font-size:10px;color:#bbb;padding:6px 0 8px;flex-shrink:0;background:inherit}
    .gk-brand a{color:inherit;text-decoration:none;transition:color 0.2s}
    .gk-brand a:hover { color: #888; }

    /* Animations */
    @keyframes gkSlideUp{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
    
    /* ── RESPONSIVE MOBILE STYLES ── */
    @media (max-width: 480px) {
      .gk-panel {
        position: fixed !important;
        top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
        width: 100% !important; height: 100% !important; max-height: 100% !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        transform: translateY(100%) !important; /* Slide from bottom */
        transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) !important;
      }
      .gk-panel.open {
        transform: translateY(0) !important;
        opacity: 1 !important;
      }
      .gk-header {
        padding-top: max(14px, env(safe-area-inset-top)) !important;
      }
      .gk-footer {
        padding-bottom: max(10px, env(safe-area-inset-bottom)) !important;
      }
      /* Hide bubble completely when open on mobile */
      .gk-bubble.open { display: none !important; }
      
      /* Ensure input is usable */
      .gk-input { font-size: 16px; } /* Prevents iOS zoom */
    }
  `;

  // ══════════════════════════════════════════════════════════════
  // THEME DEFINITIONS
  // ══════════════════════════════════════════════════════════════

  const THEMES = {

    // ── CARD (Default) ───────────────────────────────────────────
    card: {
      bubbleCSS: `
        .gk-bubble{position:fixed;${posB};bottom:20px;z-index:99999;
          width:56px;height:56px;border-radius:50%;background:var(--gk-color);
          border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
          box-shadow:0 6px 24px rgba(var(--gk-rgb),.4);transition:transform .2s,box-shadow .2s,color:var(--gk-text)}
        .gk-bubble svg{width:24px;height:24px;transition:transform .3s cubic-bezier(0.34, 1.56, 0.64, 1)}
        .gk-bubble:hover{transform:scale(1.08);box-shadow:0 8px 32px rgba(var(--gk-rgb),.5)}
        .gk-bubble.open .icon-chat{display:none}
        .gk-bubble .icon-close{display:none}
        .gk-bubble.open .icon-close{display:flex}`,
      panelCSS: `
        .gk-panel{position:fixed;${pos};bottom:90px;z-index:99998;width:370px;
          background:#f7f8fa;border-radius:20px;
          box-shadow:0 10px 50px rgba(0,0,0,.12),0 0 0 1px rgba(0,0,0,.04);
          display:flex;flex-direction:column;overflow:hidden;max-height:580px;
          transform:scale(.95) translateY(10px);opacity:0;pointer-events:none;
          transition:transform .25s cubic-bezier(0.34, 1.56, 0.64, 1),opacity .2s}
        .gk-panel.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all}
        .gk-header{background:var(--gk-color);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;min-height:60px}
        .gk-avatar{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;color:var(--gk-text);margin-right:12px;flex-shrink:0}
        .gk-avatar svg{width:18px;height:18px}
        .gk-htitle{font-size:15px;font-weight:600;color:var(--gk-text);line-height:1.2}
        .gk-honline{font-size:11px;color:rgba(255,255,255,.7);margin-top:2px}
        .gk-hclose{background:rgba(255,255,255,.15);border:none;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--gk-text);flex-shrink:0;transition:background .15s}
        .gk-hclose:hover{background:rgba(255,255,255,.25)}
        .gk-hclose svg{width:14px;height:14px}
        .gk-msgs{background:0;padding-bottom:10px}
        .gk-footer{padding:12px 16px;border-top:1px solid rgba(0,0,0,.05);background:#fff;display:flex;gap:10px;align-items:center;flex-shrink:0}
        .gk-input{flex:1;border:1px solid #e0e0e0;border-radius:22px;padding:10px 16px;font-size:14px;outline:none;color:#222;background:#fff;transition:border-color .2s,box-shadow .2s}
        .gk-input:focus{border-color:var(--gk-color);box-shadow:0 0 0 3px rgba(var(--gk-rgb),.1)}
        .gk-input::placeholder{color:#999}
        .gk-send{width:40px;height:40px;border-radius:50%;border:none;background:var(--gk-color);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--gk-text);transition:background .15s,transform .1s;flex-shrink:0}
        .gk-send:hover{opacity:.9;transform:scale(1.05)}
        .gk-send:disabled{opacity:.35;cursor:not-allowed;transform:none}
        .gk-send svg{width:16px;height:16px}`,
      buildBubble: () => `<button class="gk-bubble" aria-label="Open chat">
        <span class="icon-chat" style="display:flex">${svgChat}</span>
        <span class="icon-close" style="display:flex">${svgClose}</span>
      </button>`,
      buildPanel: () => `<div class="gk-panel gk-wrap">
        <div class="gk-header">
          <div style="display:flex;align-items:center">
            <div class="gk-avatar">${svgBot}</div>
            <div><div class="gk-htitle">${cfg.title}</div><div class="gk-honline">● Online</div></div>
          </div>
          <button class="gk-hclose">${svgClose}</button>
        </div>
        <div class="gk-msgs"><div class="gk-welcome"><div class="gk-welcome-icon">${svgBot}</div><p>Hi there! How can I help you today?</p></div></div>
        <div class="gk-footer">
          <input class="gk-input" type="text" placeholder="${cfg.placeholder}" autocomplete="off"/>
          <button class="gk-send" disabled>${svgSend}</button>
        </div>
        <div class="gk-brand"><a href="https://ginkgo.sh" target="_blank">Powered by ginkgo</a></div>
      </div>`,
    },

    // ── MINIMAL ─────────────────────────────────────────────────
    minimal: {
      bubbleCSS: `
        .gk-bubble{position:fixed;${posB};bottom:20px;z-index:99999;
          display:flex;align-items:center;gap:8px;
          background:#fff;border:1px solid #e5e5e5;
          border-radius:30px;padding:10px 18px 10px 14px;
          cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.08);
          transition:box-shadow .2s,transform .2s,color:#333;font-family:inherit}
        .gk-bubble:hover{box-shadow:0 8px 24px rgba(0,0,0,.12);transform:translateY(-2px)}
        .gk-bubble .bbl-dot{width:8px;height:8px;border-radius:50%;background:var(--gk-color);flex-shrink:0}
        .gk-bubble .bbl-text{font-size:14px;font-weight:500;white-space:nowrap}
        .gk-bubble .bbl-close{display:none;font-size:18px;line-height:1;color:#999}
        .gk-bubble.open .bbl-dot{display:none}
        .gk-bubble.open .bbl-text{display:none}
        .gk-bubble.open .bbl-close{display:block}`,
      panelCSS: `
        .gk-panel{position:fixed;${pos};bottom:80px;z-index:99998;width:340px;
          background:#fff;border-radius:16px;
          box-shadow:0 8px 32px rgba(0,0,0,.1);
          display:flex;flex-direction:column;overflow:hidden;max-height:500px;
          transform:translateY(10px) scale(.98);opacity:0;pointer-events:none;
          transition:transform .25s cubic-bezier(0.34, 1.56, 0.64, 1),opacity .2s}
        .gk-panel.open{transform:translateY(0) scale(1);opacity:1;pointer-events:all}
        .gk-msgs{padding:16px;background:#fafafa}
        .gk-msg.b .gk-bub{background:#f0f0ee;border-radius:18px 18px 18px 4px;color:#1a1a18;font-size:14px}
        .gk-typing .gk-dot{background:#ccc}
        .gk-footer{padding:12px;border-top:1px solid #f0f0f0;background:#fff;display:flex;gap:8px;align-items:center;flex-shrink:0}
        .gk-input{flex:1;border:none;outline:none;padding:8px 12px;font-size:14px;color:#111;background:transparent}
        .gk-input::placeholder{color:#ccc}
        .gk-send{width:32px;height:32px;border-radius:8px;border:none;background:var(--gk-color);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--gk-text);flex-shrink:0;transition:opacity .15s}
        .gk-send:hover{opacity:.85}
        .gk-send:disabled{opacity:.35;cursor:not-allowed}
        .gk-send svg{width:14px;height:14px}`,
      buildBubble: () => `<button class="gk-bubble" aria-label="Open chat">
        <span class="bbl-dot"></span>
        <span class="bbl-text">${cfg.title}</span>
        <span class="bbl-close">×</span>
      </button>`,
      buildPanel: () => `<div class="gk-panel gk-wrap">
        <div class="gk-msgs"><div class="gk-welcome" style="padding:14px 12px"><p style="font-size:13px">Ask me anything — I'll answer from our docs.</p></div></div>
        <div class="gk-footer">
          <input class="gk-input" type="text" placeholder="${cfg.placeholder}" autocomplete="off"/>
          <button class="gk-send" disabled>${svgSend}</button>
        </div>
        <div class="gk-brand" style="padding-bottom:6px"><a href="https://ginkgo.sh" target="_blank">ginkgo</a></div>
      </div>`,
    },

    // ── SIDEBAR ─────────────────────────────────────────────────
    sidebar: {
      bubbleCSS: `
        .gk-bubble{position:fixed;${posB};bottom:32px;z-index:99999;
          display:flex;flex-direction:column;align-items:center;gap:4px;
          background:var(--gk-color);border:none;border-radius:12px 12px 0 0;
          padding:14px 10px 10px;cursor:pointer;
          box-shadow:-4px 0 24px rgba(var(--gk-rgb),.3);
          transition:padding .2s,opacity .2s;color:var(--gk-text);
          writing-mode:vertical-rl;
          ${cfg.position==='left'?'border-radius:0 12px 12px 0;box-shadow:4px 0 24px rgba('+rgb+',.3)':''}}
        .gk-bubble svg{width:18px;height:18px;writing-mode:horizontal-tb}
        .gk-bubble .bbl-label{font-size:11px;font-weight:600;letter-spacing:.05em;writing-mode:vertical-rl;color:var(--gk-text);margin-top:6px;white-space:nowrap}
        .gk-bubble.open{opacity:0;pointer-events:none}`,
      panelCSS: `
        .gk-panel{position:fixed;${cfg.position==='left'?'left:0':'right:0'};top:0;bottom:0;z-index:99998;
          width:380px;background:#fff;
          box-shadow:${cfg.position==='left'?'8px':'-8px'} 0 32px rgba(0,0,0,.15);
          display:flex;flex-direction:column;overflow:hidden;
          transform:translateX(${cfg.position==='left'?'-100%':'100%'});opacity:1;pointer-events:none;
          transition:transform .3s cubic-bezier(0.4, 0.0, 0.2, 1)}
        .gk-panel.open{transform:translateX(0);opacity:1;pointer-events:all}
        .gk-header{background:var(--gk-color);padding:20px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
        .gk-avatar{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;color:var(--gk-text);margin-right:12px;flex-shrink:0}
        .gk-avatar svg{width:18px;height:18px}
        .gk-htitle{font-size:16px;font-weight:700;color:var(--gk-text)}
        .gk-honline{font-size:11px;color:rgba(255,255,255,.65);margin-top:2px}
        .gk-hclose{background:rgba(255,255,255,.15);border:none;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--gk-text);flex-shrink:0;transition:background .15s}
        .gk-hclose svg{width:14px;height:14px}
        .gk-hclose:hover{background:rgba(255,255,255,.28)}
        .gk-msgs{flex:1;background:#fafafa}
        .gk-msg.b .gk-bub{background:#fff;border:1px solid #ebebeb;border-radius:18px 18px 18px 4px;color:#1a1a18;box-shadow:0 1px 2px rgba(0,0,0,.04)}
        .gk-typing .gk-dot{background:rgba(var(--gk-rgb),.4)}
        .gk-footer{padding:14px;border-top:1px solid #eee;background:#fff;display:flex;gap:10px;align-items:center;flex-shrink:0}
        .gk-input{flex:1;border:1px solid #e0e0e0;border-radius:22px;padding:10px 16px;font-size:14px;outline:none;color:#111;background:#f8f8f8;transition:border-color .15s,background .15s}
        .gk-input:focus{border-color:var(--gk-color);background:#fff}
        .gk-input::placeholder{color:#bbb}
        .gk-send{width:38px;height:38px;border-radius:50%;border:none;background:var(--gk-color);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--gk-text);flex-shrink:0;transition:opacity .15s,transform .12s}
        .gk-send:hover{opacity:.88;transform:scale(1.05)}
        .gk-send:disabled{opacity:.35;cursor:not-allowed;transform:none}
        .gk-send svg{width:16px;height:16px}
        /* Overlay */
        .gk-overlay{position:fixed;inset:0;background:rgba(0,0,0,.25);z-index:99997;opacity:0;pointer-events:none;transition:opacity .25s}
        .gk-overlay.open{opacity:1;pointer-events:all}`,
      buildBubble: () => `<button class="gk-bubble" aria-label="Open chat">
        ${svgPen}
        <span class="bbl-label">${cfg.title}</span>
      </button>`,
      buildPanel: () => `
        <div class="gk-overlay"></div>
        <div class="gk-panel gk-wrap">
          <div class="gk-header">
            <div style="display:flex;align-items:center">
              <div class="gk-avatar">${svgBot}</div>
              <div><div class="gk-htitle">${cfg.title}</div><div class="gk-honline">● Online</div></div>
            </div>
            <button class="gk-hclose">${svgClose}</button>
          </div>
          <div class="gk-msgs"><div class="gk-welcome"><div class="gk-welcome-icon">${svgBot}</div><p>Hi there! Ask me anything.</p></div></div>
          <div class="gk-footer">
            <input class="gk-input" type="text" placeholder="${cfg.placeholder}" autocomplete="off"/>
            <button class="gk-send" disabled>${svgSend}</button>
          </div>
          <div class="gk-brand"><a href="https://ginkgo.sh" target="_blank">Powered by ginkgo</a></div>
        </div>`,
    },
  };

  // ── Inject CSS ─────────────────────────────────────────────────
  const theme = THEMES[cfg.theme] || THEMES.card;
  const style = document.createElement('style');
  style.textContent = BASE_CSS + theme.bubbleCSS + theme.panelCSS;
  document.head.appendChild(style);

  // ── State ──────────────────────────────────────────────────────
  let isOpen    = false;
  let isLoading = false;
  let history   = [];
  let panel, msgs, input, sendBtn, bubbleEl, overlay;

  function ts() {
    return new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  }

  // ── Mount ──────────────────────────────────────────────────────
  function mount() {
    const wrap = document.createElement('div');

    if (cfg.mode === 'inline') {
      const target = cfg.target ? document.querySelector(cfg.target) : null;
      if (!target) { console.warn('[ginkgo] data-target not found'); return; }

      const t = THEMES.card;
      wrap.innerHTML = t.buildPanel().replace('gk-panel', 'gk-inline gk-panel open');
      target.appendChild(wrap);
      panel   = wrap.querySelector('.gk-panel');
      msgs    = wrap.querySelector('.gk-msgs');
      input   = wrap.querySelector('.gk-input');
      sendBtn = wrap.querySelector('.gk-send');
    } else {
      wrap.innerHTML = theme.buildBubble() + theme.buildPanel();
      document.body.appendChild(wrap);
      bubbleEl = wrap.querySelector('.gk-bubble');
      panel    = wrap.querySelector('.gk-panel');
      overlay  = wrap.querySelector('.gk-overlay');
      msgs     = wrap.querySelector('.gk-msgs');
      input    = wrap.querySelector('.gk-input');
      sendBtn  = wrap.querySelector('.gk-send');

      bubbleEl.addEventListener('click', toggle);
      const closeBtn = panel.querySelector('.gk-hclose');
      if (closeBtn) closeBtn.addEventListener('click', toggle);
      if (overlay)  overlay.addEventListener('click', toggle);
    }

    input.addEventListener('input', () => {
      sendBtn.disabled = !input.value.trim() || isLoading;
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    sendBtn.addEventListener('click', send);
  }

  function toggle() {
    isOpen = !isOpen;
    
    // Manage scroll lock for mobile
    if (isOpen) {
      document.body.classList.add('gk-noscroll');
    } else {
      document.body.classList.remove('gk-noscroll');
    }

    panel.classList.toggle('open', isOpen);
    bubbleEl?.classList.toggle('open', isOpen);
    overlay?.classList.toggle('open', isOpen);
    
    if (isOpen) {
      // Delay focus to allow animation to start
      setTimeout(() => input.focus(), 250);
    }
  }

  // ── Messages ───────────────────────────────────────────────────
  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  }

  function appendMsg(role, text, suggestions = []) {
    const welcome = msgs.querySelector('.gk-welcome');
    if (welcome) welcome.remove();

    const div = document.createElement('div');
    div.className = `gk-msg ${role === 'user' ? 'u' : 'b'}`;
    div.innerHTML = `<div class="gk-bub">${escHtml(text)}</div><div class="gk-time">${ts()}</div>`;
    msgs.appendChild(div);

    if (role === 'bot' && suggestions.length > 0) {
      const chips = document.createElement('div');
      chips.className = 'gk-chips';
      suggestions.forEach(s => {
        const btn = document.createElement('button');
        btn.className   = 'gk-chip';
        btn.textContent = s;
        btn.addEventListener('click', () => { chips.remove(); input.value = s; send(); });
        chips.appendChild(btn);
      });
      msgs.appendChild(chips);
    }

    msgs.scrollTop = msgs.scrollHeight;
  }

  function appendTyping() {
    const welcome = msgs.querySelector('.gk-welcome');
    if (welcome) welcome.remove();
    const div = document.createElement('div');
    div.className = 'gk-msg b';
    div.innerHTML = `<div class="gk-bub gk-typing"><div class="gk-dot"></div><div class="gk-dot"></div><div class="gk-dot"></div></div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  // ── Send ───────────────────────────────────────────────────────
  async function send() {
    const q = input.value.trim();
    if (!q || isLoading) return;
    input.value     = '';
    sendBtn.disabled = true;
    isLoading        = true;

    appendMsg('user', q);
    history.push({ role: 'user', content: q });
    const typing = appendTyping();

    try {
      const res = await fetch(`${cfg.apiUrl}/ask`, {
        method:  'POST',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': cfg.apiKey },
        body:    JSON.stringify({ domain_id: cfg.domain, question: q, history: history.slice(-6) }),
      });

      typing.remove();

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        appendMsg('bot', err.detail || 'Sorry, something went wrong.');
      } else {
        const data        = await res.json();
        const answer      = data.answer || 'No answer found.';
        const suggestions = data.suggestions || [];
        appendMsg('bot', answer, suggestions);
        history.push({ role: 'assistant', content: answer });
      }
    } catch {
      typing.remove();
      appendMsg('bot', 'Connection error. Please try again.');
    } finally {
      isLoading        = false;
      sendBtn.disabled = !input.value.trim();
      input.focus();
    }
  }

  // ── Init ───────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

})();
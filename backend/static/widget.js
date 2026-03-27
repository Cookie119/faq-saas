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
  const pos  = cfg.position === 'left' ? 'left:24px' : 'right:24px';
  const posB = cfg.position === 'left' ? 'left:24px' : 'right:24px';

  // ── SVG icons ─────────────────────────────────────────────────
  const svgChat  = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>`;
  const svgClose = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  const svgSend  = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>`;
  const svgBot   = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2zm9 7H3a1 1 0 00-1 1v7a2 2 0 002 2h16a2 2 0 002-2v-7a1 1 0 00-1-1zm-9 9a2 2 0 110-4 2 2 0 010 4zm-4-2a1 1 0 110-2 1 1 0 010 2zm8 0a1 1 0 110-2 1 1 0 010 2z"/></svg>`;
  const svgPen   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;

  // ── Shared CSS ─────────────────────────────────────────────────
  const BASE_CSS = `
    .gk-wrap*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    .gk-msgs{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
    .gk-msgs::-webkit-scrollbar{width:3px}
    .gk-msgs::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:2px}
    .gk-msg{display:flex;flex-direction:column}
    .gk-msg.u{align-items:flex-end}
    .gk-msg.b{align-items:flex-start}
    .gk-bub{padding:9px 13px;font-size:13.5px;line-height:1.55;word-break:break-word;max-width:82%}
    .gk-msg.u .gk-bub{background:${cfg.color};color:${cfg.textColor};border-radius:14px 14px 2px 14px}
    .gk-time{font-size:10px;color:#aaa;margin-top:3px;padding:0 2px}
    .gk-typing{display:flex;gap:4px;padding:10px 13px}
    .gk-dot{width:7px;height:7px;border-radius:50%;animation:gkB 1.2s ease-in-out infinite}
    .gk-dot:nth-child(2){animation-delay:.2s}
    .gk-dot:nth-child(3){animation-delay:.4s}
    @keyframes gkB{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
    .gk-chips{display:flex;flex-wrap:wrap;gap:5px;padding:4px 0 2px}
    .gk-chip{padding:5px 11px;border-radius:14px;border:1px solid rgba(${rgb},.3);background:rgba(${rgb},.08);color:${cfg.color};font-size:12px;font-weight:500;cursor:pointer;transition:all .15s;font-family:inherit}
    .gk-chip:hover{background:rgba(${rgb},.18)}
    .gk-chip:disabled{opacity:.4;cursor:not-allowed}
    .gk-welcome{text-align:center;padding:20px 16px;color:#888;display:flex;flex-direction:column;align-items:center;gap:6px}
    .gk-welcome-icon{width:38px;height:38px;border-radius:50%;background:rgba(${rgb},.1);display:flex;align-items:center;justify-content:center;color:${cfg.color};margin-bottom:4px}
    .gk-welcome-icon svg{width:18px;height:18px}
    .gk-welcome p{font-size:13px;line-height:1.5;max-width:200px}
    .gk-brand{text-align:center;font-size:10px;color:#bbb;padding:4px 0 6px;flex-shrink:0}
    .gk-brand a{color:#bbb;text-decoration:none}
    @keyframes gkSlideUp{from{opacity:0;transform:translateY(12px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes gkSlideIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
    @media(max-width:480px){.gk-panel{width:calc(100vw - 20px)!important;${cfg.position==='left'?'left:10px':'right:10px'}!important}}
  `;

  // ══════════════════════════════════════════════════════════════
  // THEME DEFINITIONS
  // ══════════════════════════════════════════════════════════════

  const THEMES = {

    // ── CARD ────────────────────────────────────────────────────
    card: {
      bubbleCSS: `
        .gk-bubble{position:fixed;${posB};bottom:24px;z-index:99999;
          width:52px;height:52px;border-radius:50%;background:${cfg.color};
          border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 20px rgba(${rgb},.4);transition:transform .2s,box-shadow .2s;color:${cfg.textColor}}
        .gk-bubble svg{width:22px;height:22px;transition:transform .25s}
        .gk-bubble:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(${rgb},.55)}
        .gk-bubble.open .icon-chat{display:none}
        .gk-bubble .icon-close{display:none}
        .gk-bubble.open .icon-close{display:flex}`,
      panelCSS: `
        .gk-panel{position:fixed;${pos};bottom:88px;z-index:99998;width:340px;
          background:#fff;border-radius:16px;
          box-shadow:0 8px 48px rgba(0,0,0,.14),0 1px 4px rgba(0,0,0,.06);
          display:flex;flex-direction:column;overflow:hidden;max-height:480px;
          transform:scale(.92) translateY(12px);opacity:0;pointer-events:none;
          transition:transform .22s cubic-bezier(.34,1.56,.64,1),opacity .18s}
        .gk-panel.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all}
        .gk-header{background:${cfg.color};padding:14px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
        .gk-avatar{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;color:${cfg.textColor};margin-right:10px;flex-shrink:0}
        .gk-avatar svg{width:16px;height:16px}
        .gk-htitle{font-size:14px;font-weight:600;color:${cfg.textColor}}
        .gk-honline{font-size:11px;color:rgba(255,255,255,.7);margin-top:1px}
        .gk-hclose{background:rgba(255,255,255,.15);border:none;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:${cfg.textColor};flex-shrink:0}
        .gk-hclose svg{width:13px;height:13px}
        .gk-hclose:hover{background:rgba(255,255,255,.28)}
        .gk-msgs{background:#f8f9f8;padding:14px}
        .gk-msg.b .gk-bub{background:#fff;border:1px solid #e8ebe8;border-radius:14px 14px 14px 2px;color:#1a1a18;box-shadow:0 1px 3px rgba(0,0,0,.04)}
        .gk-typing .gk-dot{background:rgba(${rgb},.45)}
        .gk-footer{padding:10px 12px;border-top:1px solid #eee;background:#fff;display:flex;gap:8px;align-items:center;flex-shrink:0}
        .gk-input{flex:1;border:1px solid #ddd;border-radius:20px;padding:8px 14px;font-size:13.5px;outline:none;color:#111;background:#f8f8f6;transition:border-color .15s}
        .gk-input:focus{border-color:${cfg.color};background:#fff}
        .gk-input::placeholder{color:#bbb}
        .gk-send{width:34px;height:34px;border-radius:50%;border:none;background:${cfg.color};cursor:pointer;display:flex;align-items:center;justify-content:center;color:${cfg.textColor};transition:background .15s,transform .12s;flex-shrink:0}
        .gk-send:hover{opacity:.88;transform:scale(1.05)}
        .gk-send:disabled{opacity:.4;cursor:not-allowed;transform:none}
        .gk-send svg{width:15px;height:15px}`,
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
        <div class="gk-msgs"><div class="gk-welcome"><div class="gk-welcome-icon">${svgBot}</div><p>Hi there! Ask me anything from our docs.</p></div></div>
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
        .gk-bubble{position:fixed;${posB};bottom:24px;z-index:99999;
          display:flex;align-items:center;gap:8px;
          background:#fff;border:1px solid #e0e0e0;
          border-radius:28px;padding:10px 18px 10px 14px;
          cursor:pointer;box-shadow:0 2px 16px rgba(0,0,0,.1);
          transition:box-shadow .2s,transform .2s;color:#333;font-family:inherit}
        .gk-bubble:hover{box-shadow:0 4px 24px rgba(0,0,0,.15);transform:translateY(-1px)}
        .gk-bubble .bbl-dot{width:8px;height:8px;border-radius:50%;background:${cfg.color};flex-shrink:0}
        .gk-bubble .bbl-text{font-size:13.5px;font-weight:500;white-space:nowrap}
        .gk-bubble .bbl-close{display:none;font-size:16px;line-height:1;color:#999}
        .gk-bubble.open .bbl-dot{display:none}
        .gk-bubble.open .bbl-text{display:none}
        .gk-bubble.open .bbl-close{display:block}`,
      panelCSS: `
        .gk-panel{position:fixed;${pos};bottom:76px;z-index:99998;width:320px;
          background:#fff;border-radius:12px;
          box-shadow:0 4px 32px rgba(0,0,0,.12);
          display:flex;flex-direction:column;overflow:hidden;max-height:420px;
          transform:translateY(10px);opacity:0;pointer-events:none;
          transition:transform .2s ease,opacity .15s}
        .gk-panel.open{transform:translateY(0);opacity:1;pointer-events:all}
        .gk-msgs{padding:16px;background:#fafafa}
        .gk-msg.b .gk-bub{background:#f0f0ee;border-radius:12px 12px 12px 2px;color:#1a1a18;font-size:13px}
        .gk-typing .gk-dot{background:#ccc}
        .gk-footer{padding:8px 10px;border-top:1px solid #f0f0f0;background:#fff;display:flex;gap:6px;align-items:center;flex-shrink:0}
        .gk-input{flex:1;border:none;outline:none;padding:7px 10px;font-size:13px;color:#111;background:transparent}
        .gk-input::placeholder{color:#ccc}
        .gk-send{width:30px;height:30px;border-radius:8px;border:none;background:${cfg.color};cursor:pointer;display:flex;align-items:center;justify-content:center;color:${cfg.textColor};flex-shrink:0;transition:opacity .15s}
        .gk-send:hover{opacity:.85}
        .gk-send:disabled{opacity:.35;cursor:not-allowed}
        .gk-send svg{width:13px;height:13px}`,
      buildBubble: () => `<button class="gk-bubble" aria-label="Open chat">
        <span class="bbl-dot"></span>
        <span class="bbl-text">${cfg.title}</span>
        <span class="bbl-close">×</span>
      </button>`,
      buildPanel: () => `<div class="gk-panel gk-wrap">
        <div class="gk-msgs"><div class="gk-welcome" style="padding:14px 12px"><p style="font-size:12.5px">Ask me anything — I'll answer from our docs.</p></div></div>
        <div class="gk-footer">
          <input class="gk-input" type="text" placeholder="${cfg.placeholder}" autocomplete="off"/>
          <button class="gk-send" disabled>${svgSend}</button>
        </div>
        <div class="gk-brand" style="padding-bottom:4px"><a href="https://ginkgo.sh" target="_blank">ginkgo</a></div>
      </div>`,
    },

    // ── BRANDED ─────────────────────────────────────────────────
    branded: {
      bubbleCSS: `
        .gk-bubble{position:fixed;${posB};bottom:24px;z-index:99999;
          width:56px;height:56px;border-radius:18px;background:${cfg.color};
          border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
          box-shadow:0 6px 24px rgba(${rgb},.5);transition:transform .2s,box-shadow .2s,border-radius .2s;color:${cfg.textColor}}
        .gk-bubble svg{width:24px;height:24px}
        .gk-bubble:hover{transform:scale(1.06) translateY(-2px);box-shadow:0 10px 32px rgba(${rgb},.6);border-radius:20px}
        .gk-bubble.open{border-radius:12px}
        .gk-bubble.open .icon-chat{display:none}
        .gk-bubble .icon-close{display:none}
        .gk-bubble.open .icon-close{display:flex}`,
      panelCSS: `
        .gk-panel{position:fixed;${pos};bottom:94px;z-index:99998;width:340px;
          background:${cfg.color};border-radius:18px;
          box-shadow:0 12px 56px rgba(${rgb},.35);
          display:flex;flex-direction:column;overflow:hidden;max-height:500px;
          transform:scale(.9) translateY(16px);opacity:0;pointer-events:none;
          transition:transform .25s cubic-bezier(.34,1.56,.64,1),opacity .18s}
        .gk-panel.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all}
        .gk-header{padding:16px 18px 12px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
        .gk-htitle{font-size:15px;font-weight:700;color:${cfg.textColor}}
        .gk-honline{font-size:11px;color:rgba(255,255,255,.6);margin-top:1px}
        .gk-hclose{background:rgba(255,255,255,.15);border:none;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:${cfg.textColor}}
        .gk-hclose svg{width:13px;height:13px}
        .gk-hclose:hover{background:rgba(255,255,255,.25)}
        .gk-msgs{background:rgba(0,0,0,.18);margin:0 10px;border-radius:12px;padding:14px;margin-bottom:10px}
        .gk-msg.b .gk-bub{background:rgba(255,255,255,.15);border-radius:12px 12px 12px 2px;color:${cfg.textColor};backdrop-filter:blur(4px)}
        .gk-msg.u .gk-bub{background:rgba(255,255,255,.25);color:${cfg.textColor};border-radius:14px 14px 2px 14px}
        .gk-time{color:rgba(255,255,255,.4)}
        .gk-typing .gk-dot{background:rgba(255,255,255,.4)}
        .gk-welcome p{color:rgba(255,255,255,.7)}
        .gk-welcome-icon{background:rgba(255,255,255,.15);color:${cfg.textColor}}
        .gk-chip{border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.1);color:${cfg.textColor}}
        .gk-chip:hover{background:rgba(255,255,255,.22)}
        .gk-footer{padding:0 10px 10px;display:flex;gap:8px;align-items:center;flex-shrink:0}
        .gk-input{flex:1;border:none;border-radius:22px;padding:10px 16px;font-size:13.5px;outline:none;color:#111;background:rgba(255,255,255,.92)}
        .gk-input::placeholder{color:#aaa}
        .gk-send{width:36px;height:36px;border-radius:50%;border:none;background:rgba(255,255,255,.25);cursor:pointer;display:flex;align-items:center;justify-content:center;color:${cfg.textColor};flex-shrink:0;transition:background .15s}
        .gk-send:hover{background:rgba(255,255,255,.38)}
        .gk-send:disabled{opacity:.35;cursor:not-allowed}
        .gk-send svg{width:15px;height:15px}
        .gk-brand a{color:rgba(255,255,255,.4)}`,
      buildBubble: () => `<button class="gk-bubble" aria-label="Open chat">
        <span class="icon-chat" style="display:flex">${svgChat}</span>
        <span class="icon-close" style="display:flex">${svgClose}</span>
      </button>`,
      buildPanel: () => `<div class="gk-panel gk-wrap">
        <div class="gk-header">
          <div>
            <div class="gk-htitle">${cfg.title}</div>
            <div class="gk-honline">● Online now</div>
          </div>
          <button class="gk-hclose">${svgClose}</button>
        </div>
        <div class="gk-msgs"><div class="gk-welcome"><div class="gk-welcome-icon">${svgBot}</div><p>Hi! Ask me anything and I'll find the answer.</p></div></div>
        <div class="gk-footer">
          <input class="gk-input" type="text" placeholder="${cfg.placeholder}" autocomplete="off"/>
          <button class="gk-send" disabled>${svgSend}</button>
        </div>
        <div class="gk-brand"><a href="https://ginkgo.sh" target="_blank">Powered by ginkgo</a></div>
      </div>`,
    },

    // ── SIDEBAR ─────────────────────────────────────────────────
    sidebar: {
      bubbleCSS: `
        .gk-bubble{position:fixed;${posB};bottom:32px;z-index:99999;
          display:flex;flex-direction:column;align-items:center;gap:4px;
          background:${cfg.color};border:none;border-radius:12px 12px 0 0;
          padding:12px 10px 8px;cursor:pointer;
          box-shadow:-4px 0 24px rgba(${rgb},.3);
          transition:padding .2s,opacity .2s;color:${cfg.textColor};
          writing-mode:vertical-rl;
          ${cfg.position==='left'?'border-radius:0 12px 12px 0;box-shadow:4px 0 24px rgba('+rgb+',.3)':''}}
        .gk-bubble svg{width:18px;height:18px;writing-mode:horizontal-tb}
        .gk-bubble .bbl-label{font-size:11px;font-weight:600;letter-spacing:.05em;writing-mode:vertical-rl;color:${cfg.textColor};margin-top:6px;white-space:nowrap}
        .gk-bubble.open{opacity:0;pointer-events:none}`,
      panelCSS: `
        .gk-panel{position:fixed;${cfg.position==='left'?'left:0':'right:0'};top:0;bottom:0;z-index:99998;
          width:360px;background:#fff;
          box-shadow:${cfg.position==='left'?'4px':'- 4px'} 0 48px rgba(0,0,0,.15);
          display:flex;flex-direction:column;overflow:hidden;
          transform:translateX(${cfg.position==='left'?'-100%':'100%'});opacity:0;pointer-events:none;
          transition:transform .28s cubic-bezier(.4,0,.2,1),opacity .2s}
        .gk-panel.open{transform:translateX(0);opacity:1;pointer-events:all}
        .gk-header{background:${cfg.color};padding:20px 18px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
        .gk-avatar{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;color:${cfg.textColor};margin-right:12px;flex-shrink:0}
        .gk-avatar svg{width:18px;height:18px}
        .gk-htitle{font-size:15px;font-weight:700;color:${cfg.textColor}}
        .gk-honline{font-size:11px;color:rgba(255,255,255,.65);margin-top:2px}
        .gk-hclose{background:rgba(255,255,255,.15);border:none;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:${cfg.textColor};flex-shrink:0;transition:background .15s}
        .gk-hclose svg{width:14px;height:14px}
        .gk-hclose:hover{background:rgba(255,255,255,.28)}
        .gk-msgs{flex:1;padding:20px 16px;background:#fafafa;overflow-y:auto}
        .gk-msg.b .gk-bub{background:#fff;border:1px solid #ebebeb;border-radius:14px 14px 14px 2px;color:#1a1a18;box-shadow:0 1px 2px rgba(0,0,0,.04)}
        .gk-typing .gk-dot{background:rgba(${rgb},.4)}
        .gk-footer{padding:12px 14px;border-top:1px solid #eee;background:#fff;display:flex;gap:10px;align-items:center;flex-shrink:0}
        .gk-input{flex:1;border:1px solid #e0e0e0;border-radius:22px;padding:10px 16px;font-size:13.5px;outline:none;color:#111;background:#f8f8f8;transition:border-color .15s,background .15s}
        .gk-input:focus{border-color:${cfg.color};background:#fff}
        .gk-input::placeholder{color:#bbb}
        .gk-send{width:38px;height:38px;border-radius:50%;border:none;background:${cfg.color};cursor:pointer;display:flex;align-items:center;justify-content:center;color:${cfg.textColor};flex-shrink:0;transition:opacity .15s,transform .12s}
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
          <div class="gk-msgs"><div class="gk-welcome"><div class="gk-welcome-icon">${svgBot}</div><p>Hi there! Ask me anything and I'll answer from our docs.</p></div></div>
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

      // Inline: build panel directly (card theme only for inline)
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
    panel.classList.toggle('open', isOpen);
    bubbleEl?.classList.toggle('open', isOpen);
    overlay?.classList.toggle('open', isOpen);
    if (isOpen) setTimeout(() => input.focus(), 260);
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
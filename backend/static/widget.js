(function () {
  'use strict';

  // ── Read config from the <script> tag ──────────────────────────
  const script = document.currentScript ||
    document.querySelector('script[data-domain]');

  if (!script) return;

  const cfg = {
    domain:      script.getAttribute('data-domain')      || '',
    apiKey:      script.getAttribute('data-api-key')     || '',
    apiUrl:      script.getAttribute('data-api-url')     || 'https://faq-saas.onrender.com',
    mode:        script.getAttribute('data-mode')        || 'bubble',   // 'bubble' | 'inline'
    target:      script.getAttribute('data-target')      || '',         // CSS selector for inline mode
    color:       script.getAttribute('data-color')       || '#84B179',
    textColor:   script.getAttribute('data-text-color')  || '#ffffff',
    title:       script.getAttribute('data-title')       || 'Ask a question',
    placeholder: script.getAttribute('data-placeholder') || 'Type your question…',
    position:    script.getAttribute('data-position')    || 'right',    // 'right' | 'left'
  };

  if (!cfg.domain || !cfg.apiKey) {
    console.warn('[ginkgo] data-domain and data-api-key are required.');
    return;
  }

  // ── Derived colors ─────────────────────────────────────────────
  function hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '132,177,121';
  }
  const rgb = hexToRgb(cfg.color);

  // ── Inject CSS ─────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    .gk-wrap *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    
    /* BUBBLE TRIGGER */
    .gk-bubble{
      position:fixed;
      ${cfg.position === 'left' ? 'left:24px' : 'right:24px'};
      bottom:24px;z-index:99999;
      width:52px;height:52px;border-radius:50%;
      background:${cfg.color};
      border:none;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 20px rgba(${rgb},.45);
      transition:transform .2s,box-shadow .2s;
    }
    .gk-bubble:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(${rgb},.55)}
    .gk-bubble svg{width:24px;height:24px;fill:${cfg.textColor};transition:transform .3s}
    .gk-bubble.open svg.icon-chat{display:none}
    .gk-bubble.open svg.icon-close{display:block!important}
    .gk-bubble svg.icon-close{display:none}

    /* PANEL (bubble mode) */
    .gk-panel{
      position:fixed;
      ${cfg.position === 'left' ? 'left:24px' : 'right:24px'};
      bottom:88px;z-index:99998;
      width:340px;
      background:#fff;border-radius:16px;
      box-shadow:0 8px 48px rgba(0,0,0,.14),0 1px 4px rgba(0,0,0,.06);
      display:flex;flex-direction:column;
      overflow:hidden;
      transform:scale(.92) translateY(12px);
      opacity:0;pointer-events:none;
      transition:transform .22s cubic-bezier(.34,1.56,.64,1),opacity .18s ease;
      max-height:480px;
    }
    .gk-panel.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all}

    /* INLINE PANEL */
    .gk-inline{
      width:100%;background:#fff;border-radius:12px;
      border:1px solid rgba(${rgb},.2);
      box-shadow:0 2px 16px rgba(0,0,0,.06);
      display:flex;flex-direction:column;overflow:hidden;
      max-height:420px;
    }

    /* HEADER */
    .gk-header{
      background:${cfg.color};
      padding:14px 16px;
      display:flex;align-items:center;justify-content:space-between;
      flex-shrink:0;
    }
    .gk-header-left{display:flex;align-items:center;gap:10px}
    .gk-avatar{
      width:32px;height:32px;border-radius:50%;
      background:rgba(255,255,255,.2);
      display:flex;align-items:center;justify-content:center;
      flex-shrink:0;
    }
    .gk-avatar svg{width:18px;height:18px;fill:${cfg.textColor}}
    .gk-title{font-size:14px;font-weight:600;color:${cfg.textColor};letter-spacing:-.01em}
    .gk-online{font-size:11px;color:rgba(255,255,255,.7);margin-top:1px}
    .gk-close-btn{
      background:rgba(255,255,255,.15);border:none;border-radius:50%;
      width:26px;height:26px;display:flex;align-items:center;justify-content:center;
      cursor:pointer;color:${cfg.textColor};transition:background .15s;
      flex-shrink:0;
    }
    .gk-close-btn:hover{background:rgba(255,255,255,.25)}
    .gk-close-btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2}

    /* MESSAGES */
    .gk-messages{
      flex:1;overflow-y:auto;padding:14px;
      display:flex;flex-direction:column;gap:10px;
      background:#F8F9F8;
      scroll-behavior:smooth;
    }
    .gk-messages::-webkit-scrollbar{width:4px}
    .gk-messages::-webkit-scrollbar-track{background:transparent}
    .gk-messages::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:2px}

    .gk-msg{display:flex;flex-direction:column;max-width:82%}
    .gk-msg.user{align-self:flex-end;align-items:flex-end}
    .gk-msg.bot{align-self:flex-start;align-items:flex-start}

    .gk-bubble-msg{
      padding:9px 13px;border-radius:14px;
      font-size:13.5px;line-height:1.55;word-break:break-word;
    }
    .gk-msg.user .gk-bubble-msg{
      background:${cfg.color};color:${cfg.textColor};
      border-radius:14px 14px 2px 14px;
    }
    .gk-msg.bot .gk-bubble-msg{
      background:#fff;color:#1a1a18;
      border:1px solid #E8EBE8;
      border-radius:14px 14px 14px 2px;
      box-shadow:0 1px 3px rgba(0,0,0,.05);
    }
    .gk-msg-time{font-size:10px;color:#aaa;margin-top:3px;padding:0 2px}

    /* TYPING INDICATOR */
    .gk-typing{display:flex;gap:4px;padding:10px 13px;background:#fff;border:1px solid #E8EBE8;border-radius:14px 14px 14px 2px}
    .gk-dot{width:7px;height:7px;border-radius:50%;background:rgba(${rgb},.5);animation:gkBounce 1.2s ease-in-out infinite}
    .gk-dot:nth-child(2){animation-delay:.2s}
    .gk-dot:nth-child(3){animation-delay:.4s}
    @keyframes gkBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}

    /* WELCOME */
    .gk-welcome{
      text-align:center;padding:20px 16px;color:#777;
      display:flex;flex-direction:column;align-items:center;gap:8px;
    }
    .gk-welcome-icon{
      width:40px;height:40px;border-radius:50%;
      background:rgba(${rgb},.1);
      display:flex;align-items:center;justify-content:center;
      margin-bottom:4px;
    }
    .gk-welcome-icon svg{width:20px;height:20px;fill:${cfg.color}}
    .gk-welcome p{font-size:13px;line-height:1.5;max-width:220px}

    /* INPUT */
    .gk-footer{
      padding:10px 12px;border-top:1px solid #eee;
      background:#fff;display:flex;gap:8px;align-items:center;flex-shrink:0;
    }
    .gk-input{
      flex:1;border:1px solid #ddd;border-radius:20px;
      padding:8px 14px;font-size:13.5px;outline:none;
      color:#111;background:#f8f8f6;transition:border-color .15s,background .15s;
      resize:none;max-height:80px;overflow-y:auto;
    }
    .gk-input:focus{border-color:${cfg.color};background:#fff;box-shadow:0 0 0 3px rgba(${rgb},.1)}
    .gk-input::placeholder{color:#aaa}
    .gk-send{
      width:34px;height:34px;border-radius:50%;border:none;
      background:${cfg.color};cursor:pointer;flex-shrink:0;
      display:flex;align-items:center;justify-content:center;
      transition:background .15s,transform .12s;
    }
    .gk-send:hover{background:rgba(${rgb},.8);transform:scale(1.05)}
    .gk-send:disabled{opacity:.45;cursor:not-allowed;transform:none}
    .gk-send svg{width:16px;height:16px;fill:${cfg.textColor}}

    /* BRANDING */
    .gk-brand{
      text-align:center;padding:5px 0 8px;
      font-size:10px;color:#bbb;letter-spacing:.02em;
    }
    .gk-brand a{color:#bbb;text-decoration:none}
    .gk-brand a:hover{color:#999}

    @media(max-width:420px){
      .gk-panel{width:calc(100vw - 24px);${cfg.position==='left'?'left:12px':'right:12px'};bottom:80px}
    }
  `;
  document.head.appendChild(style);

  // ── SVG icons ──────────────────────────────────────────────────
  const svgChat = `<svg class="icon-chat" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.955 7.955 0 01-4.007-1.076l-.287-.17-2.972.884.884-2.972-.17-.287A7.955 7.955 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/></svg>`;
  const svgClose = `<svg class="icon-close" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  const svgSend  = `<svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>`;
  const svgBot   = `<svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2zm9 7H3a1 1 0 00-1 1v7a2 2 0 002 2h16a2 2 0 002-2v-7a1 1 0 00-1-1zm-9 9a2 2 0 110-4 2 2 0 010 4zm-4-2a1 1 0 110-2 1 1 0 010 2zm8 0a1 1 0 110-2 1 1 0 010 2z"/></svg>`;
  const svgX     = `<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" stroke-width="2.5"/><line x1="6" y1="6" x2="18" y2="18" stroke-width="2.5"/></svg>`;

  // ── Build HTML ─────────────────────────────────────────────────
  function buildPanel(cls) {
    return `
      <div class="${cls} gk-wrap">
        <div class="gk-header">
          <div class="gk-header-left">
            <div class="gk-avatar">${svgBot}</div>
            <div>
              <div class="gk-title">${cfg.title}</div>
              <div class="gk-online">● Online</div>
            </div>
          </div>
          ${cls === 'gk-panel' ? `<button class="gk-close-btn" aria-label="Close">${svgX}</button>` : ''}
        </div>
        <div class="gk-messages">
          <div class="gk-welcome">
            <div class="gk-welcome-icon">${svgBot}</div>
            <p>Hi there! Ask me anything and I'll answer from our docs.</p>
          </div>
        </div>
        <div class="gk-footer">
          <input class="gk-input" type="text" placeholder="${cfg.placeholder}" autocomplete="off" />
          <button class="gk-send" aria-label="Send">${svgSend}</button>
        </div>
        <div class="gk-brand"><a href="https://ginkgo.sh" target="_blank">Powered by ginkgo</a></div>
      </div>`;
  }

  // ── State ──────────────────────────────────────────────────────
  let isOpen    = false;
  let isLoading = false;
  let history   = [];   // [{role, content}]

  function timestamp() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // ── Mount ──────────────────────────────────────────────────────
  let panel, messages, input, sendBtn, bubbleEl;

  function mount() {
    const container = document.createElement('div');

    if (cfg.mode === 'inline') {
      // Inline mode — inject into target element
      const target = cfg.target ? document.querySelector(cfg.target) : null;
      if (!target) { console.warn('[ginkgo] data-target element not found'); return; }
      container.innerHTML = buildPanel('gk-inline');
      target.appendChild(container);
      panel    = container.querySelector('.gk-inline');
      messages = panel.querySelector('.gk-messages');
      input    = panel.querySelector('.gk-input');
      sendBtn  = panel.querySelector('.gk-send');
    } else {
      // Bubble mode
      container.innerHTML = `
        <button class="gk-bubble" aria-label="Open chat">${svgChat}${svgClose}</button>
        ${buildPanel('gk-panel')}
      `;
      document.body.appendChild(container);
      bubbleEl = container.querySelector('.gk-bubble');
      panel    = container.querySelector('.gk-panel');
      messages = panel.querySelector('.gk-messages');
      input    = panel.querySelector('.gk-input');
      sendBtn  = panel.querySelector('.gk-send');

      bubbleEl.addEventListener('click', togglePanel);

      const closeBtn = panel.querySelector('.gk-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', togglePanel);
    }

    // Send handlers
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
  }

  function togglePanel() {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    bubbleEl?.classList.toggle('open', isOpen);
    if (isOpen) setTimeout(() => input.focus(), 220);
  }

  // ── Render a message ──────────────────────────────────────────
  function appendMessage(role, text) {
    // Remove welcome message on first real message
    const welcome = messages.querySelector('.gk-welcome');
    if (welcome) welcome.remove();

    const div = document.createElement('div');
    div.className = `gk-msg ${role}`;
    div.innerHTML = `
      <div class="gk-bubble-msg">${escHtml(text)}</div>
      <div class="gk-msg-time">${timestamp()}</div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function appendTyping() {
    const welcome = messages.querySelector('.gk-welcome');
    if (welcome) welcome.remove();

    const div = document.createElement('div');
    div.className = 'gk-msg bot';
    div.innerHTML = `<div class="gk-typing"><div class="gk-dot"></div><div class="gk-dot"></div><div class="gk-dot"></div></div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/\n/g,'<br>');
  }

  // ── Ask the API ───────────────────────────────────────────────
  async function send() {
    const q = input.value.trim();
    if (!q || isLoading) return;

    input.value = '';
    isLoading   = true;
    sendBtn.disabled = true;

    appendMessage('user', q);
    history.push({ role: 'user', content: q });

    const typing = appendTyping();

    try {
      const res = await fetch(`${cfg.apiUrl}/ask`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key':    cfg.apiKey,
        },
        body: JSON.stringify({
          domain_id: cfg.domain,
          question:  q,
          history:   history.slice(-6),  // last 3 turns for context
        }),
      });

      typing.remove();

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        appendMessage('bot', err.detail || 'Sorry, something went wrong. Please try again.');
      } else {
        const data = await res.json();
        const answer = data.answer || 'No answer found.';
        appendMessage('bot', answer);
        history.push({ role: 'assistant', content: answer });
      }
    } catch (e) {
      typing.remove();
      appendMessage('bot', 'Connection error. Please check your internet and try again.');
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // ── Init ──────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

})();
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
  
  function hexToRgba(hex, alpha) {
    const rgb = hexToRgb(hex);
    return `rgba(${rgb}, ${alpha})`;
  }
  
  const rgb = hexToRgb(cfg.color);
  const pos  = cfg.position === 'left' ? 'left:24px' : 'right:24px';
  const posB = cfg.position === 'left' ? 'left:24px' : 'right:24px';

  // Enhanced SVG icons
  const svgChat  = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/><circle cx="8" cy="10" r="1.5"/><circle cx="12" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/></svg>`;
  const svgClose = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  const svgSend  = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;
  const svgBot   = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2zm9 7H3a1 1 0 00-1 1v7a2 2 0 002 2h16a2 2 0 002-2v-7a1 1 0 00-1-1zm-9 9a2 2 0 110-4 2 2 0 010 4zm-4-2a1 1 0 110-2 1 1 0 010 2zm8 0a1 1 0 110-2 1 1 0 010 2z"/></svg>`;
  const svgPen   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
  const svgSparkle = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L14 8H19L15 11L17 16L12 13L7 16L9 11L5 8H10L12 3Z"/></svg>`;

  // Enhanced Base CSS with modern animations and responsiveness
  const BASE_CSS = `
    .gk-wrap * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    @keyframes gkFloatIn {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    
    @keyframes gkMessageIn {
      from { opacity: 0; transform: translateX(-8px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes gkUserMessageIn {
      from { opacity: 0; transform: translateX(8px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes gkTypingDot {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }
    
    @keyframes gkPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    @keyframes gkRipple {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(2); opacity: 0; }
    }
    
    .gk-wrap {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', system-ui, sans-serif;
    }
    
    .gk-msgs {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
      padding: 16px;
    }
    
    .gk-msgs::-webkit-scrollbar {
      width: 4px;
    }
    
    .gk-msgs::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
    }
    
    .gk-msgs::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }
    
    .gk-msg {
      display: flex;
      flex-direction: column;
      animation: gkMessageIn 0.3s ease-out;
    }
    
    .gk-msg.u {
      align-items: flex-end;
      animation: gkUserMessageIn 0.3s ease-out;
    }
    
    .gk-msg.b {
      align-items: flex-start;
    }
    
    .gk-bub {
      padding: 10px 14px;
      font-size: 14px;
      line-height: 1.5;
      word-break: break-word;
      max-width: 85%;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .gk-msg.u .gk-bub {
      background: ${cfg.color};
      color: ${cfg.textColor};
      border-radius: 18px 18px 4px 18px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .gk-msg.b .gk-bub {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 18px 18px 18px 4px;
      color: #1f2937;
    }
    
    .gk-time {
      font-size: 10px;
      color: #9ca3af;
      margin-top: 4px;
      padding: 0 4px;
      letter-spacing: 0.3px;
    }
    
    .gk-typing {
      display: flex;
      gap: 6px;
      padding: 12px 16px;
    }
    
    .gk-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${cfg.color};
      opacity: 0.6;
      animation: gkTypingDot 1.2s ease-in-out infinite;
    }
    
    .gk-dot:nth-child(2) { animation-delay: .2s; }
    .gk-dot:nth-child(3) { animation-delay: .4s; }
    
    .gk-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px 0 4px;
      margin-top: 4px;
    }
    
    .gk-chip {
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid ${hexToRgba(cfg.color, 0.3)};
      background: ${hexToRgba(cfg.color, 0.08)};
      color: ${cfg.color};
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
    }
    
    .gk-chip:hover {
      background: ${hexToRgba(cfg.color, 0.18)};
      transform: translateY(-1px);
      box-shadow: 0 2px 6px ${hexToRgba(cfg.color, 0.2)};
    }
    
    .gk-chip:active {
      transform: translateY(1px);
    }
    
    .gk-chip:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    
    .gk-welcome {
      text-align: center;
      padding: 32px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    
    .gk-welcome-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: ${hexToRgba(cfg.color, 0.1)};
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${cfg.color};
      margin-bottom: 4px;
      animation: gkPulse 2s ease-in-out infinite;
    }
    
    .gk-welcome-icon svg {
      width: 24px;
      height: 24px;
    }
    
    .gk-welcome p {
      font-size: 14px;
      line-height: 1.6;
      color: #6b7280;
      max-width: 240px;
    }
    
    .gk-brand {
      text-align: center;
      font-size: 10px;
      color: #9ca3af;
      padding: 8px 0 10px;
      flex-shrink: 0;
    }
    
    .gk-brand a {
      color: #9ca3af;
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .gk-brand a:hover {
      color: ${cfg.color};
    }
    
    @media (max-width: 480px) {
      .gk-panel {
        width: calc(100vw - 24px) !important;
        max-height: 70vh !important;
        bottom: 80px !important;
      }
      
      .gk-bub {
        font-size: 14px !important;
        padding: 10px 14px !important;
        max-width: 90% !important;
      }
      
      .gk-chip {
        padding: 6px 12px !important;
        font-size: 12px !important;
      }
      
      .gk-input {
        font-size: 15px !important;
        padding: 10px 14px !important;
      }
      
      .gk-welcome-icon {
        width: 40px !important;
        height: 40px !important;
      }
      
      .gk-welcome-icon svg {
        width: 20px !important;
        height: 20px !important;
      }
    }
    
    @media (max-width: 380px) {
      .gk-panel {
        width: calc(100vw - 16px) !important;
      }
      
      .gk-bub {
        font-size: 13px !important;
      }
    }
    
    @media (prefers-color-scheme: dark) {
      .gk-panel:not([data-theme="branded"]) {
        background: #1a1a1a !important;
      }
      
      .gk-msgs:not([data-theme="branded"]) {
        background: #0f0f0f !important;
      }
      
      .gk-msg.b .gk-bub:not([data-theme="branded"]) {
        background: #2a2a2a !important;
        border-color: #3a3a3a !important;
        color: #e0e0e0 !important;
      }
      
      .gk-input:not([data-theme="branded"]) {
        background: #2a2a2a !important;
        border-color: #3a3a3a !important;
        color: #e0e0e0 !important;
      }
      
      .gk-footer:not([data-theme="branded"]) {
        border-top-color: #2a2a2a !important;
        background: #1a1a1a !important;
      }
      
      .gk-welcome p:not([data-theme="branded"]) {
        color: #9ca3af !important;
      }
    }
  `;

  // Enhanced Theme Definitions
  const THEMES = {
    card: {
      bubbleCSS: `
        .gk-bubble {
          position: fixed;
          ${posB};
          bottom: 24px;
          z-index: 99999;
          width: 56px;
          height: 56px;
          border-radius: 28px;
          background: ${cfg.color};
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px ${hexToRgba(cfg.color, 0.4)};
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          color: ${cfg.textColor};
        }
        .gk-bubble svg {
          width: 24px;
          height: 24px;
          transition: transform 0.2s;
        }
        .gk-bubble:hover {
          transform: scale(1.08);
          box-shadow: 0 8px 28px ${hexToRgba(cfg.color, 0.5)};
        }
        .gk-bubble:active {
          transform: scale(0.98);
        }
        .gk-bubble .icon-chat { display: flex; }
        .gk-bubble .icon-close { display: none; }
        .gk-bubble.open .icon-chat { display: none; }
        .gk-bubble.open .icon-close { display: flex; }
      `,
      panelCSS: `
        .gk-panel {
          position: fixed;
          ${pos};
          bottom: 92px;
          z-index: 99998;
          width: 380px;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          max-height: 600px;
          transform: scale(0.92) translateY(16px);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s;
        }
        .gk-panel.open {
          transform: scale(1) translateY(0);
          opacity: 1;
          pointer-events: all;
        }
        .gk-header {
          background: ${cfg.color};
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .gk-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${cfg.textColor};
          margin-right: 12px;
        }
        .gk-avatar svg {
          width: 18px;
          height: 18px;
        }
        .gk-htitle {
          font-size: 15px;
          font-weight: 600;
          color: ${cfg.textColor};
        }
        .gk-honline {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.8);
          margin-top: 2px;
        }
        .gk-hclose {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: ${cfg.textColor};
          transition: background 0.2s;
        }
        .gk-hclose:hover {
          background: rgba(255, 255, 255, 0.28);
        }
        .gk-footer {
          padding: 12px 16px;
          border-top: 1px solid #f0f0f0;
          background: #ffffff;
          display: flex;
          gap: 10px;
          align-items: center;
          flex-shrink: 0;
        }
        .gk-input {
          flex: 1;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 10px 16px;
          font-size: 14px;
          outline: none;
          color: #111;
          background: #fafafa;
          transition: all 0.2s;
          font-family: inherit;
        }
        .gk-input:focus {
          border-color: ${cfg.color};
          background: #ffffff;
          box-shadow: 0 0 0 3px ${hexToRgba(cfg.color, 0.1)};
        }
        .gk-input::placeholder {
          color: #bbb;
        }
        .gk-send {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: ${cfg.color};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${cfg.textColor};
          transition: all 0.2s;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .gk-send:hover:not(:disabled) {
          transform: scale(1.05);
          opacity: 0.9;
        }
        .gk-send:active:not(:disabled)::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: gkRipple 0.4s ease-out;
        }
        .gk-send:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .gk-send svg {
          width: 16px;
          height: 16px;
        }
      `,
      buildBubble: () => `<button class="gk-bubble" aria-label="Open chat">
        <span class="icon-chat">${svgChat}</span>
        <span class="icon-close">${svgClose}</span>
      </button>`,
      buildPanel: () => `<div class="gk-panel gk-wrap">
        <div class="gk-header">
          <div style="display:flex;align-items:center">
            <div class="gk-avatar">${svgBot}</div>
            <div>
              <div class="gk-htitle">${cfg.title}</div>
              <div class="gk-honline">● Online</div>
            </div>
          </div>
          <button class="gk-hclose">${svgClose}</button>
        </div>
        <div class="gk-msgs">
          <div class="gk-welcome">
            <div class="gk-welcome-icon">${svgSparkle}</div>
            <p>Hi there! Ask me anything from our docs.</p>
          </div>
        </div>
        <div class="gk-footer">
          <input class="gk-input" type="text" placeholder="${cfg.placeholder}" autocomplete="off"/>
          <button class="gk-send" disabled>${svgSend}</button>
        </div>
        <div class="gk-brand"><a href="https://ginkgo.sh" target="_blank">Powered by ginkgo</a></div>
      </div>`,
    },

    minimal: {
      bubbleCSS: `
        .gk-bubble {
          position: fixed;
          ${posB};
          bottom: 24px;
          z-index: 99999;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 40px;
          padding: 10px 20px 10px 16px;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.2s;
          color: #374151;
          font-family: inherit;
        }
        .gk-bubble:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }
        .gk-bubble .bbl-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${cfg.color};
          flex-shrink: 0;
        }
        .gk-bubble .bbl-text {
          font-size: 14px;
          font-weight: 500;
        }
        .gk-bubble .bbl-close {
          display: none;
          font-size: 20px;
          line-height: 1;
          color: #9ca3af;
        }
        .gk-bubble.open .bbl-dot,
        .gk-bubble.open .bbl-text {
          display: none;
        }
        .gk-bubble.open .bbl-close {
          display: block;
        }
      `,
      panelCSS: `
        .gk-panel {
          position: fixed;
          ${pos};
          bottom: 80px;
          z-index: 99998;
          width: 360px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          max-height: 520px;
          transform: translateY(12px);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.2s ease, opacity 0.15s;
        }
        .gk-panel.open {
          transform: translateY(0);
          opacity: 1;
          pointer-events: all;
        }
        .gk-footer {
          padding: 12px 16px;
          border-top: 1px solid #f0f0f0;
          background: #ffffff;
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .gk-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 10px 0;
          font-size: 14px;
          background: transparent;
          font-family: inherit;
        }
        .gk-input::placeholder {
          color: #bbb;
        }
        .gk-send {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: ${cfg.color};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${cfg.textColor};
          transition: opacity 0.2s;
        }
        .gk-send:hover:not(:disabled) {
          opacity: 0.85;
        }
        .gk-send:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .gk-send svg {
          width: 14px;
          height: 14px;
        }
      `,
      buildBubble: () => `<button class="gk-bubble" aria-label="Open chat">
        <span class="bbl-dot"></span>
        <span class="bbl-text">${cfg.title}</span>
        <span class="bbl-close">×</span>
      </button>`,
      buildPanel: () => `<div class="gk-panel gk-wrap">
        <div class="gk-msgs">
          <div class="gk-welcome" style="padding: 20px;">
            <p style="font-size: 13px; color: #6b7280;">Ask me anything — I'll answer from our docs.</p>
          </div>
        </div>
        <div class="gk-footer">
          <input class="gk-input" type="text" placeholder="${cfg.placeholder}" autocomplete="off"/>
          <button class="gk-send" disabled>${svgSend}</button>
        </div>
        <div class="gk-brand"><a href="https://ginkgo.sh" target="_blank">ginkgo</a></div>
      </div>`,
    },

    branded: {
      bubbleCSS: `
        .gk-bubble {
          position: fixed;
          ${posB};
          bottom: 24px;
          z-index: 99999;
          width: 60px;
          height: 60px;
          border-radius: 20px;
          background: ${cfg.color};
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px ${hexToRgba(cfg.color, 0.5)};
          transition: all 0.25s;
          color: ${cfg.textColor};
        }
        .gk-bubble:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 12px 32px ${hexToRgba(cfg.color, 0.6)};
        }
        .gk-bubble svg {
          width: 26px;
          height: 26px;
        }
        .gk-bubble.open .icon-chat { display: none; }
        .gk-bubble .icon-close { display: none; }
        .gk-bubble.open .icon-close { display: flex; }
      `,
      panelCSS: `
        .gk-panel {
          position: fixed;
          ${pos};
          bottom: 96px;
          z-index: 99998;
          width: 380px;
          background: ${cfg.color};
          border-radius: 28px;
          box-shadow: 0 20px 48px ${hexToRgba(cfg.color, 0.4)};
          display: flex;
          flex-direction: column;
          overflow: hidden;
          max-height: 580px;
          transform: scale(0.92) translateY(16px);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s;
        }
        .gk-panel.open {
          transform: scale(1) translateY(0);
          opacity: 1;
          pointer-events: all;
        }
        .gk-header {
          padding: 18px 20px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .gk-htitle {
          font-size: 16px;
          font-weight: 700;
          color: ${cfg.textColor};
        }
        .gk-honline {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 2px;
        }
        .gk-hclose {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: ${cfg.textColor};
        }
        .gk-hclose:hover {
          background: rgba(255, 255, 255, 0.25);
        }
        .gk-msgs {
          background: rgba(0, 0, 0, 0.15);
          margin: 12px;
          border-radius: 20px;
          padding: 16px;
        }
        .gk-msg.b .gk-bub {
          background: rgba(255, 255, 255, 0.2);
          color: ${cfg.textColor};
          backdrop-filter: blur(8px);
          border: none;
        }
        .gk-msg.u .gk-bub {
          background: rgba(255, 255, 255, 0.3);
          color: ${cfg.textColor};
        }
        .gk-time {
          color: rgba(255, 255, 255, 0.5);
        }
        .gk-typing .gk-dot {
          background: rgba(255, 255, 255, 0.6);
        }
        .gk-welcome p {
          color: ${cfg.textColor};
        }
        .gk-welcome-icon {
          background: rgba(255, 255, 255, 0.2);
          color: ${cfg.textColor};
        }
        .gk-chip {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: ${cfg.textColor};
        }
        .gk-chip:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .gk-footer {
          padding: 0 12px 12px;
          display: flex;
          gap: 10px;
          align-items: center;
          flex-shrink: 0;
        }
        .gk-input {
          flex: 1;
          border: none;
          border-radius: 24px;
          padding: 12px 18px;
          font-size: 14px;
          outline: none;
          color: #111;
          background: rgba(255, 255, 255, 0.95);
          font-family: inherit;
        }
        .gk-input:focus {
          background: #ffffff;
        }
        .gk-send {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${cfg.textColor};
          transition: background 0.2s;
        }
        .gk-send:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }
        .gk-send:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .gk-brand a {
          color: rgba(255, 255, 255, 0.5);
        }
        .gk-brand a:hover {
          color: rgba(255, 255, 255, 0.8);
        }
      `,
      buildBubble: () => `<button class="gk-bubble" aria-label="Open chat">
        <span class="icon-chat">${svgChat}</span>
        <span class="icon-close">${svgClose}</span>
      </button>`,
      buildPanel: () => `<div class="gk-panel gk-wrap">
        <div class="gk-header">
          <div>
            <div class="gk-htitle">${cfg.title}</div>
            <div class="gk-honline">● Online now</div>
          </div>
          <button class="gk-hclose">${svgClose}</button>
        </div>
        <div class="gk-msgs">
          <div class="gk-welcome">
            <div class="gk-welcome-icon">${svgSparkle}</div>
            <p>Hi! Ask me anything and I'll find the answer.</p>
          </div>
        </div>
        <div class="gk-footer">
          <input class="gk-input" type="text" placeholder="${cfg.placeholder}" autocomplete="off"/>
          <button class="gk-send" disabled>${svgSend}</button>
        </div>
        <div class="gk-brand"><a href="https://ginkgo.sh" target="_blank">Powered by ginkgo</a></div>
      </div>`,
    },

    sidebar: {
      bubbleCSS: `
        .gk-bubble {
          position: fixed;
          ${posB};
          bottom: 32px;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: ${cfg.color};
          border: none;
          border-radius: 12px 12px 0 0;
          padding: 12px 10px 8px;
          cursor: pointer;
          box-shadow: -4px 0 24px ${hexToRgba(cfg.color, 0.3)};
          transition: padding 0.2s, opacity 0.2s;
          color: ${cfg.textColor};
          writing-mode: vertical-rl;
          ${cfg.position === 'left' ? 'border-radius: 0 12px 12px 0; box-shadow: 4px 0 24px ' + hexToRgba(cfg.color, 0.3) : ''}
        }
        .gk-bubble svg {
          width: 18px;
          height: 18px;
          writing-mode: horizontal-tb;
        }
        .gk-bubble .bbl-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          writing-mode: vertical-rl;
          color: ${cfg.textColor};
          margin-top: 6px;
          white-space: nowrap;
        }
        .gk-bubble.open {
          opacity: 0;
          pointer-events: none;
        }
      `,
      panelCSS: `
        .gk-panel {
          position: fixed;
          ${cfg.position === 'left' ? 'left:0' : 'right:0'};
          top: 0;
          bottom: 0;
          z-index: 99998;
          width: 360px;
          background: #ffffff;
          box-shadow: ${cfg.position === 'left' ? '4px' : '-4px'} 0 48px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: translateX(${cfg.position === 'left' ? '-100%' : '100%'});
          opacity: 0;
          pointer-events: none;
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
        }
        .gk-panel.open {
          transform: translateX(0);
          opacity: 1;
          pointer-events: all;
        }
        .gk-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.25);
          z-index: 99997;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s;
        }
        .gk-overlay.open {
          opacity: 1;
          pointer-events: all;
        }
        .gk-header {
          background: ${cfg.color};
          padding: 20px 18px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .gk-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${cfg.textColor};
          margin-right: 12px;
        }
        .gk-avatar svg {
          width: 18px;
          height: 18px;
        }
        .gk-htitle {
          font-size: 16px;
          font-weight: 700;
          color: ${cfg.textColor};
        }
        .gk-honline {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 2px;
        }
        .gk-hclose {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: ${cfg.textColor};
        }
        .gk-footer {
          padding: 12px 16px;
          border-top: 1px solid #eee;
          background: #fff;
          display: flex;
          gap: 10px;
          align-items: center;
          flex-shrink: 0;
        }
        .gk-input {
          flex: 1;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 10px 16px;
          font-size: 14px;
          outline: none;
          background: #fafafa;
        }
        .gk-input:focus {
          border-color: ${cfg.color};
          background: #fff;
        }
        .gk-send {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: ${cfg.color};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${cfg.textColor};
        }
        @media (max-width: 480px) {
          .gk-panel {
            width: 100vw !important;
          }
        }
      `,
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
              <div>
                <div class="gk-htitle">${cfg.title}</div>
                <div class="gk-honline">● Online</div>
              </div>
            </div>
            <button class="gk-hclose">${svgClose}</button>
          </div>
          <div class="gk-msgs">
            <div class="gk-welcome">
              <div class="gk-welcome-icon">${svgSparkle}</div>
              <p>Hi there! Ask me anything and I'll answer from our docs.</p>
            </div>
          </div>
          <div class="gk-footer">
            <input class="gk-input" type="text" placeholder="${cfg.placeholder}" autocomplete="off"/>
            <button class="gk-send" disabled>${svgSend}</button>
          </div>
          <div class="gk-brand"><a href="https://ginkgo.sh" target="_blank">Powered by ginkgo</a></div>
        </div>`,
    },
  };

  // Inject CSS
  const theme = THEMES[cfg.theme] || THEMES.card;
  const style = document.createElement('style');
  style.textContent = BASE_CSS + theme.bubbleCSS + theme.panelCSS;
  document.head.appendChild(style);

  // State management
  let isOpen    = false;
  let isLoading = false;
  let history   = [];
  let panel, msgs, input, sendBtn, bubbleEl, overlay;

  function ts() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
  }

  function appendMsg(role, text, suggestions = []) {
    const welcome = msgs?.querySelector('.gk-welcome');
    if (welcome) welcome.remove();

    const div = document.createElement('div');
    div.className = `gk-msg ${role === 'user' ? 'u' : 'b'}`;
    div.innerHTML = `<div class="gk-bub">${escHtml(text)}</div><div class="gk-time">${ts()}</div>`;
    msgs.appendChild(div);

    if (role === 'bot' && suggestions && suggestions.length > 0) {
      const chips = document.createElement('div');
      chips.className = 'gk-chips';
      suggestions.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'gk-chip';
        btn.textContent = s;
        btn.addEventListener('click', () => {
          chips.remove();
          input.value = s;
          send();
        });
        chips.appendChild(btn);
      });
      msgs.appendChild(chips);
    }

    msgs.scrollTop = msgs.scrollHeight;
  }

  function appendTyping() {
    const welcome = msgs?.querySelector('.gk-welcome');
    if (welcome) welcome.remove();
    const div = document.createElement('div');
    div.className = 'gk-msg b';
    div.innerHTML = `<div class="gk-bub gk-typing"><div class="gk-dot"></div><div class="gk-dot"></div><div class="gk-dot"></div></div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  async function send() {
    const q = input.value.trim();
    if (!q || isLoading) return;
    
    input.value = '';
    sendBtn.disabled = true;
    isLoading = true;

    appendMsg('user', q);
    history.push({ role: 'user', content: q });
    const typing = appendTyping();

    try {
      const res = await fetch(`${cfg.apiUrl}/ask`, {
        method: 'POST',
        credentials: 'omit',
        headers: { 
          'Content-Type': 'application/json', 
          'X-API-Key': cfg.apiKey 
        },
        body: JSON.stringify({ 
          domain_id: cfg.domain, 
          question: q, 
          history: history.slice(-6) 
        }),
      });

      typing.remove();

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        appendMsg('bot', err.detail || 'Sorry, something went wrong.');
      } else {
        const data = await res.json();
        const answer = data.answer || 'No answer found.';
        const suggestions = data.suggestions || [];
        appendMsg('bot', answer, suggestions);
        history.push({ role: 'assistant', content: answer });
      }
    } catch (error) {
      typing.remove();
      appendMsg('bot', 'Connection error. Please try again.');
      console.error('[ginkgo] Error:', error);
    } finally {
      isLoading = false;
      sendBtn.disabled = !input.value.trim();
      input.focus();
    }
  }

  function toggle() {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    if (bubbleEl) bubbleEl.classList.toggle('open', isOpen);
    if (overlay) overlay.classList.toggle('open', isOpen);
    if (isOpen) setTimeout(() => input.focus(), 260);
  }

  function mount() {
    const wrap = document.createElement('div');
    wrap.className = 'gk-widget';

    if (cfg.mode === 'inline') {
      const target = cfg.target ? document.querySelector(cfg.target) : null;
      if (!target) {
        console.warn('[ginkgo] data-target not found');
        return;
      }
      const t = THEMES.card;
      wrap.innerHTML = t.buildPanel().replace('gk-panel', 'gk-inline gk-panel open');
      target.appendChild(wrap);
      panel = wrap.querySelector('.gk-panel');
      msgs = wrap.querySelector('.gk-msgs');
      input = wrap.querySelector('.gk-input');
      sendBtn = wrap.querySelector('.gk-send');
    } else {
      wrap.innerHTML = theme.buildBubble() + theme.buildPanel();
      document.body.appendChild(wrap);
      bubbleEl = wrap.querySelector('.gk-bubble');
      panel = wrap.querySelector('.gk-panel');
      overlay = wrap.querySelector('.gk-overlay');
      msgs = wrap.querySelector('.gk-msgs');
      input = wrap.querySelector('.gk-input');
      sendBtn = wrap.querySelector('.gk-send');

      if (bubbleEl) bubbleEl.addEventListener('click', toggle);
      const closeBtn = panel?.querySelector('.gk-hclose');
      if (closeBtn) closeBtn.addEventListener('click', toggle);
      if (overlay) overlay.addEventListener('click', toggle);
    }

    if (input) {
      input.addEventListener('input', () => {
        if (sendBtn) sendBtn.disabled = !input.value.trim() || isLoading;
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          send();
        }
      });
    }
    
    if (sendBtn) sendBtn.addEventListener('click', send);
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
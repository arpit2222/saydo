import { NetworkCapturedEvent, sanitizeEvents } from '@saydo/shared';

export interface SayDoConfig {
  publicKey: string;
  apiUrl?: string;
  apiPrefix?: string;
}

class SayDoSDK {
  private config: SayDoConfig = {
    publicKey: 'pk_demo_dehix',
    apiUrl: 'http://localhost:4000',
    apiPrefix: '/api/',
  };

  private shadowRoot: ShadowRoot | null = null;
  private isRecording: boolean = false;
  private recordedEvents: NetworkCapturedEvent[] = [];
  private activeTab: 'ask' | 'teach' = 'ask';
  private isOpen: boolean = false;
  private isListening: boolean = false;
  private speechRecognition: any = null;
  private narrationText: string = '';
  private recordingTitle: string = '';

  constructor() {
    this.autoInit();
  }

  private autoInit() {
    if (typeof window === 'undefined') return;

    const currentScript = document.currentScript as HTMLScriptElement | null;
    const publicKey = currentScript?.getAttribute('data-app') || 'pk_demo_dehix';
    const apiUrl = currentScript?.getAttribute('data-api') || currentScript?.getAttribute('data-api-url') || 'http://localhost:4000';

    this.init({ publicKey, apiUrl });
  }

  public init(config: SayDoConfig) {
    this.config = { ...this.config, ...config };
    this.setupInterceptors();
    this.initSpeechRecognition();
    this.mountWidget();

    // Check if URL has ?saydo=teach or localStorage flag
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('saydo') === 'teach' || localStorage.getItem('saydo_mode') === 'teach') {
      this.activeTab = 'teach';
      this.isOpen = true;
    }

    this.render();
    console.log('[SayDo SDK] Initialized with app:', this.config.publicKey, 'API:', this.config.apiUrl);
  }

  private isTeachModeAllowed(): boolean {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    return (
      urlParams.get('saydo') === 'teach' ||
      localStorage.getItem('saydo_mode') === 'teach' ||
      (window as any).saydoTeachMode === true
    );
  }

  private setupInterceptors() {
    if (typeof window === 'undefined') return;

    const self = this;

    // 1. Wrap window.fetch
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const response = await originalFetch.apply(this, args);
      if (self.isRecording) {
        try {
          const urlStr = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
          const url = new URL(urlStr, window.location.origin);

          if (url.origin === window.location.origin && url.pathname.startsWith(self.config.apiPrefix || '/api/')) {
            const clone = response.clone();
            let responseBody: unknown = null;
            try {
              responseBody = await clone.json();
            } catch {
              // Not JSON
            }

            const rawBody = args[1]?.body;
            const parsedBody = self.safeParseBody(rawBody);

            self.addCapturedEvent({
              method: (args[1]?.method || 'GET').toUpperCase() as any,
              path: url.pathname,
              query: Object.fromEntries(url.searchParams.entries()),
              requestBody: parsedBody,
              status: response.status,
              responseBody,
              ts: Date.now(),
            });
          }
        } catch (e) {
          console.warn('[SayDo] Fetch interceptor error:', e);
        }
      }
      return response;
    };

    // 2. Wrap XMLHttpRequest
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (this: any, method: string, url: string | URL, ...rest: any[]) {
      this._saydoMethod = method;
      this._saydoUrl = url.toString();
      return originalXhrOpen.apply(this, [method, url, ...rest] as any);
    };

    XMLHttpRequest.prototype.send = function (this: any, body?: any) {
      if (self.isRecording && this._saydoUrl) {
        this.addEventListener('load', () => {
          try {
            const url = new URL(this._saydoUrl, window.location.origin);
            if (url.origin === window.location.origin && url.pathname.startsWith(self.config.apiPrefix || '/api/')) {
              let responseBody = null;
              try {
                responseBody = JSON.parse(this.responseText);
              } catch {}

              self.addCapturedEvent({
                method: (this._saydoMethod || 'GET').toUpperCase() as any,
                path: url.pathname,
                query: Object.fromEntries(url.searchParams.entries()),
                requestBody: self.safeParseBody(body),
                status: this.status,
                responseBody,
                ts: Date.now(),
              });
            }
          } catch (e) {
            console.warn('[SayDo] XHR interceptor error:', e);
          }
        });
      }
      return originalXhrSend.apply(this, [body] as any);
    };
  }

  private addCapturedEvent(event: NetworkCapturedEvent) {
    this.recordedEvents.push(event);
    console.log('[SayDo SDK] Captured network event:', event.method, event.path, event.status);
    this.updateEventListUI();
  }

  private safeParseBody(body: any): unknown {
    if (!body) return undefined;
    if (typeof body === 'string') {
      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    }
    return body;
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = 'en-IN'; // Indian English / Hinglish optimized

      this.speechRecognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        this.narrationText = (this.narrationText + ' ' + transcript).trim();
        this.updateNarrationUI();
      };

      this.speechRecognition.onerror = (err: any) => {
        console.warn('[SayDo Speech] Speech recognition error:', err.error);
        this.isListening = false;
        this.updateMicButtonUI();
      };

      this.speechRecognition.onend = () => {
        this.isListening = false;
        this.updateMicButtonUI();
      };
    }
  }

  private toggleSpeech() {
    if (!this.speechRecognition) {
      alert('Web Speech API is not supported in this browser. You can type directly in the Tell box.');
      return;
    }

    if (this.isListening) {
      this.speechRecognition.stop();
      this.isListening = false;
    } else {
      try {
        this.speechRecognition.start();
        this.isListening = true;
      } catch (e) {
        console.warn('Speech start error:', e);
      }
    }
    this.updateMicButtonUI();
  }

  private mountWidget() {
    if (typeof document === 'undefined') return;

    let hostDiv = document.getElementById('saydo-root');
    if (!hostDiv) {
      hostDiv = document.createElement('div');
      hostDiv.id = 'saydo-root';
      document.body.appendChild(hostDiv);
    }

    this.shadowRoot = hostDiv.attachShadow({ mode: 'open' });
  }

  private render() {
    if (!this.shadowRoot) return;

    const isTeachAvailable = this.isTeachModeAllowed();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13px;
          line-height: 1.4;
          color: #e2e8f0;
          box-sizing: border-box;
        }
        *, *::before, *::after {
          box-sizing: border-box;
        }

        /* Floating Launcher */
        .saydo-launcher {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #0f172a;
          color: #ffffff;
          border-radius: 9999px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.12);
          z-index: 2147483647;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: none;
        }
        .saydo-launcher:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.5);
        }
        .saydo-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${this.isRecording ? '#ef4444' : '#10b981'};
          box-shadow: 0 0 8px ${this.isRecording ? '#ef4444' : '#10b981'};
          animation: ${this.isRecording ? 'pulse 1s infinite' : 'none'};
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }

        /* Modal Panel */
        .saydo-panel {
          position: fixed;
          bottom: 76px;
          right: 24px;
          width: 380px;
          max-height: 560px;
          background: #0b0f19;
          border: 1px solid #1e293b;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          z-index: 2147483647;
          display: ${this.isOpen ? 'flex' : 'none'};
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Panel Header */
        .saydo-header {
          padding: 14px 18px;
          background: #0f172a;
          border-bottom: 1px solid #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .saydo-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: #ffffff;
          font-size: 14px;
        }
        .saydo-badge {
          font-size: 10px;
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          padding: 2px 6px;
          border-radius: 9999px;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .saydo-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          padding: 4px;
        }
        .saydo-close:hover { color: #ffffff; }

        /* Tabs */
        .saydo-tabs {
          display: flex;
          background: #090d16;
          border-bottom: 1px solid #1e293b;
          padding: 4px;
          gap: 4px;
        }
        .saydo-tab-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: #94a3b8;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .saydo-tab-btn.active {
          background: #1e293b;
          color: #ffffff;
        }

        /* Tab Content Body */
        .saydo-body {
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-height: 440px;
        }

        /* Teach View Elements */
        .saydo-rec-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 12px;
          background: #131b2e;
          border: 1px solid #1e293b;
        }
        .saydo-rec-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 12px;
        }
        .saydo-rec-btn {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .saydo-rec-btn.start {
          background: #ef4444;
          color: #ffffff;
        }
        .saydo-rec-btn.stop {
          background: #334155;
          color: #f1f5f9;
        }

        /* Form Inputs */
        .saydo-label {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        .saydo-input, .saydo-textarea {
          width: 100%;
          background: #070a12;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 10px 12px;
          color: #f8fafc;
          font-size: 12px;
          outline: none;
          font-family: inherit;
        }
        .saydo-input:focus, .saydo-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        /* Tell Box & Mic */
        .saydo-tell-box {
          position: relative;
        }
        .saydo-mic-btn {
          position: absolute;
          right: 8px;
          bottom: 8px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: ${this.isListening ? '#ef4444' : '#1e293b'};
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s ease;
        }
        .saydo-mic-btn:hover {
          background: ${this.isListening ? '#dc2626' : '#2563eb'};
        }

        /* Captured Events Feed */
        .saydo-events-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .saydo-event-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          border-radius: 8px;
          background: #090e1a;
          border: 1px solid #1e293b;
          font-size: 11px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }
        .saydo-method {
          font-weight: bold;
          color: #60a5fa;
        }
        .saydo-path {
          color: #cbd5e1;
          margin-left: 6px;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .saydo-status {
          font-size: 10px;
          color: #10b981;
          padding: 1px 5px;
          border-radius: 4px;
          background: rgba(16, 185, 129, 0.1);
        }

        /* Save Button */
        .saydo-save-btn {
          padding: 10px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .saydo-save-btn:hover {
          background: #1d4ed8;
        }
        .saydo-save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Ask View */
        .saydo-ask-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: center;
          padding: 10px 0;
        }
        .saydo-ask-hint {
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.5;
        }
      </style>

      <!-- Launcher Button -->
      <button class="saydo-launcher" id="saydo-launcher">
        <span class="saydo-indicator"></span>
        <span>${this.isRecording ? 'Recording (SayDo)' : 'SayDo Agent'}</span>
      </button>

      <!-- Panel -->
      <div class="saydo-panel" id="saydo-panel">
        <div class="saydo-header">
          <div class="saydo-brand">
            <span>⚡ SayDo</span>
            <span class="saydo-badge">AI Skills</span>
          </div>
          <button class="saydo-close" id="saydo-close">&times;</button>
        </div>

        ${
          isTeachAvailable
            ? `
          <div class="saydo-tabs">
            <button class="saydo-tab-btn ${this.activeTab === 'ask' ? 'active' : ''}" id="tab-ask">
              Ask Agent
            </button>
            <button class="saydo-tab-btn ${this.activeTab === 'teach' ? 'active' : ''}" id="tab-teach">
              Teach by Doing
            </button>
          </div>
        `
            : ''
        }

        <div class="saydo-body">
          ${
            this.activeTab === 'teach' && isTeachAvailable
              ? `
            <!-- Teach View -->
            <div class="saydo-rec-bar">
              <div class="saydo-rec-status">
                <span class="saydo-indicator"></span>
                <span>${this.isRecording ? 'Capturing App API Calls...' : 'Recorder Ready'}</span>
              </div>
              <button class="saydo-rec-btn ${this.isRecording ? 'stop' : 'start'}" id="btn-toggle-rec">
                ${this.isRecording ? 'Stop Recording' : '● Record Task'}
              </button>
            </div>

            <div>
              <div class="saydo-label">Task Title</div>
              <input 
                type="text" 
                class="saydo-input" 
                id="input-title" 
                placeholder="e.g. Create Website Revamp Project" 
                value="${this.recordingTitle}"
              />
            </div>

            <div>
              <div class="saydo-label">Tell Narration (Wispr / Voice Mic)</div>
              <div class="saydo-tell-box">
                <textarea 
                  class="saydo-textarea" 
                  id="textarea-narration" 
                  rows="3" 
                  placeholder="Talk aloud while doing the task... e.g. 'I am setting the budget to 2 lakh and creating the project.'"
                >${this.narrationText}</textarea>
                <button class="saydo-mic-btn" id="btn-mic" title="Dictate by voice (Web Speech API / Wispr)">
                  ${this.isListening ? '🛑' : '🎙️'}
                </button>
              </div>
            </div>

            <div>
              <div class="saydo-label">Captured Network Calls (${this.recordedEvents.length})</div>
              <div class="saydo-events-box" id="events-list">
                ${
                  this.recordedEvents.length === 0
                    ? `<div style="font-size: 11px; color: #64748b; font-style: italic; padding: 4px;">Click 'Record Task' and interact with DEHIX-lite. API calls appear here live.</div>`
                    : this.recordedEvents
                        .map(
                          (ev) => `
                        <div class="saydo-event-item">
                          <div>
                            <span class="saydo-method">${ev.method}</span>
                            <span class="saydo-path" title="${ev.path}">${ev.path}</span>
                          </div>
                          <span class="saydo-status">${ev.status}</span>
                        </div>
                      `
                        )
                        .join('')
                }
              </div>
            </div>

            <button 
              class="saydo-save-btn" 
              id="btn-save-recording" 
              ${this.recordedEvents.length === 0 ? 'disabled' : ''}
            >
              Stop & Save to SayDo
            </button>
          `
              : `
            <!-- Ask View -->
            <div class="saydo-ask-container">
              <div style="font-size: 28px;">🤖</div>
              <div style="font-weight: 700; color: #ffffff; font-size: 15px;">Ask SayDo Agent</div>
              <p class="saydo-ask-hint">
                SayDo knows this app's typed skills and spoken policies. Ask anything by voice or text.
              </p>
              <textarea 
                class="saydo-textarea" 
                rows="3" 
                placeholder="e.g. 'Create a new project for Website Revamp with 2 lakh budget'"
              ></textarea>
              <button class="saydo-save-btn">Run with User Session</button>
            </div>
          `
          }
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners() {
    if (!this.shadowRoot) return;

    // Toggle Panel
    const launcher = this.shadowRoot.getElementById('saydo-launcher');
    launcher?.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      this.render();
    });

    const closeBtn = this.shadowRoot.getElementById('saydo-close');
    closeBtn?.addEventListener('click', () => {
      this.isOpen = false;
      this.render();
    });

    // Tab Switchers
    const tabAsk = this.shadowRoot.getElementById('tab-ask');
    tabAsk?.addEventListener('click', () => {
      this.activeTab = 'ask';
      this.render();
    });

    const tabTeach = this.shadowRoot.getElementById('tab-teach');
    tabTeach?.addEventListener('click', () => {
      this.activeTab = 'teach';
      this.render();
    });

    // Recording Toggle
    const recToggle = this.shadowRoot.getElementById('btn-toggle-rec');
    recToggle?.addEventListener('click', () => {
      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
      this.render();
    });

    // Mic Toggle
    const micBtn = this.shadowRoot.getElementById('btn-mic');
    micBtn?.addEventListener('click', () => {
      this.toggleSpeech();
    });

    // Inputs Sync
    const titleInput = this.shadowRoot.getElementById('input-title') as HTMLInputElement | null;
    titleInput?.addEventListener('input', (e) => {
      this.recordingTitle = (e.target as HTMLInputElement).value;
    });

    const narrationInput = this.shadowRoot.getElementById('textarea-narration') as HTMLTextAreaElement | null;
    narrationInput?.addEventListener('input', (e) => {
      this.narrationText = (e.target as HTMLTextAreaElement).value;
    });

    // Save Action
    const saveBtn = this.shadowRoot.getElementById('btn-save-recording');
    saveBtn?.addEventListener('click', () => {
      this.saveRecording();
    });
  }

  private updateEventListUI() {
    if (!this.shadowRoot) return;
    const listEl = this.shadowRoot.getElementById('events-list');
    const saveBtn = this.shadowRoot.getElementById('btn-save-recording') as HTMLButtonElement | null;

    if (listEl) {
      listEl.innerHTML = this.recordedEvents
        .map(
          (ev) => `
        <div class="saydo-event-item">
          <div>
            <span class="saydo-method">${ev.method}</span>
            <span class="saydo-path" title="${ev.path}">${ev.path}</span>
          </div>
          <span class="saydo-status">${ev.status}</span>
        </div>
      `
        )
        .join('');
    }

    if (saveBtn) {
      saveBtn.disabled = this.recordedEvents.length === 0;
    }
  }

  private updateNarrationUI() {
    if (!this.shadowRoot) return;
    const textarea = this.shadowRoot.getElementById('textarea-narration') as HTMLTextAreaElement | null;
    if (textarea) {
      textarea.value = this.narrationText;
    }
  }

  private updateMicButtonUI() {
    if (!this.shadowRoot) return;
    const btn = this.shadowRoot.getElementById('btn-mic');
    if (btn) {
      btn.textContent = this.isListening ? '🛑' : '🎙️';
      btn.style.background = this.isListening ? '#ef4444' : '#1e293b';
    }
  }

  public startRecording() {
    this.isRecording = true;
    this.recordedEvents = [];
    console.log('[SayDo SDK] Recording started...');
  }

  public stopRecording() {
    this.isRecording = false;
    console.log('[SayDo SDK] Recording stopped. Total events:', this.recordedEvents.length);
  }

  public async saveRecording() {
    this.stopRecording();

    const title = this.recordingTitle.trim() || 'Recorded Task ' + new Date().toLocaleTimeString();
    const narration = this.narrationText.trim();

    // Client-side Sanitization
    const sanitized = sanitizeEvents(this.recordedEvents);

    const payload = {
      publicKey: this.config.publicKey,
      title,
      events: sanitized,
      narration,
    };

    try {
      const res = await fetch(`${this.config.apiUrl}/v1/recordings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SayDo-Public-Key': this.config.publicKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save recording');
      }

      alert(`✅ Recording "${title}" successfully stored in SayDo! (${data.event_count} sanitized events)`);
      this.recordedEvents = [];
      this.recordingTitle = '';
      this.narrationText = '';
      this.render();
    } catch (err: any) {
      alert(`❌ Failed to save recording: ${err.message}`);
    }
  }
}

// Global instance
const sayDoInstance = new SayDoSDK();
if (typeof window !== 'undefined') {
  (window as any).SayDo = sayDoInstance;
}

export default sayDoInstance;

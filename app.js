/* ==========================================================================
   ATURAN 3 PALET WARNA (60-30-10) & UI SUPER SIMPEL / LEGA
   1. Dominan (60%)  : #090D16 & #111827 (Background & Panel)
   2. Sekunder (30%) : #F3F4F6 & #6B7280 (Teks & Garis Halus)
   3. Aksen (10%)    : #10B981 (Emerald untuk Aksi & Status)
   ========================================================================== */

:root {
  --bg-main: #090d16;
  --bg-panel: #111827;
  --bg-input: #1f2937;
  --border-color: #374151;
  
  --text-main: #f3f4f6;
  --text-muted: #9ca3af;
  
  --accent: #10b981;
  --accent-hover: #059669;
  --accent-soft: rgba(16, 185, 129, 0.12);
  
  --rose: #ef4444;
  --rose-soft: rgba(239, 68, 68, 0.12);

  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', Consolas, monospace;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background-color: var(--bg-main);
  color: var(--text-main);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 32px;
  min-height: 100vh;
}

/* Toast Melayang */
.toast-container {
  position: fixed; top: 24px; right: 24px; z-index: 9999;
  display: flex; flex-direction: column; gap: 8px; width: 320px; pointer-events: none;
}
.toast {
  pointer-events: auto; background-color: var(--bg-panel); border: 1px solid var(--border-color);
  padding: 14px 16px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  display: flex; flex-direction: column; gap: 3px; font-size: 0.8rem;
}
.toast-accepted { border-left: 4px solid var(--accent); }
.toast-rejected { border-left: 4px solid var(--rose); }
.toast-title { font-family: var(--font-mono); font-weight: 700; font-size: 0.7rem; }
.toast-accepted .toast-title { color: var(--accent); }
.toast-rejected .toast-title { color: var(--rose); }

/* App Container */
.app-container {
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header */
.header {
  display: flex; justify-content: space-between; align-items: center;
  background-color: var(--bg-panel); border: 1px solid var(--border-color);
  padding: 20px 28px; border-radius: 12px;
}
.header-left { display: flex; align-items: center; gap: 14px; }
.badge-tag {
  background-color: var(--accent-soft); color: var(--accent); border: 1px solid var(--accent);
  font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; padding: 4px 10px; border-radius: 4px;
}
.header h1 { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.01em; }

.header-right { display: flex; align-items: center; gap: 16px; }
.counter-pill {
  background-color: var(--bg-input); border: 1px solid var(--border-color);
  padding: 8px 16px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.8rem;
  display: flex; gap: 8px; align-items: center; color: var(--text-muted);
}
.text-emerald { color: var(--accent); font-weight: 700; }
.text-rose { color: var(--rose); font-weight: 700; }
.divider { color: var(--border-color); }

/* Main Layout */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 24px;
}
@media (max-width: 1024px) { .main-layout { grid-template-columns: 1fr; } }

/* Panel */
.panel {
  background-color: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.panel-header {
  display: flex; justify-content: space-between; align-items: center;
}
.panel-header h2 {
  font-size: 0.95rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
}

/* Filters & Chips */
.filters { display: flex; gap: 6px; }
.chip {
  background-color: var(--bg-input); color: var(--text-muted); border: 1px solid var(--border-color);
  padding: 5px 10px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.7rem; cursor: pointer;
}
.chip.active { background-color: var(--accent-soft); color: var(--accent); border-color: var(--accent); font-weight: 600; }

/* Table */
.table-wrapper { max-height: 480px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px; }
table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.78rem; text-align: left; }
th { position: sticky; top: 0; background-color: var(--bg-input); color: var(--text-muted); padding: 10px 12px; border-bottom: 1px solid var(--border-color); }
td { padding: 11px 12px; border-bottom: 1px solid var(--border-color); }
tr { cursor: pointer; transition: background 0.1s; }
tr:hover { background-color: rgba(255,255,255,0.02); }
tr.selected-row { background-color: var(--accent-soft); }

.badge { padding: 3px 8px; border-radius: 4px; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; }
.badge-valid { background: var(--accent-soft); color: var(--accent); border: 1px solid var(--accent); }
.badge-invalid { background: var(--rose-soft); color: var(--rose); border: 1px solid var(--rose); }
.badge-pending { color: var(--text-muted); border: 1px solid var(--border-color); }

/* Detail Form & Preview */
.detail-content { display: flex; flex-direction: column; gap: 14px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); }
.mt-2 { margin-top: 4px; }

input, select {
  background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-main);
  padding: 9px 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.8rem; outline: none;
}
input:focus, select:focus { border-color: var(--accent); }

/* Action Bar */
.action-bar { display: flex; gap: 8px; margin-top: 4px; }
.btn {
  padding: 10px 16px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.75rem; font-weight: 600; cursor: pointer; border: none; transition: 0.1s;
}
.btn:active { transform: translateY(1px); }
.btn-primary { background-color: var(--accent); color: var(--bg-main); flex: 1; }
.btn-primary:hover { background-color: var(--accent-hover); }
.btn-subtle { background-color: var(--bg-input); color: var(--text-main); border: 1px solid var(--border-color); }
.btn-subtle:hover { border-color: var(--accent); color: var(--accent); }
.btn-text { background: none; border: none; color: var(--text-muted); font-size: 0.75rem; cursor: pointer; font-family: var(--font-mono); }
.btn-text:hover { color: var(--accent); }

/* Preview Box */
.preview-box { background-color: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }
.preview-tabs { display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); }
.email-preview { background: #ffffff; color: #0f172a; padding: 16px; border-radius: 6px; font-size: 0.8rem; max-height: 220px; overflow-y: auto; }
.code-preview { background: var(--bg-main); color: var(--text-main); padding: 12px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.72rem; max-height: 220px; overflow-y: auto; }

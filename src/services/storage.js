// ─── Local Storage Service ──────────────────────────────────
const PREFIX = 'veltrix_';

export const storage = {
  get(key) {
    try { return localStorage.getItem(PREFIX + key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(PREFIX + key, value); } catch { /* quota */ }
  },
  remove(key) {
    try { localStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
  },
  getJSON(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  setJSON(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* quota */ }
  },
  clear() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  },
};

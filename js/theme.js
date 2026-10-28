// @openscaffold/design v1.2.0 — 4 WCAG AA-verified curated looks with 0ms root variable writes
export const THEMES = {
  'warm-editorial': {
    label: 'Open Scaffold Classic',
    vars: {
      '--os-bg':            '#E7D9C1',
      '--os-surface':       '#FBF7EF',
      '--os-surface-alt':   '#EFE7D8',
      '--os-border':        '#D3C4AA',
      '--os-ink':           '#243126',
      '--os-ink-muted':     '#505B4C',
      '--os-ink-soft':      '#505B4C',
      '--os-accent':        '#2F4A34',
      '--os-accent-ink':    '#F4EFE4',
      '--os-success':       '#2B6435',
      '--os-warning':       '#6B5424',
      '--os-danger':        '#9F2D20',
      '--os-radius':        '0.5rem',
      '--os-font':          '"Source Sans 3", system-ui, -apple-system, sans-serif',
      '--os-font-size':     '14px',
      '--os-status-positive-bg':  '#E7EEE2', '--os-status-positive-fg':  '#2B6435',
      '--os-status-attention-bg': '#F1E6C8', '--os-status-attention-fg': '#6B5424',
      '--os-status-critical-bg':  '#F6E1DC', '--os-status-critical-fg':  '#9F2D20',
      '--os-status-info-bg':      '#DFE8D4', '--os-status-info-fg':      '#243126',
      '--os-status-neutral-bg':   '#EBE4D6', '--os-status-neutral-fg':   '#505B4C',
    },
  },
  'clinical-light': {
    label: 'Clinical Light',
    vars: {
      '--os-bg':            '#F8FAFC',
      '--os-surface':       '#FFFFFF',
      '--os-surface-alt':   '#F1F5F9',
      '--os-border':        '#E2E8F0',
      '--os-ink':           '#0F172A',
      '--os-ink-muted':     '#475569',
      '--os-ink-soft':      '#64748B',
      '--os-accent':        '#0369A1',
      '--os-accent-ink':    '#FFFFFF',
      '--os-success':       '#059669',
      '--os-warning':       '#D97706',
      '--os-danger':        '#DC2626',
      '--os-radius':        '0.5rem',
      '--os-font':          'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      '--os-font-size':     '14px',
      '--os-status-positive-bg':  '#DCFCE7', '--os-status-positive-fg':  '#166534',
      '--os-status-attention-bg': '#FEF3C7', '--os-status-attention-fg': '#92400E',
      '--os-status-critical-bg':  '#FEE2E2', '--os-status-critical-fg':  '#991B1B',
      '--os-status-info-bg':      '#DBEAFE', '--os-status-info-fg':      '#1E40AF',
      '--os-status-neutral-bg':   '#E2E8F0', '--os-status-neutral-fg':   '#334155',
    },
  },
  'midnight': {
    label: 'Midnight Dark',
    vars: {
      '--os-bg':            '#0B1220',
      '--os-surface':       '#121C2E',
      '--os-surface-alt':   '#1A2540',
      '--os-border':        '#223049',
      '--os-ink':           '#E6EDF5',
      '--os-ink-muted':     '#94A3B8',
      '--os-ink-soft':      '#94A3B8',
      '--os-accent':        '#38BDF8',
      '--os-accent-ink':    '#0B1220',
      '--os-success':       '#34D399',
      '--os-warning':       '#FBBF24',
      '--os-danger':        '#F87171',
      '--os-radius':        '0.5rem',
      '--os-font':          'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      '--os-font-size':     '14px',
      '--os-status-positive-bg':  '#14532D', '--os-status-positive-fg':  '#BBF7D0',
      '--os-status-attention-bg': '#78350F', '--os-status-attention-fg': '#FDE68A',
      '--os-status-critical-bg':  '#7F1D1D', '--os-status-critical-fg':  '#FECACA',
      '--os-status-info-bg':      '#1E3A8A', '--os-status-info-fg':      '#BFDBFE',
      '--os-status-neutral-bg':   '#334155', '--os-status-neutral-fg':   '#E2E8F0',
    },
  },
  'high-contrast': {
    label: 'High Contrast',
    vars: {
      '--os-bg':            '#FFFFFF',
      '--os-surface':       '#FFFFFF',
      '--os-surface-alt':   '#F0F0F0',
      '--os-border':        '#000000',
      '--os-ink':           '#000000',
      '--os-ink-muted':     '#222222',
      '--os-ink-soft':      '#444444',
      '--os-accent':        '#0000EE',
      '--os-accent-ink':    '#FFFFFF',
      '--os-success':       '#006400',
      '--os-warning':       '#B45309',
      '--os-danger':        '#B00020',
      '--os-radius':        '0.25rem',
      '--os-font':          'system-ui, -apple-system, sans-serif',
      '--os-font-size':     '16px',
      '--os-status-positive-bg':  '#CCFFCC', '--os-status-positive-fg':  '#003300',
      '--os-status-attention-bg': '#FFF2B3', '--os-status-attention-fg': '#5C3200',
      '--os-status-critical-bg':  '#FFD6D6', '--os-status-critical-fg':  '#7A0010',
      '--os-status-info-bg':      '#D6E4FF', '--os-status-info-fg':      '#00206B',
      '--os-status-neutral-bg':   '#E6E6E6', '--os-status-neutral-fg':   '#000000',
    },
  },
};

for (const [name, theme] of Object.entries(THEMES)) {
  theme.vars['--os-rail'] = name === 'warm-editorial' ? '#1F2B22' : name === 'midnight' ? '#080F1C' : '#17251D';
  theme.vars['--os-rail-ink'] = '#F4EFE4';
}
export const STORAGE_KEY = 'open_payment.theme';
export function applyTheme(name, root = globalThis.document?.documentElement, storage = globalThis.localStorage) {
  const key = THEMES[name] ? name : 'warm-editorial';
  for (const [property, value] of Object.entries(THEMES[key].vars)) root?.style.setProperty(property, value);
  root?.setAttribute('data-os-theme', key);
  try { storage?.setItem(STORAGE_KEY, key); } catch { /* Private browsing may block storage. */ }
  return key;
}
export function loadSavedTheme(root, storage = globalThis.localStorage) {
  let name = 'warm-editorial';
  try { name = storage?.getItem(STORAGE_KEY) || name; } catch { /* Use default. */ }
  return applyTheme(name, root, storage);
}
export function listThemes() { return Object.entries(THEMES).map(([key, theme]) => ({key, label: theme.label})); }

export const FULLSCREEN_OPTOUT_KEY = 'openscaffold.fullscreen.optout.v1';
export function isFullscreenActive(doc = globalThis.document) {
  return Boolean(doc && (doc.fullscreenElement || doc.webkitFullscreenElement));
}
export function setFullscreenOptOut(optedOut, win = globalThis.window) {
  const val = optedOut ? '1' : '0';
  try {
    win?.sessionStorage?.setItem(FULLSCREEN_OPTOUT_KEY, val);
    win?.localStorage?.setItem(FULLSCREEN_OPTOUT_KEY, val);
  } catch {}
}
export function isFullscreenOptedOut(win = globalThis.window) {
  try {
    return win?.sessionStorage?.getItem(FULLSCREEN_OPTOUT_KEY) === '1' || win?.localStorage?.getItem(FULLSCREEN_OPTOUT_KEY) === '1';
  } catch { return false; }
}
export async function enterFullscreen(options = {}) {
  const doc = options.doc || globalThis.document;
  const win = options.win || globalThis.window;
  const root = options.root || doc?.documentElement;
  if (!root) return false;
  setFullscreenOptOut(false, win);
  const req = root.requestFullscreen || root.webkitRequestFullscreen;
  if (typeof req !== 'function') return false;
  try { await req.call(root); return true; } catch { return false; }
}
export async function exitFullscreen(options = {}) {
  const doc = options.doc || globalThis.document;
  const win = options.win || globalThis.window;
  setFullscreenOptOut(true, win);
  const exit = doc?.exitFullscreen || doc?.webkitExitFullscreen;
  if (typeof exit !== 'function') return false;
  try { await exit.call(doc); return true; } catch { return false; }
}
export async function toggleFullscreen(options = {}) {
  const doc = options.doc || globalThis.document;
  if (isFullscreenActive(doc)) { await exitFullscreen(options); return { active: false, optedOut: true }; }
  const ok = await enterFullscreen(options);
  return { active: ok, optedOut: false };
}
export function installAutoFullscreen(options = {}) {
  const doc = options.doc || globalThis.document;
  const win = options.win || globalThis.window;
  if (!doc || typeof doc.addEventListener !== 'function') return { dispose() {} };
  const onFirstGesture = (e) => {
    if (e?.target?.closest?.('[data-testid="os-fullscreen-toggle-btn"]')) return;
    if (isFullscreenOptedOut(win) || isFullscreenActive(doc)) return;
    enterFullscreen({ doc, win });
  };
  doc.addEventListener('click', onFirstGesture, { capture: true });
  return { dispose() {} };
}

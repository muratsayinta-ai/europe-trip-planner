// Loads the Google Maps JS SDK once and exposes the Places library.
// The SDK handles CORS and API-key referrer restrictions for us, and gives
// access to the current Places API (AutocompleteSuggestion + Place).

const KEY_STORAGE = 'gmaps_api_key'
const DISABLED = '__free__' // sentinel meaning "user explicitly chose free search"

// Default key baked in via .env.local (VITE_GMAPS_KEY). A per-device override
// in localStorage takes precedence; the DISABLED sentinel forces free search
// even when an env key exists.
const ENV_KEY = (import.meta.env?.VITE_GMAPS_KEY || '').trim()

export function getApiKey() {
  try {
    const stored = localStorage.getItem(KEY_STORAGE)
    if (stored === DISABLED) return ''
    if (stored) return stored
  } catch {}
  return ENV_KEY
}
export function setApiKey(key) {
  try { localStorage.setItem(KEY_STORAGE, key.trim()) } catch {}
}
export function disableApiKey() {
  try { localStorage.setItem(KEY_STORAGE, DISABLED) } catch {}
}

let loadPromise = null

// Google's official inline bootstrap loader. It defines
// google.maps.importLibrary synchronously and lazily fetches the SDK on first
// use. A plain <script> tag does NOT provide importLibrary, which is why the
// modern Places API (AutocompleteSuggestion / Place) needs this.
function bootstrap(apiKey) {
  ;((g) => {
    let h, a, k, p = 'The Google Maps JavaScript API', c = 'google', l = 'importLibrary',
      q = '__ib__', m = document, b = window
    b = b[c] || (b[c] = {})
    const d = b.maps || (b.maps = {}), r = new Set(), e = new URLSearchParams(),
      u = () => h || (h = new Promise(async (f, n) => {
        a = m.createElement('script')
        e.set('libraries', [...r] + '')
        for (k in g) e.set(k.replace(/[A-Z]/g, t => '_' + t[0].toLowerCase()), g[k])
        e.set('callback', c + '.maps.' + q)
        a.src = `https://maps.${c}apis.com/maps/api/js?` + e
        d[q] = f
        a.onerror = () => (h = n(Error(p + ' could not load.')))
        a.nonce = m.querySelector('script[nonce]')?.nonce || ''
        m.head.append(a)
      }))
    d[l] ? console.warn(p + ' only loads once. Ignoring:', g)
      : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)))
  })({ key: apiKey, v: 'weekly' })
}

export function loadGoogleMaps(apiKey) {
  if (typeof window !== 'undefined' && window.google?.maps?.importLibrary) {
    return Promise.resolve(window.google)
  }
  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      if (!apiKey) { reject(new Error('Missing API key')); return }
      try {
        bootstrap(apiKey)
      } catch (e) {
        loadPromise = null
        reject(e); return
      }
      const start = Date.now()
      const check = () => {
        if (window.google?.maps?.importLibrary) resolve(window.google)
        else if (Date.now() - start > 10000) { loadPromise = null; reject(new Error('Failed to load Google Maps. Check the API key.')) }
        else setTimeout(check, 40)
      }
      check()
    })
  }
  return loadPromise
}

// Compact review count like Google ("142K")
export function formatCount(n) {
  if (!n && n !== 0) return ''
  try { return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n) }
  catch { return String(n) }
}

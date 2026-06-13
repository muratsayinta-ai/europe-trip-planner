// Free LLM place suggestions via Google Gemini (generativelanguage API).
// The key lives only on this device (localStorage) with an optional .env.local
// default (VITE_GEMINI_KEY). Gemini's free tier is generous for this use.

const KEY_STORAGE = 'gemini_api_key'
const DISABLED = '__off__'
const ENV_KEY = (import.meta.env?.VITE_GEMINI_KEY || '').trim()
const MODEL = 'gemini-2.5-flash'

export function getGeminiKey() {
  try {
    const stored = localStorage.getItem(KEY_STORAGE)
    if (stored === DISABLED) return ''
    if (stored) return stored
  } catch {}
  return ENV_KEY
}
export function setGeminiKey(key) {
  try { localStorage.setItem(KEY_STORAGE, key.trim()) } catch {}
}
export function disableGeminiKey() {
  try { localStorage.setItem(KEY_STORAGE, DISABLED) } catch {}
}

// Ask Gemini for place ideas in a city, excluding ones already planned.
// Returns an array of { name, type, why, kidFriendly } (best-effort).
export async function suggestPlaces({ cityName, existing = [], count = 6 }) {
  const key = getGeminiKey()
  if (!key) throw new Error('Missing Gemini API key')

  const avoid = existing.length
    ? `Do NOT repeat any of these already-planned places: ${existing.join(', ')}.`
    : ''
  const prompt = `Suggest ${count} great places to visit in ${cityName} for a family with 2 adults and kids on a summer trip. ${avoid}
Favor a mix of famous sights, kid-friendly spots, and a couple of lesser-known gems. Use the real, official place names so they can be found on a map.
Return ONLY JSON matching this schema: { "places": [ { "name": string, "type": string, "why": string (max 12 words), "kidFriendly": boolean } ] }`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.9 },
    }),
  })
  if (!res.ok) {
    let msg = `Gemini request failed (${res.status})`
    try { const e = await res.json(); msg = e?.error?.message || msg } catch {}
    throw new Error(msg)
  }
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  let parsed
  try { parsed = JSON.parse(text) } catch { throw new Error('Could not parse suggestions') }
  const list = Array.isArray(parsed) ? parsed : (parsed.places || [])
  return list
    .filter(p => p && p.name)
    .map(p => ({
      name: String(p.name),
      type: p.type ? String(p.type) : '',
      why: p.why ? String(p.why) : '',
      kidFriendly: !!p.kidFriendly,
    }))
}

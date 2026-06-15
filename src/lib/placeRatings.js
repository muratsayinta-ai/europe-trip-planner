// Live Google rating + review count for a named place (e.g. a restaurant), used
// to surface "popular with locals" — many reviews + a high score. Uses the New
// Places API (Place.searchByText) via the same SDK/key as Places autocomplete.
//
// Results are cached in memory and in localStorage (ratings barely move), so a
// given restaurant is looked up at most once across sessions until the cache is
// cleared or expires.
import { loadGoogleMaps, getApiKey, formatCount } from './googleMaps'

const STORE = 'food_ratings_v1'
const TTL = 1000 * 60 * 60 * 24 * 30 // 30 days

function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORE) || '{}') } catch { return {} }
}
function saveStore(obj) {
  try { localStorage.setItem(STORE, JSON.stringify(obj)) } catch {}
}

const mem = loadStore() // { key: { rating, reviews, ts } | { miss: true, ts } }

// The New Places methods can hang (rather than reject) when the API isn't
// activated for the key — it only surfaces a global ApiNotActivatedMapError — so
// cap the wait and treat a stall as "not enabled".
function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('not-enabled')), ms)),
  ])
}

let placesLib = null
async function getPlacesLib() {
  const key = getApiKey()
  if (!key) throw new Error('no-key')
  if (!placesLib) {
    const g = await loadGoogleMaps(key)
    placesLib = await g.maps.importLibrary('places')
  }
  return placesLib
}

const keyFor = (name, cityName) => `${(name || '').toLowerCase()}|${(cityName || '').toLowerCase()}`

// Returns { rating, reviews } | null (null = looked up but nothing found / no key).
// Throws only for the caller-actionable cases ('no-key', 'not-enabled') so the UI
// can show guidance; other failures resolve to null (fall back to stored rating).
export async function lookupRating(name, cityName, cityCenter) {
  const k = keyFor(name, cityName)
  const hit = mem[k]
  if (hit && Date.now() - hit.ts < TTL) {
    return hit.miss ? null : { rating: hit.rating, reviews: hit.reviews }
  }

  try {
    const { places } = await withTimeout((async () => {
      const lib = await getPlacesLib()
      return lib.Place.searchByText({
        textQuery: `${name} ${cityName || ''}`.trim(),
        fields: ['displayName', 'rating', 'userRatingCount'],
        maxResultCount: 1,
        language: 'en',
        ...(cityCenter ? { locationBias: { center: { lat: cityCenter.lat, lng: cityCenter.lng }, radius: 20000 } } : {}),
      })
    })())
    const p = places && places[0]
    const result = p && p.rating != null
      ? { rating: p.rating, reviews: p.userRatingCount ?? 0 }
      : null
    mem[k] = result ? { ...result, ts: Date.now() } : { miss: true, ts: Date.now() }
    saveStore(mem)
    return result
  } catch (e) {
    const msg = String(e?.message || e)
    // Surface the "API not enabled / key restriction" case (incl. our timeout);
    // swallow everything else and fall back to the stored rating.
    // Don't cache this — it should retry once the API is enabled.
    if (msg === 'no-key') throw e
    if (msg === 'not-enabled' || /not.*activat|denied|disabled|REQUEST_DENIED|ApiNotActivated/i.test(msg)) {
      throw new Error('not-enabled')
    }
    return null
  }
}

// Popularity score: reward both a high rating and a large, local crowd of
// reviewers. log scaling stops a single megamall review count from dominating.
export function popularityScore(rating, reviews) {
  const r = rating || 0
  const n = reviews || 0
  return r * Math.log10(n + 10)
}

// "Local favourite" = well-loved (high rating) AND backed by a big crowd of
// reviewers, so it flags places that are both good and genuinely popular.
export function isLocalFavourite(rating, reviews) {
  return (rating || 0) >= 4.3 && (reviews || 0) >= 2000
}

export { formatCount }

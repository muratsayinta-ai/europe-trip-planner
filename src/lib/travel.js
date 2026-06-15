// Per-day travel time/distance between stops.
//
// Two sources, by design (see the trip's offline-first goal):
//   • estimateLeg() — instant, offline: straight-line distance × a road factor,
//     divided by a typical speed. Rough, but always available (even on the plane).
//   • googleLeg()  — exact street routing + real duration per mode, via the
//     Routes API (routes.googleapis.com). It's CORS-enabled and honours the same
//     HTTP-referrer-restricted key we use for Places, so it works straight from
//     the browser — no proxy. (Replaces the legacy DirectionsService, whose
//     "Directions API" isn't available to enable on newer Cloud projects.)
import { getApiKey } from './googleMaps'

// Great-circle distance in km between two {lat,lng} points.
export function haversineKm(a, b) {
  if (!a || !b) return 0
  const R = 6371, toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

// Real roads/paths wander; bump straight-line distance to approximate them.
const ROAD_FACTOR = 1.3
// Rough average speeds (km/h) for the offline estimate.
const SPEED = { walking: 4.8, transit: 18, driving: 35 }

// Offline estimate for one leg. `exact:false` flags it as approximate.
export function estimateLeg(from, to, mode = 'walking') {
  const km = haversineKm(from, to) * ROAD_FACTOR
  const min = Math.round((km / (SPEED[mode] || SPEED.walking)) * 60)
  return { km, min, exact: false }
}

const ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes'
const ROUTES_MODE = { walking: 'WALK', transit: 'TRANSIT', driving: 'DRIVE' }

// Reject if a request doesn't settle in time, so a flaky network can't hang the UI.
function withTimeout(promise, ms = 12000) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
  ])
}

// Exact distance/duration for one leg from the Routes API. Done leg-by-leg (rather
// than one multi-waypoint route) because TRANSIT doesn't support waypoints and
// per-leg results are easy to cache.
export async function googleLeg(from, to, mode = 'walking') {
  const key = getApiKey()
  if (!key) throw new Error('no-key')
  const res = await withTimeout(fetch(ROUTES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration',
    },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: from.lat, longitude: from.lng } } },
      destination: { location: { latLng: { latitude: to.lat, longitude: to.lng } } },
      travelMode: ROUTES_MODE[mode] || 'WALK',
      units: 'METRIC',
    }),
  }))
  if (!res.ok) {
    // 403 = Routes API not enabled for the project, or the key restriction blocks it.
    throw new Error(res.status === 403 ? 'not-enabled' : 'failed')
  }
  const data = await res.json()
  const route = data.routes?.[0]
  if (!route) throw new Error('no-route') // e.g. no transit route between the stops
  const km = (route.distanceMeters || 0) / 1000
  const secs = parseInt(String(route.duration || '0').replace('s', ''), 10) || 0
  return { km, min: Math.round(secs / 60), exact: true }
}

// Fetch exact legs for an ordered list of points ([hotel?, stop, stop, …]).
// Returns an array of legs (one fewer than points). Throws on the first failure
// (e.g. offline, no key, no transit route) so the caller can fall back.
export async function googleLegs(points, mode = 'walking') {
  const legs = []
  for (let i = 0; i < points.length - 1; i++) {
    legs.push(await googleLeg(points[i], points[i + 1], mode))
  }
  return legs
}

export function hasApiKey() { return !!getApiKey() }

// "1.2 km" / "850 m"
export function fmtKm(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

// "52 min" / "1h 25m"
export function fmtMin(min) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60), m = min % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

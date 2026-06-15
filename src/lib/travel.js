// Per-day travel time/distance between stops.
//
// Two sources, by design (see the trip's offline-first goal):
//   • estimateLeg() — instant, offline: straight-line distance × a road factor,
//     divided by a typical speed. Rough, but always available (even on the plane).
//   • googleLeg()  — exact street routing + real duration per mode, via the
//     Google Maps JS SDK already loaded for Places (so no CORS / no proxy).
import { loadGoogleMaps, getApiKey } from './googleMaps'

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

const TRAVEL_MODE = { walking: 'WALKING', transit: 'TRANSIT', driving: 'DRIVING' }

let svcPromise = null
async function getDirectionsService() {
  const key = getApiKey()
  if (!key) throw new Error('no-key')
  if (!svcPromise) {
    svcPromise = (async () => {
      const g = await loadGoogleMaps(key)
      await g.maps.importLibrary('routes') // DirectionsService lives in the 'routes' library
      return { g, svc: new g.maps.DirectionsService() }
    })().catch((e) => { svcPromise = null; throw e })
  }
  return svcPromise
}

// Reject if a promise doesn't settle in time. The Directions JS service can hang
// indefinitely when the Directions API isn't enabled for the key (it surfaces a
// global ApiNotActivatedMapError instead of rejecting), so we cap the wait.
function withTimeout(promise, ms = 9000) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
  ])
}

// Exact distance/duration for one leg from Google. Done leg-by-leg (rather than a
// single multi-waypoint route) because TRANSIT doesn't support waypoints and
// per-leg results are easy to cache.
export async function googleLeg(from, to, mode = 'walking') {
  const { g, svc } = await getDirectionsService()
  const res = await withTimeout(svc.route({
    origin: { lat: from.lat, lng: from.lng },
    destination: { lat: to.lat, lng: to.lng },
    travelMode: g.maps.TravelMode[TRAVEL_MODE[mode] || 'WALKING'],
  }))
  const leg = res.routes?.[0]?.legs?.[0]
  if (!leg) throw new Error('no-route')
  return { km: leg.distance.value / 1000, min: Math.round(leg.duration.value / 60), exact: true }
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

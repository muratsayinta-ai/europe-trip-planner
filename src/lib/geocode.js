// One-shot forward geocoder using Photon (free, keyless OSM). Used to resolve
// AI-suggested place names into coordinates + a tidy address so they map and
// can be auto-scheduled by proximity.

function photonAddress(p) {
  const parts = [
    p.name,
    [p.housenumber, p.street].filter(Boolean).join(' '),
    p.district, p.city || p.town || p.village, p.state, p.country,
  ].filter(Boolean)
  return parts.filter((v, i) => v !== parts[i - 1]).join(', ')
}

// Resolve a single place name (optionally biased toward a city center).
// Returns { lat, lng, address, area } or null if nothing matched.
export async function geocodeOne(name, cityCenter) {
  const q = (name || '').trim()
  if (!q) return null
  const bias = cityCenter ? `&lat=${cityCenter.lat}&lon=${cityCenter.lng}&zoom=12&location_bias_scale=0.7` : ''
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=1&lang=en${bias}`
  try {
    const res = await fetch(url)
    const data = await res.json()
    const f = (data.features || [])[0]
    if (!f) return null
    const pr = f.properties || {}
    return {
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      address: photonAddress(pr),
      area: pr.district || pr.city || pr.town || '',
    }
  } catch {
    return null
  }
}

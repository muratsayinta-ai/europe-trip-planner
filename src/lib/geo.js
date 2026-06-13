// Average coordinates of a list of items that have lat/lng — used to bias
// place search toward the current city (like Google biasing to the map view).
export function cityCenterOf(items) {
  const withCoords = (items || []).filter(p => p.lat && p.lng)
  if (withCoords.length === 0) return null
  const lat = withCoords.reduce((s, p) => s + p.lat, 0) / withCoords.length
  const lng = withCoords.reduce((s, p) => s + p.lng, 0) / withCoords.length
  return { lat, lng }
}

import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Tooltip, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useData } from '../context/DataContext'
import { cityCenterOf } from '../lib/geo'
import PlaceSearch from '../components/PlaceSearch'
import Modal from '../components/Modal'

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#06b6d4']

// Best-effort country name → flag emoji (covers common destinations; falls back to 📍).
const COUNTRY_FLAGS = {
  france: '🇫🇷', netherlands: '🇳🇱', belgium: '🇧🇪', germany: '🇩🇪', hungary: '🇭🇺',
  denmark: '🇩🇰', italy: '🇮🇹', spain: '🇪🇸', portugal: '🇵🇹', austria: '🇦🇹',
  switzerland: '🇨🇭', 'czech republic': '🇨🇿', czechia: '🇨🇿', poland: '🇵🇱',
  'united kingdom': '🇬🇧', 'great britain': '🇬🇧', england: '🇬🇧', ireland: '🇮🇪',
  norway: '🇳🇴', sweden: '🇸🇪', finland: '🇫🇮', iceland: '🇮🇸', greece: '🇬🇷',
  croatia: '🇭🇷', slovenia: '🇸🇮', slovakia: '🇸🇰', romania: '🇷🇴', bulgaria: '🇧🇬',
  'united states': '🇺🇸', usa: '🇺🇸', canada: '🇨🇦', japan: '🇯🇵', turkey: '🇹🇷', türkiye: '🇹🇷',
}
function flagForCountry(country) {
  return COUNTRY_FLAGS[(country || '').trim().toLowerCase()] || '📍'
}

// Curated list of popular European destinations used to suggest where to go next,
// based on how close they sit to the cities already on the trip.
const EUROPE_CITIES = [
  { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lng: 12.5683 },
  { name: 'Hamburg', country: 'Germany', lat: 53.5511, lng: 9.9937 },
  { name: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405 },
  { name: 'Munich', country: 'Germany', lat: 48.1351, lng: 11.582 },
  { name: 'Cologne', country: 'Germany', lat: 50.9375, lng: 6.9603 },
  { name: 'Frankfurt', country: 'Germany', lat: 50.1109, lng: 8.6821 },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
  { name: 'Rotterdam', country: 'Netherlands', lat: 51.9244, lng: 4.4777 },
  { name: 'Brussels', country: 'Belgium', lat: 50.8503, lng: 4.3517 },
  { name: 'Bruges', country: 'Belgium', lat: 51.2093, lng: 3.2247 },
  { name: 'Antwerp', country: 'Belgium', lat: 51.2194, lng: 4.4025 },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { name: 'Lyon', country: 'France', lat: 45.764, lng: 4.8357 },
  { name: 'Nice', country: 'France', lat: 43.7102, lng: 7.262 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
  { name: 'Edinburgh', country: 'United Kingdom', lat: 55.9533, lng: -3.1883 },
  { name: 'Dublin', country: 'Ireland', lat: 53.3498, lng: -6.2603 },
  { name: 'Zurich', country: 'Switzerland', lat: 47.3769, lng: 8.5417 },
  { name: 'Geneva', country: 'Switzerland', lat: 46.2044, lng: 6.1432 },
  { name: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738 },
  { name: 'Salzburg', country: 'Austria', lat: 47.8095, lng: 13.055 },
  { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lng: 14.4378 },
  { name: 'Budapest', country: 'Hungary', lat: 47.4979, lng: 19.0402 },
  { name: 'Krakow', country: 'Poland', lat: 50.0647, lng: 19.945 },
  { name: 'Warsaw', country: 'Poland', lat: 52.2297, lng: 21.0122 },
  { name: 'Milan', country: 'Italy', lat: 45.4642, lng: 9.19 },
  { name: 'Venice', country: 'Italy', lat: 45.4408, lng: 12.3155 },
  { name: 'Florence', country: 'Italy', lat: 43.7696, lng: 11.2558 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734 },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038 },
  { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393 },
  { name: 'Porto', country: 'Portugal', lat: 41.1579, lng: -8.6291 },
  { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686 },
  { name: 'Oslo', country: 'Norway', lat: 59.9139, lng: 10.7522 },
  { name: 'Helsinki', country: 'Finland', lat: 60.1699, lng: 24.9384 },
  { name: 'Athens', country: 'Greece', lat: 37.9838, lng: 23.7275 },
  { name: 'Zagreb', country: 'Croatia', lat: 45.815, lng: 15.9819 },
  { name: 'Ljubljana', country: 'Slovenia', lat: 46.0569, lng: 14.5058 },
]

// Great-circle distance in km between two lat/lng points.
function distanceKm(a, b) {
  const R = 6371, toRad = d => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng)
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

function cityIcon(num, color) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);">${num}</div>`,
    iconSize: [28, 28], iconAnchor: [14, 14],
  })
}

function FitBounds({ points }) {
  const map = useMap()
  const key = points.map(p => `${p.lat},${p.lng}`).join('|')
  useEffect(() => {
    if (points.length === 0) return
    let cancelled = false, frame = 0
    const fit = () => {
      map.invalidateSize()
      if (points.length === 1) map.setView([points[0].lat, points[0].lng], 6)
      else map.fitBounds(L.latLngBounds(points.map(p => [p.lat, p.lng])), { padding: [40, 40] })
    }
    const attempt = (t) => {
      if (cancelled) return
      const s = map.getSize()
      if (s.x > 0 && s.y > 0) fit()
      else if (t < 30) frame = requestAnimationFrame(() => attempt(t + 1))
    }
    map.whenReady(() => attempt(0))
    return () => { cancelled = true; if (frame) cancelAnimationFrame(frame) }
  }, [key])
  return null
}

// Driving/transit route through the cities, in order, for Google Maps.
function cityRouteUrl(points) {
  if (points.length === 0) return null
  const pts = points.map(p => `${p.lat},${p.lng}`)
  if (pts.length === 1) return `https://www.google.com/maps/search/?api=1&query=${pts[0]}`
  const origin = pts[0], destination = pts[pts.length - 1]
  const waypoints = pts.slice(1, -1).join('|')
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}&travelmode=transit`
}

function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
}
function UpIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
}
function DownIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
}
function StarIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
}

export default function Cities() {
  const { cities, places, hotels, cityDayCount, addCity, removeCity, setCityDayCount, reorderCities, setStartCity } = useData()
  const [adding, setAdding] = useState(false)
  const [showMap, setShowMap] = useState(true)
  const [showSuggest, setShowSuggest] = useState(false)
  const emptyForm = { name: '', country: '', flag: '📍', color: COLORS[0], lat: null, lng: null }
  const [form, setForm] = useState(emptyForm)

  const totalDays = cities.reduce((s, c) => s + cityDayCount(c.id), 0)

  // Suggest nearby cities: rank candidates (not already added) by their distance
  // to the closest city already on the trip. With no coordinates yet, fall back
  // to a sensible default order.
  const suggestions = useMemo(() => {
    const added = new Set(cities.map(c => (c.name || '').trim().toLowerCase()))
    const anchors = cities
      .map(c => (typeof c.lat === 'number' && typeof c.lng === 'number')
        ? { lat: c.lat, lng: c.lng }
        : cityCenterOf([...(places[c.id] || []), ...(hotels[c.id] || [])]))
      .filter(Boolean)
    const candidates = EUROPE_CITIES.filter(c => !added.has(c.name.toLowerCase()))
    if (anchors.length === 0) return candidates.slice(0, 6).map(c => ({ ...c, dist: null }))
    return candidates
      .map(c => ({ ...c, dist: Math.min(...anchors.map(a => distanceKm(a, c))) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 6)
  }, [cities, places, hotels])

  // Each city's location → route points, in trip order. Prefer the city's own
  // saved coordinates (from map search); fall back to the centre of its places/hotels.
  const routePoints = useMemo(() => {
    const out = []
    cities.forEach((c, i) => {
      const center = (typeof c.lat === 'number' && typeof c.lng === 'number')
        ? { lat: c.lat, lng: c.lng }
        : cityCenterOf([...(places[c.id] || []), ...(hotels[c.id] || [])])
      if (center) out.push({ ...center, id: c.id, name: c.name, flag: c.flag, color: c.color, rank: i + 1 })
    })
    return out
  }, [cities, places, hotels])

  const routeUrl = cityRouteUrl(routePoints)
  const mapKey = routePoints.map(p => p.id).join('|')

  const handleRemove = (c) => {
    if (confirm(`Remove ${c.name} from your trip? Its days will be deleted.`)) removeCity(c.id)
  }

  const closeAdd = () => { setAdding(false); setForm(emptyForm) }

  const handleAdd = () => {
    if (!form.name.trim()) return
    addCity(form)
    closeAdd()
  }

  // Add a suggested city straight to the trip (coords included, colour cycled).
  const handleAddSuggestion = (s) => {
    addCity({
      name: s.name, country: s.country, flag: flagForCountry(s.country),
      color: COLORS[cities.length % COLORS.length], lat: s.lat, lng: s.lng,
    })
  }

  // Picked a city from map search: fill the form (name, country, flag, coords).
  const handlePick = (r) => {
    const country = (r.address || '').split(',').map(s => s.trim()).filter(Boolean).pop() || ''
    setForm(f => ({
      ...f,
      name: r.name || f.name,
      country,
      flag: flagForCountry(country),
      lat: typeof r.lat === 'number' ? r.lat : null,
      lng: typeof r.lng === 'number' ? r.lng : null,
    }))
  }

  return (
    <div className="content">
      <div className="place-card" style={{ borderLeftColor: '#3b82f6', marginBottom: 16 }}>
        <div className="place-name">🗺️ Your Route</div>
        <div className="place-desc">
          Cities are visited in this order. The first one is your <strong>start</strong>.
          Reorder with the arrows, set how many days to spend, and add cities one by one.
          Total: <strong>{totalDays} {totalDays === 1 ? 'day' : 'days'}</strong>.
        </div>
      </div>

      <div className="cities-map-bar">
        <button type="button" className="cities-map-toggle" onClick={() => setShowMap(s => !s)}>
          {showMap ? '▾ Hide map' : '▸ Show route map'}
        </button>
        {routeUrl && (
          <a className="gmaps-btn" href={routeUrl} target="_blank" rel="noreferrer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            Route
          </a>
        )}
      </div>

      {showMap && (
        <div className="cities-map">
          {routePoints.length === 0 ? (
            <div className="cities-map-empty">Add places to your cities so they can be pinned on the map.</div>
          ) : (
            <MapContainer key={mapKey} center={[routePoints[0].lat, routePoints[0].lng]} zoom={5} style={{ width: '100%', height: '100%' }} zoomControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>' />
              <FitBounds points={routePoints} />
              {routePoints.length > 1 && (
                <Polyline positions={routePoints.map(p => [p.lat, p.lng])} pathOptions={{ color: '#2563eb', weight: 3, dashArray: '6 8', opacity: 0.8 }} />
              )}
              {routePoints.map(p => (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={cityIcon(p.rank, p.color)}>
                  <Tooltip direction="top" offset={[0, -14]}>{p.flag} {p.name}</Tooltip>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      )}

      <div className="city-manage-list">
        {cities.map((c, i) => {
          const days = cityDayCount(c.id)
          const isStart = i === 0
          return (
            <div key={c.id} className={`city-route-row ${isStart ? 'is-start' : ''}`}>
              <div className="city-route-rank">{i + 1}</div>
              <span className="city-manage-flag">{c.flag}</span>
              <div className="city-manage-info">
                <div className="city-manage-name">
                  {c.name}
                  {isStart && <span className="start-badge"><StarIcon /> Start</span>}
                </div>
                {c.country && <div className="city-manage-country">{c.country}</div>}
              </div>

              <div className="day-stepper">
                <button type="button" onClick={() => setCityDayCount(c.id, days - 1)} disabled={days <= 1} aria-label="Fewer days">−</button>
                <span className="day-stepper-val">{days} {days === 1 ? 'day' : 'days'}</span>
                <button type="button" onClick={() => setCityDayCount(c.id, days + 1)} aria-label="More days">+</button>
              </div>

              <div className="city-route-actions">
                <div className="move-col">
                  <button type="button" className="move-btn" onClick={() => reorderCities(i, i - 1)} disabled={i === 0} aria-label="Move up"><UpIcon /></button>
                  <button type="button" className="move-btn" onClick={() => reorderCities(i, i + 1)} disabled={i === cities.length - 1} aria-label="Move down"><DownIcon /></button>
                </div>
                {!isStart && (
                  <button type="button" className="set-start-btn" onClick={() => setStartCity(c.id)} title="Make this the starting city">Set start</button>
                )}
                <button className="action-btn delete" onClick={() => handleRemove(c)} aria-label="Remove city"><TrashIcon /></button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="city-add-actions">
        <button type="button" className="btn-suggest" onClick={() => setAdding(true)}>
          + Add next city
        </button>
        <button type="button" className="btn-suggest secondary" onClick={() => setShowSuggest(s => !s)}>
          {showSuggest ? '✕ Hide suggestions' : '✨ Suggest cities'}
        </button>
      </div>

      {showSuggest && (
        <div className="suggest-panel">
          <div className="suggest-head">
            {cities.length
              ? 'Cities close to your route — tap to add'
              : 'Popular European cities to get you started'}
          </div>
          {suggestions.length === 0 ? (
            <div className="add-city-empty">No more suggestions — you've added them all!</div>
          ) : (
            suggestions.map(s => (
              <div key={s.name} className="suggest-row">
                <span className="city-manage-flag">{flagForCountry(s.country)}</span>
                <div className="city-manage-info">
                  <div className="city-manage-name">{s.name}</div>
                  <div className="city-manage-country">
                    {s.country}{s.dist != null && ` · ${Math.round(s.dist)} km away`}
                  </div>
                </div>
                <button type="button" className="set-start-btn" onClick={() => handleAddSuggestion(s)}>+ Add</button>
              </div>
            ))
          )}
        </div>
      )}

      {adding && (
        <Modal title="Add a city" onClose={closeAdd}>
          <div className="edit-form">
            <p className="add-city-hint">Search for the city, then tap a result. We'll fill in the rest.</p>

            <PlaceSearch cityName="" includedPrimaryTypes={['locality']} onPick={handlePick} />

            {form.name ? (
              <div className="add-city-preview">
                <span className="add-city-preview-flag">{form.flag}</span>
                <div className="add-city-preview-info">
                  <div className="add-city-preview-name">{form.name}</div>
                  <div className="add-city-preview-sub">
                    {form.country || 'Country unknown'}
                    {form.lat != null ? ` · 📍 ${form.lat.toFixed(2)}, ${form.lng.toFixed(2)}` : ' · not pinned yet'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="add-city-empty">No city selected yet.</div>
            )}

            <details className="add-city-details">
              <summary>Edit details</summary>
              <div className="form-row" style={{ marginTop: 8 }}>
                <label style={{ flex: '0 0 84px' }}>Flag
                  <input value={form.flag} onChange={e => setForm(f => ({ ...f, flag: e.target.value }))} placeholder="🇩🇪" />
                </label>
                <label style={{ flex: 2 }}>City name
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Hamburg" />
                </label>
              </div>
              <label>Country
                <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="e.g. Germany" />
              </label>
            </details>

            <label style={{ marginBottom: 2 }}>Map color</label>
            <div className="color-swatches">
              {COLORS.map(col => (
                <button
                  key={col}
                  type="button"
                  className={`color-swatch ${form.color === col ? 'active' : ''}`}
                  style={{ background: col }}
                  onClick={() => setForm(f => ({ ...f, color: col }))}
                  aria-label={`Color ${col}`}
                />
              ))}
            </div>

            <button type="button" className="btn-save" onClick={handleAdd} disabled={!form.name.trim()}>
              Add {form.name ? form.name : 'city'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

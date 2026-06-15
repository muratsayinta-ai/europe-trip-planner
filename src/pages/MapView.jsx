import { useState, useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useData } from '../context/DataContext'
import ReorderList from '../components/ReorderList'
import { estimateLeg, googleLegs, hasApiKey, fmtKm, fmtMin } from '../lib/travel'

// Fix leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function numberedIcon(num, color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${color};color:white;
      width:30px;height:30px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:13px;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    ">${num}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  })
}

// Leaflet measures its container once; when we toggle full-screen the box
// changes size, so we must tell it to re-measure or tiles render at the old size.
function InvalidateOnResize({ trigger }) {
  const map = useMap()
  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 220)
    return () => clearTimeout(id)
  }, [trigger])
  return null
}

function ExpandIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
}
function CollapseIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/></svg>
}

// Per-day travel summary: walking (or transit) distance + time between the day's
// stops, optionally starting from the hotel. Shows an instant offline estimate
// for walking; "Get exact times" upgrades to real Google routing (and is the
// only way to get transit times). Results are cached per mode + stop list.
function TravelSummary({ stops, hotel }) {
  const points = useMemo(() => {
    const valid = stops.filter(s => typeof s.lat === 'number' && typeof s.lng === 'number')
    return (hotel && hotel.lat && hotel.lng)
      ? [{ lat: hotel.lat, lng: hotel.lng, name: '🏨 Hotel' }, ...valid]
      : valid
  }, [stops, hotel])
  const sig = points.map(p => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join('|')

  const [mode, setMode] = useState('walking')
  const [cache, setCache] = useState({}) // `${mode}|${sig}` -> legs[]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Reset transient UI when the day (stop list) changes.
  useEffect(() => { setError(null) }, [sig])

  const cacheKey = `${mode}|${sig}`
  const exact = cache[cacheKey]

  const offline = useMemo(() => {
    if (points.length < 2) return null
    return points.slice(0, -1).map((p, i) => estimateLeg(p, points[i + 1], mode))
  }, [points, mode])

  // Walking shows the estimate right away; transit has no meaningful offline
  // estimate, so it stays empty until fetched from Google.
  const legs = exact || (mode === 'walking' ? offline : null)

  const fetchExact = async () => {
    if (points.length < 2) return
    setLoading(true); setError(null)
    try {
      const res = await googleLegs(points, mode)
      setCache(c => ({ ...c, [cacheKey]: res }))
    } catch (e) {
      setError(e.message === 'no-key' ? 'no-key' : 'failed')
    } finally {
      setLoading(false)
    }
  }

  if (points.length < 2) return null

  const totalKm = legs ? legs.reduce((s, l) => s + l.km, 0) : 0
  const totalMin = legs ? legs.reduce((s, l) => s + l.min, 0) : 0
  const isEstimate = legs && !exact

  return (
    <div className="travel-summary">
      <div className="travel-head">
        <div className="travel-mode-toggle">
          <button className={mode === 'walking' ? 'active' : ''} onClick={() => setMode('walking')}>🚶 Walk</button>
          <button className={mode === 'transit' ? 'active' : ''} onClick={() => setMode('transit')}>🚌 Transit</button>
        </div>
        {legs && (
          <div className="travel-total">
            {fmtKm(totalKm)} · {fmtMin(totalMin)}
            {isEstimate && <span className="travel-est">≈ est.</span>}
          </div>
        )}
      </div>

      {legs ? (
        <div className="travel-legs">
          {legs.map((l, i) => (
            <div key={i} className="travel-leg">
              <span className="travel-leg-route">{points[i].name} → {points[i + 1].name}</span>
              <span className="travel-leg-num">{fmtKm(l.km)} · {fmtMin(l.min)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="travel-empty">Transit times come from Google — tap below.</div>
      )}

      {error === 'no-key' && (
        <div className="travel-note">Add a Google API key (Places search settings) to get exact and transit times.</div>
      )}
      {error === 'failed' && (
        <div className="travel-note">
          Couldn’t get exact times{mode === 'walking' ? ' — showing the offline estimate' : ''}. Make sure the
          “Directions API” is enabled for your Google key, and you’re online.
        </div>
      )}

      {hasApiKey() && (
        <button className="travel-exact-btn" onClick={fetchExact} disabled={loading}>
          {loading ? 'Getting times…' : exact ? '✓ Google times · refresh' : `Get exact ${mode} times from Google`}
        </button>
      )}
    </div>
  )
}

function FitBounds({ markers }) {
  const map = useMap()
  const key = markers.map(m => `${m.lat},${m.lng}`).join('|')
  useEffect(() => {
    if (markers.length === 0) return
    let cancelled = false
    let frame = 0

    const fit = () => {
      map.invalidateSize()
      if (markers.length === 1) {
        map.setView([markers[0].lat, markers[0].lng], 14)
      } else {
        const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]))
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
      }
    }

    // Wait until the map container actually has a non-zero size before
    // fitting — Leaflet falls back to maxZoom when it measures a 0px height
    // (which happens during the flex layout pass on first paint).
    const attempt = (tries) => {
      if (cancelled) return
      const size = map.getSize()
      if (size.x > 0 && size.y > 0) {
        fit()
      } else if (tries < 30) {
        frame = requestAnimationFrame(() => attempt(tries + 1))
      }
    }

    map.whenReady(() => attempt(0))

    return () => {
      cancelled = true
      if (frame) cancelAnimationFrame(frame)
    }
  }, [key])
  return null
}

// Build a name→{lat,lng} lookup from the current places (lets name-only activities still map)
function buildCoordsLookup(places) {
  const lookup = {}
  Object.values(places).flat().forEach(p => {
    if (p.lat && p.lng) lookup[p.name.toLowerCase()] = { lat: p.lat, lng: p.lng }
  })
  return lookup
}

function getCoords(activity, coordsLookup) {
  if (activity.lat && activity.lng) return { lat: activity.lat, lng: activity.lng }
  return coordsLookup[activity.name?.toLowerCase()] || null
}

// Build a Google Maps walking-directions link. When `start` (the hotel) is
// given, the route literally begins there before the day's stops.
function buildGoogleMapsUrl(markers, start) {
  if (markers.length === 0) return null
  const pts = markers.map(m => `${m.lat},${m.lng}`)
  if (start) pts.unshift(`${start.lat},${start.lng}`)
  if (pts.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${pts[0]}`
  }
  const origin = pts[0]
  const destination = pts[pts.length - 1]
  const waypoints = pts.slice(1, -1).join('|')
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}&travelmode=walking`
}

const keyOf = a => a.name

// Distinct colors used to group stops by day on the city map.
const DAY_PALETTE = ['#2563eb', '#7c3aed', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#0ea5e9']

export default function MapView() {
  const { cities, itinerary, places, optimizeDay, reorderActivity, hotelAnchor, setPlaceDay } = useData()
  const [groupMode, setGroupMode] = useState('day') // 'day' | 'city'
  const [selectedDay, setSelectedDay] = useState(itinerary[0]?.day || 1)
  const tripCityIds = useMemo(() => [...new Set(itinerary.map(d => d.city))], [itinerary])
  const [selectedCity, setSelectedCity] = useState(tripCityIds[0] || 'paris')
  const [mapVisible, setMapVisible] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const dayRowRef = useRef(null)

  // Let the device back gesture / Esc key leave full screen.
  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e) => { if (e.key === 'Escape') setFullscreen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fullscreen])

  const coordsLookup = useMemo(() => buildCoordsLookup(places), [places])
  const isCity = groupMode === 'city'

  // Keep the selected day valid when days are added/removed.
  useEffect(() => {
    if (!itinerary.some(d => d.day === selectedDay)) {
      setSelectedDay(itinerary[0]?.day || 1)
    }
  }, [itinerary, selectedDay])

  // Keep the selected city valid when cities are added/removed.
  useEffect(() => {
    if (tripCityIds.length && !tripCityIds.includes(selectedCity)) {
      setSelectedCity(tripCityIds[0])
    }
  }, [tripCityIds, selectedCity])

  // ─── DAY MODE ───
  const day = itinerary.find(d => d.day === selectedDay)
  const dayCity = cities.find(c => c.id === day?.city)

  const dayMarkers = useMemo(() => (
    (day?.activities || [])
      .map(act => {
        const coords = getCoords(act, coordsLookup)
        return coords ? { ...act, ...coords } : null
      })
      .filter(Boolean)
      .map((m, i) => ({ ...m, index: i + 1 }))
  ), [day, coordsLookup])

  // Original day.activities indices of the mapped stops, so drag-reorder writes back.
  const dayMappedIndices = useMemo(() => {
    const out = []
    ;(day?.activities || []).forEach((act, i) => { if (getCoords(act, coordsLookup)) out.push(i) })
    return out
  }, [day, coordsLookup])

  const handleDayReorder = (from, to) => {
    if (dayMappedIndices[from] == null || dayMappedIndices[to] == null) return
    reorderActivity(selectedDay, dayMappedIndices[from], dayMappedIndices[to])
  }

  // ─── CITY MODE ───
  const selCity = cities.find(c => c.id === selectedCity)
  const cityDays = useMemo(() => itinerary.filter(d => d.city === selectedCity), [itinerary, selectedCity])

  // Assign each of the city's days a distinct color, so stops can be grouped by day on the map.
  const dayColors = useMemo(() => {
    const m = {}
    cityDays.forEach((d, i) => { m[d.day] = DAY_PALETTE[i % DAY_PALETTE.length] })
    return m
  }, [cityDays])
  const colorForDay = (dayNum) => dayColors[dayNum] || '#2563eb'

  // All activities across the city's days, tagged with their current day + coords.
  const cityActsRaw = useMemo(() => {
    const out = []
    cityDays.forEach(d => (d.activities || []).forEach(a => {
      const coords = getCoords(a, coordsLookup)
      out.push({ ...a, ...(coords || {}), _day: d.day, _hasCoords: !!coords })
    }))
    return out
  }, [cityDays, coordsLookup])

  // Stops are listed strictly by day (ascending), keeping each day's own order.
  // cityActsRaw is already built by iterating the city's days in order, so a
  // Day 10 stop can never appear after a Day 11 stop.
  const cityList = cityActsRaw
  const cityMarkers = useMemo(() => {
    let n = 0
    const out = []
    cityList.forEach(a => { if (a._hasCoords) { n++; out.push({ ...a, index: n }) } })
    return out
  }, [cityList])
  const cityIndexByKey = useMemo(() => {
    const m = {}
    cityMarkers.forEach(x => { m[keyOf(x)] = x.index })
    return m
  }, [cityMarkers])

  // Drag-reorder is allowed only within the same day, so the by-day grouping
  // stays intact. To move a stop to another day, use its day selector.
  const handleCityReorder = (from, to) => {
    const a = cityList[from], b = cityList[to]
    if (!a || !b || a._day !== b._day) return
    const acts = (itinerary.find(d => d.day === a._day)?.activities) || []
    const fromIdx = acts.findIndex(x => x.name === a.name)
    const toIdx = acts.findIndex(x => x.name === b.name)
    if (fromIdx < 0 || toIdx < 0) return
    reorderActivity(a._day, fromIdx, toIdx)
  }

  // Optimize each of the city's days into its own shortest route (day grouping kept).
  const optimizeCity = () => {
    cityDays.forEach(d => optimizeDay(d.day))
  }

  // ─── Active view (shared map + route) ───
  const markers = isCity ? cityMarkers : dayMarkers
  const markerColor = (isCity ? selCity?.color : dayCity?.color) || '#2563eb'
  const hotelStart = isCity ? hotelAnchor(selectedCity) : (day ? hotelAnchor(day.city) : null)
  const gmapsUrl = buildGoogleMapsUrl(markers, hotelStart)
  const defaultCenter = markers.length > 0 ? [markers[0].lat, markers[0].lng] : [48.8566, 2.3522]
  const mapKey = isCity ? `city-${selectedCity}` : `day-${selectedDay}`

  // scroll active pill into view
  useEffect(() => {
    const el = dayRowRef.current?.querySelector('.day-pill.active')
    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selectedDay, selectedCity, groupMode])

  return (
    <div className="map-page">
      {/* Group-by toggle + city manager */}
      <div className="map-mode-toggle">
        <button className={!isCity ? 'active' : ''} onClick={() => setGroupMode('day')}>📅 By day</button>
        <button className={isCity ? 'active' : ''} onClick={() => setGroupMode('city')}>🏙 By city</button>
      </div>

      {/* Selector pills */}
      <div className="day-pill-row" ref={dayRowRef}>
        {!isCity && itinerary.map(d => {
          const c = cities.find(x => x.id === d.city)
          return (
            <button
              key={d.day}
              className={`day-pill ${selectedDay === d.day ? 'active' : ''}`}
              onClick={() => setSelectedDay(d.day)}
            >
              <span className="pill-num">{d.day}</span>
              <span className="pill-city">{c?.flag}</span>
            </button>
          )
        })}
        {isCity && tripCityIds.map(id => {
          const c = cities.find(x => x.id === id)
          return (
            <button
              key={id}
              className={`day-pill city-pill ${selectedCity === id ? 'active' : ''}`}
              onClick={() => setSelectedCity(id)}
            >
              <span className="pill-city">{c?.flag}</span>
              <span className="pill-cityname">{c?.name}</span>
            </button>
          )
        })}
      </div>

      {/* Info bar */}
      <div className="map-day-bar">
        <div className="map-day-info">
          {isCity ? (
            <>
              <span className="map-day-title">{selCity?.flag} {selCity?.name} — all stops</span>
              <span className="map-day-city">{cityMarkers.length} mapped · grouped by day · drag within a day, or change a stop's day</span>
            </>
          ) : (
            <>
              <span className="map-day-title">{dayCity?.flag} Day {selectedDay} — {day?.title}</span>
              <span className="map-day-city">{dayCity?.name}, {dayCity?.country}</span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="optimize-btn"
            onClick={() => setMapVisible(v => !v)}
            title={mapVisible ? 'Hide map' : 'Show map'}
          >
            {mapVisible ? '▾ Map' : '▸ Map'}
          </button>
          {markers.length > 2 && (
            <button
              className="optimize-btn"
              onClick={() => isCity ? optimizeCity() : optimizeDay(selectedDay)}
              title="Order stops by closeness (from your hotel)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
              Optimize
            </button>
          )}
          {gmapsUrl && (
            <a className="gmaps-btn" href={gmapsUrl} target="_blank" rel="noreferrer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              Route
            </a>
          )}
        </div>
      </div>

      {/* Day legend (city mode) — which color is which day */}
      {isCity && mapVisible && cityDays.length > 0 && (
        <div className="day-legend">
          {cityDays.map(d => (
            <span key={d.day} className="day-legend-chip">
              <span className="day-legend-dot" style={{ background: colorForDay(d.day) }} />
              Day {d.day}
            </span>
          ))}
        </div>
      )}

      {/* Map */}
      {mapVisible && (
        <div className={`map-container ${fullscreen ? 'fullscreen' : ''}`}>
          <button
            className="map-fs-btn"
            onClick={() => setFullscreen(f => !f)}
            aria-label={fullscreen ? 'Exit full screen' : 'Full screen map'}
            title={fullscreen ? 'Exit full screen' : 'Full screen'}
          >
            {fullscreen ? <CollapseIcon /> : <ExpandIcon />}
          </button>
          <MapContainer
            key={mapKey}
            center={defaultCenter}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            />
            <InvalidateOnResize trigger={fullscreen} />
            <FitBounds markers={markers} />
            {markers.map((m) => (
              <Marker
                key={m.index}
                position={[m.lat, m.lng]}
                icon={numberedIcon(m.index, isCity ? colorForDay(m._day) : markerColor)}
              >
                <Popup>
                  <div style={{ minWidth: 140 }}>
                    <strong style={{ fontSize: '0.88rem' }}>{m.name}</strong><br />
                    {isCity && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Day {m._day}</span>}
                    {isCity && (m.duration || m.rating) ? <br /> : null}
                    {m.duration && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>⏱ {m.duration}</span>}
                    {m.rating ? <span style={{ fontSize: '0.75rem', color: '#6b7280' }}> · ⭐ {m.rating}</span> : null}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          {markers.length === 0 && (
            <div className="map-empty-overlay">
              <div>📍 No mapped locations {isCity ? 'in this city' : 'for this day'}.<br /><span>Add places from the Places tab to see them here.</span></div>
            </div>
          )}
        </div>
      )}

      {/* Per-day travel times (walking / transit) — day view only */}
      {!isCity && <TravelSummary stops={dayMarkers} hotel={hotelStart} />}

      {/* Activity list below map */}
      <div className={`map-activity-list ${!mapVisible ? 'expanded' : ''}`}>
        {isCity ? (
          <ReorderList
            items={cityList}
            itemKey={(a) => keyOf(a)}
            onReorder={handleCityReorder}
            rowClassName="map-act-row"
            renderItem={(a) => (
              <>
                <div className="map-act-num" style={{ background: a._hasCoords ? colorForDay(a._day) : '#cbd5e1' }}>
                  {cityIndexByKey[keyOf(a)] || '·'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="map-act-name">{a.name}</div>
                  <div className="map-act-dur">
                    {a.duration && `⏱ ${a.duration}`}
                    {a.duration && a.rating ? ' · ' : ''}
                    {a.rating ? `⭐ ${a.rating}` : ''}
                  </div>
                </div>
                <select
                  className="city-day-select"
                  value={a._day}
                  onChange={e => setPlaceDay(selectedCity, a, Number(e.target.value))}
                >
                  {cityDays.map(d => <option key={d.day} value={d.day}>Day {d.day}</option>)}
                </select>
              </>
            )}
          />
        ) : (markers.length === 0 && (day?.activities || []).length > 0 ? (
          <div style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#6b7280' }}>
            {(day?.activities || []).map((act, i) => (
              <div key={i} className="map-act-row">
                <div className="map-act-num" style={{ background: markerColor }}>?</div>
                <div className="map-act-name">{act.name}</div>
                {act.duration && <div className="map-act-dur">{act.duration}</div>}
              </div>
            ))}
          </div>
        ) : (
          <ReorderList
            items={dayMarkers}
            itemKey={(m) => `${m.name}-${m.lat}`}
            onReorder={handleDayReorder}
            rowClassName="map-act-row"
            renderItem={(m) => (
              <>
                <div className="map-act-num" style={{ background: markerColor }}>{m.index}</div>
                <div>
                  <div className="map-act-name">{m.name}</div>
                  <div className="map-act-dur">
                    {m.duration && `⏱ ${m.duration}`}
                    {m.duration && m.rating ? ' · ' : ''}
                    {m.rating ? `⭐ ${m.rating}` : ''}
                  </div>
                </div>
              </>
            )}
          />
        ))}
        {!isCity && day?.notes && (
          <div className="map-notes">{day.notes}</div>
        )}
      </div>
    </div>
  )
}

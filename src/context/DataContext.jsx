import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { cities as defaultCities, places as defaultPlaces, restaurants as defaultRestaurants, hotels as defaultHotels, itinerary as defaultItinerary } from '../data/tripData'
import { optimizeOrder } from '../lib/route'
import { syncEnabled, getTripId, fetchTrip, pushTrip, subscribeTrip } from '../lib/sync'

const norm = s => (s || '').trim().toLowerCase()
const hasCoords = a => typeof a.lat === 'number' && typeof a.lng === 'number'

// Re-number itinerary days 1..N after inserts/removals.
const renumber = (arr) => arr.map((d, i) => ({ ...d, day: i + 1 }))

// Reorder a day's activities into the shortest walking path. Activities without
// coordinates can't be routed, so they're kept (in their existing order) at the end.
// `start` (the day's hotel) anchors the route to begin from there.
function optimizeActivities(activities, start) {
  const withCoords = activities.filter(hasCoords)
  const without = activities.filter(a => !hasCoords(a))
  return [...optimizeOrder(withCoords, { start }), ...without]
}

// Resolve itinerary activities from place IDs to plain objects for easy editing
function resolveItinerary(itinerary, places) {
  return itinerary.map(day => ({
    ...day,
    activities: day.activities.map(id => {
      const p = (places[day.city] || []).find(x => x.id === id)
      return p ? { name: p.name, duration: p.duration, rating: p.rating, lat: p.lat, lng: p.lng } : { name: id, duration: '', rating: '' }
    })
  }))
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

// Backfill lat/lng onto stored places saved before coordinates existed.
// Matches each stored place to a default place by id, then by name.
function migrateCoords(stored) {
  const byId = {}
  const byName = {}
  Object.values(defaultPlaces).flat().forEach(p => {
    if (p.lat && p.lng) {
      byId[p.id] = { lat: p.lat, lng: p.lng }
      byName[p.name.toLowerCase()] = { lat: p.lat, lng: p.lng }
    }
  })
  const result = {}
  for (const cityId of Object.keys(stored)) {
    result[cityId] = stored[cityId].map(p => {
      if (p.lat && p.lng) return p
      const coords = byId[p.id] || byName[p.name?.toLowerCase()]
      return coords ? { ...p, ...coords } : p
    })
  }
  return result
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [cities, setCities] = useState(() => load('trip_cities', defaultCities))
  const [places, setPlaces] = useState(() => migrateCoords(load('trip_places', defaultPlaces)))
  const [restaurants, setRestaurants] = useState(() => load('trip_restaurants', defaultRestaurants))
  const [hotels, setHotels] = useState(() => load('trip_hotels', defaultHotels))
  const [itinerary, setItinerary] = useState(() =>
    load('trip_itinerary', resolveItinerary(defaultItinerary, defaultPlaces))
  )
  const [videos, setVideos] = useState(() => load('trip_videos', {}))

  useEffect(() => { save('trip_cities', cities) }, [cities])
  useEffect(() => { save('trip_places', places) }, [places])
  useEffect(() => { save('trip_restaurants', restaurants) }, [restaurants])
  useEffect(() => { save('trip_hotels', hotels) }, [hotels])
  useEffect(() => { save('trip_itinerary', itinerary) }, [itinerary])
  useEffect(() => { save('trip_videos', videos) }, [videos])

  // --- Shared sync (Supabase) ---
  // localStorage above is the offline cache; this layer shares one JSON snapshot
  // of the whole trip with friends. Last-write-wins, with realtime live updates.
  const tripId = useRef(getTripId()).current
  const revRef = useRef(Number(load('trip_rev', 0)) || 0)
  const applyingRemote = useRef(false) // true while we hydrate from a remote snapshot
  const ready = useRef(false)          // becomes true after the initial sync handshake
  const pushTimer = useRef(null)
  const [syncStatus, setSyncStatus] = useState(syncEnabled ? 'connecting' : 'local')

  const snapshot = () => ({ cities, places, restaurants, hotels, itinerary, videos })
  const applySnapshot = (d) => {
    if (!d) return
    applyingRemote.current = true
    if (d.cities) setCities(d.cities)
    if (d.places) setPlaces(d.places)
    if (d.restaurants) setRestaurants(d.restaurants)
    if (d.hotels) setHotels(d.hotels)
    if (d.itinerary) setItinerary(d.itinerary)
    if (d.videos) setVideos(d.videos)
  }

  // Initial handshake: pull the shared copy and hydrate if it's newer; otherwise
  // seed the shared copy with what's on this device. Then subscribe to live edits.
  useEffect(() => {
    if (!syncEnabled) { ready.current = true; return }
    let cancelled = false
    let unsub = () => {}
    ;(async () => {
      const remote = await fetchTrip(tripId)
      if (cancelled) return
      if (remote && remote.rev > revRef.current) {
        revRef.current = remote.rev; save('trip_rev', remote.rev)
        applySnapshot(remote.data)
      } else if (!remote || remote.rev < revRef.current) {
        const rev = revRef.current || Date.now()
        revRef.current = rev; save('trip_rev', rev)
        pushTrip(tripId, snapshot(), rev)
      }
      unsub = subscribeTrip(tripId, ({ data, rev }) => {
        if (rev <= revRef.current) return // our own echo or a stale message
        revRef.current = rev; save('trip_rev', rev)
        applySnapshot(data)
      })
      setSyncStatus('synced')
      ready.current = true
    })()
    return () => { cancelled = true; unsub() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Push local changes (debounced). Skips the pre-sync window and remote-applied
  // updates so we don't echo a change we just received back to the server.
  useEffect(() => {
    if (!ready.current || !syncEnabled) return
    if (applyingRemote.current) { applyingRemote.current = false; return }
    const rev = Date.now()
    revRef.current = rev; save('trip_rev', rev)
    const snap = snapshot()
    clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(() => { pushTrip(tripId, snap, rev) }, 800)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities, places, restaurants, hotels, itinerary, videos])

  // --- Places ---
  const addPlace = (cityId, place) => {
    const id = 'p_' + Date.now() + Math.random().toString(36).slice(2, 6)
    const newPlace = { ...place, id }
    setPlaces(prev => ({ ...prev, [cityId]: [...(prev[cityId] || []), newPlace] }))
    return newPlace
  }
  const updatePlace = (cityId, id, updated) => {
    setPlaces(prev => ({ ...prev, [cityId]: prev[cityId].map(p => p.id === id ? { ...p, ...updated } : p) }))
  }
  const deletePlace = (cityId, id) => {
    setPlaces(prev => ({ ...prev, [cityId]: prev[cityId].filter(p => p.id !== id) }))
  }

  // --- Restaurants ---
  const addRestaurant = (cityId, rest) => {
    const id = 'r_' + Date.now()
    setRestaurants(prev => ({ ...prev, [cityId]: [...(prev[cityId] || []), { ...rest, id }] }))
  }
  const updateRestaurant = (cityId, id, updated) => {
    setRestaurants(prev => ({ ...prev, [cityId]: prev[cityId].map(r => r.id === id ? { ...r, ...updated } : r) }))
  }
  const deleteRestaurant = (cityId, id) => {
    setRestaurants(prev => ({ ...prev, [cityId]: prev[cityId].filter(r => r.id !== id) }))
  }

  // --- Hotels ---
  const addHotel = (cityId, hotel) => {
    const id = 'h_' + Date.now()
    setHotels(prev => ({ ...prev, [cityId]: [...(prev[cityId] || []), { ...hotel, id }] }))
  }
  const updateHotel = (cityId, id, updated) => {
    setHotels(prev => ({ ...prev, [cityId]: prev[cityId].map(h => h.id === id ? { ...h, ...updated } : h) }))
  }
  const deleteHotel = (cityId, id) => {
    setHotels(prev => ({ ...prev, [cityId]: prev[cityId].filter(h => h.id !== id) }))
  }

  // --- Videos (YouTube guides per city) ---
  const addVideo = (cityId, video) => {
    const id = 'v_' + Date.now() + Math.random().toString(36).slice(2, 6)
    setVideos(prev => ({ ...prev, [cityId]: [...(prev[cityId] || []), { ...video, id }] }))
  }
  const updateVideo = (cityId, id, updated) => {
    setVideos(prev => ({ ...prev, [cityId]: (prev[cityId] || []).map(v => v.id === id ? { ...v, ...updated } : v) }))
  }
  const deleteVideo = (cityId, id) => {
    setVideos(prev => ({ ...prev, [cityId]: (prev[cityId] || []).filter(v => v.id !== id) }))
  }

  // --- Itinerary ---
  const addDay = (day) => {
    const maxDay = itinerary.reduce((m, d) => Math.max(m, d.day), 0)
    setItinerary(prev => [...prev, { ...day, day: maxDay + 1 }])
  }
  const updateDay = (dayNum, updated) => {
    setItinerary(prev => prev.map(d => d.day === dayNum ? { ...d, ...updated } : d))
  }
  const deleteDay = (dayNum) => {
    setItinerary(prev => prev.filter(d => d.day !== dayNum).map((d, i) => ({ ...d, day: i + 1 })))
  }

  // --- Cities (which cities you visit & for how many days) ---
  const cityDayCount = (cityId) => itinerary.filter(d => d.city === cityId).length

  // Add a brand-new city to the trip (master list + one blank day).
  const addCity = (city) => {
    const base = (city.name || 'city').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'city'
    const existing = new Set(cities.map(c => c.id))
    let id = base, n = 1
    while (existing.has(id)) id = `${base}-${++n}`
    const newCity = {
      id, name: city.name || 'New City', country: city.country || '',
      flag: city.flag || '📍', color: city.color || '#3b82f6', days: 1,
      lat: typeof city.lat === 'number' ? city.lat : null,
      lng: typeof city.lng === 'number' ? city.lng : null,
    }
    setCities(prev => [...prev, newCity])
    setItinerary(prev => renumber([...prev, { city: id, title: `Day in ${newCity.name}`, activities: [], notes: '' }]))
    return newCity
  }

  const updateCity = (id, updated) => {
    setCities(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
  }

  // Reorder the trip's cities. The itinerary day-blocks are reshuffled to follow
  // the new city order, then renumbered, so the whole trip stays consistent.
  const reorderCities = (from, to) => {
    const arr = [...cities]
    if (from < 0 || to < 0 || from >= arr.length || to >= arr.length || from === to) return
    const [moved] = arr.splice(from, 1)
    arr.splice(to, 0, moved)
    setCities(arr)
    setItinerary(it => {
      const known = new Set(arr.map(c => c.id))
      const ordered = arr.flatMap(c => it.filter(d => d.city === c.id))
      const orphans = it.filter(d => !known.has(d.city)) // safety: days w/o a city
      return renumber([...ordered, ...orphans])
    })
  }

  // Make a city the trip's starting point (move it to the front).
  const setStartCity = (cityId) => {
    const idx = cities.findIndex(c => c.id === cityId)
    if (idx > 0) reorderCities(idx, 0)
  }

  // Remove a city from the trip: drop it from the master list and remove all
  // its itinerary days (places/restaurants/hotels are kept in storage).
  const removeCity = (id) => {
    setCities(prev => prev.filter(c => c.id !== id))
    setItinerary(prev => renumber(prev.filter(d => d.city !== id)))
  }

  // Set how many days are spent in a city. Adds blank days right after the
  // city's existing days, or trims from the end; then renumbers the whole trip.
  const setCityDayCount = (cityId, count) => {
    const target = Math.max(0, Math.floor(count) || 0)
    setItinerary(prev => {
      const idxs = prev.map((d, i) => d.city === cityId ? i : -1).filter(i => i >= 0)
      const current = idxs.length
      if (target === current) return prev
      let arr = [...prev]
      if (target > current) {
        const cityName = cities.find(c => c.id === cityId)?.name || ''
        const insertAt = idxs.length ? idxs[idxs.length - 1] + 1 : arr.length
        const toAdd = Array.from({ length: target - current }, () => ({
          city: cityId, title: `Day in ${cityName}`, activities: [], notes: '',
        }))
        arr.splice(insertAt, 0, ...toAdd)
      } else {
        const removeSet = new Set(idxs.slice(target)) // trim from the end
        arr = arr.filter((_, i) => !removeSet.has(i))
      }
      return renumber(arr)
    })
    setCities(prev => prev.map(c => c.id === cityId ? { ...c, days: target } : c))
  }

  // --- Smart scheduling ---
  // Pick the itinerary day for a city whose already-planned activities sit
  // closest (by centroid) to the new place. Falls back to the lightest day.
  const findBestDay = (cityId, place) => {
    const cityDays = itinerary.filter(d => d.city === cityId)
    if (cityDays.length === 0) return null
    if (place.lat && place.lng) {
      let best = null, bestDist = Infinity
      for (const d of cityDays) {
        const coords = d.activities.filter(a => a.lat && a.lng)
        if (coords.length === 0) continue
        const clat = coords.reduce((s, a) => s + a.lat, 0) / coords.length
        const clng = coords.reduce((s, a) => s + a.lng, 0) / coords.length
        const dist = (clat - place.lat) ** 2 + (clng - place.lng) ** 2
        if (dist < bestDist) { bestDist = dist; best = d }
      }
      if (best) return best.day
    }
    let fb = cityDays[0]
    for (const d of cityDays) if (d.activities.length < fb.activities.length) fb = d
    return fb.day
  }
  // The hotel to start a city's daily route from: first hotel with coordinates.
  const hotelAnchor = (cityId) => {
    const h = (hotels[cityId] || []).find(x => typeof x.lat === 'number' && typeof x.lng === 'number')
    return h ? { lat: h.lat, lng: h.lng } : null
  }

  const scheduleOnBestDay = (cityId, place) => {
    const dayNum = findBestDay(cityId, place)
    if (dayNum == null) return null
    const activity = {
      name: place.name, duration: place.duration || '', rating: place.rating || '',
      lat: place.lat, lng: place.lng,
    }
    const start = hotelAnchor(cityId)
    // Append, then re-flow that day into the shortest route (starting from the
    // hotel) so the new stop slots into the most efficient position automatically.
    setItinerary(prev => prev.map(d =>
      d.day === dayNum ? { ...d, activities: optimizeActivities([...d.activities, activity], start) } : d
    ))
    return dayNum
  }

  // Which itinerary day currently contains this place (matched by name within
  // the city). Returns the day number, or null if it isn't scheduled anywhere.
  const dayForPlace = (cityId, placeName) => {
    const d = itinerary.find(day => day.city === cityId
      && (day.activities || []).some(a => norm(a.name) === norm(placeName)))
    return d ? d.day : null
  }

  // Move a place to a specific day (or unschedule it with targetDay = null).
  // Removes any existing copy from the city's days first, then appends.
  const setPlaceDay = (cityId, place, targetDay) => {
    setItinerary(prev => {
      const cleaned = prev.map(d => d.city === cityId
        ? { ...d, activities: (d.activities || []).filter(a => norm(a.name) !== norm(place.name)) }
        : d)
      if (targetDay == null) return cleaned
      const activity = {
        name: place.name, duration: place.duration || '', rating: place.rating || '',
        lat: place.lat ?? null, lng: place.lng ?? null,
      }
      return cleaned.map(d => d.day === targetDay
        ? { ...d, activities: [...(d.activities || []), activity] } : d)
    })
  }

  // Move an activity from one position to another within its day (for drag-reorder).
  const reorderActivity = (dayNum, from, to) => {
    setItinerary(prev => prev.map(d => {
      if (d.day !== dayNum) return d
      const acts = [...d.activities]
      if (from < 0 || from >= acts.length || to < 0 || to >= acts.length || from === to) return d
      const [moved] = acts.splice(from, 1)
      acts.splice(to, 0, moved)
      return { ...d, activities: acts }
    }))
  }

  // Reorder a day into the shortest walking route, starting from the hotel.
  const optimizeDay = (dayNum) => {
    setItinerary(prev => prev.map(d => {
      if (d.day !== dayNum) return d
      return { ...d, activities: optimizeActivities(d.activities || [], hotelAnchor(d.city)) }
    }))
  }

  return (
    <DataContext.Provider value={{
      cities, places, restaurants, hotels, itinerary, videos,
      addVideo, updateVideo, deleteVideo,
      addPlace, updatePlace, deletePlace, findBestDay, scheduleOnBestDay,
      dayForPlace, setPlaceDay, reorderActivity, optimizeDay, hotelAnchor,
      addRestaurant, updateRestaurant, deleteRestaurant,
      addHotel, updateHotel, deleteHotel,
      addDay, updateDay, deleteDay,
      cityDayCount, addCity, updateCity, removeCity, setCityDayCount,
      reorderCities, setStartCity,
      syncStatus, tripId,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}

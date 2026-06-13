import { useState, useEffect, useRef } from 'react'
import { loadGoogleMaps, getApiKey, setApiKey, disableApiKey, formatCount } from '../lib/googleMaps'

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : ''

const PRICE_MAP = {
  FREE: '€', INEXPENSIVE: '€', MODERATE: '€€', EXPENSIVE: '€€€', VERY_EXPENSIVE: '€€€€',
  0: '€', 1: '€', 2: '€€', 3: '€€€', 4: '€€€€',
}

// Map the Google primary-type hints the forms pass to OSM tags Photon understands,
// so free search can also bias toward restaurants / hotels.
const OSM_TAG_MAP = {
  restaurant: 'amenity:restaurant', cafe: 'amenity:cafe', bakery: 'shop:bakery',
  bar: 'amenity:bar', lodging: 'tourism:hotel',
}

function extractAreaGoogle(components) {
  if (!Array.isArray(components)) return ''
  const order = ['sublocality', 'sublocality_level_1', 'neighborhood', 'locality', 'postal_town']
  for (const t of order) {
    const c = components.find(comp => (comp.types || []).includes(t))
    if (c) return c.longText || c.long_name || ''
  }
  return ''
}

function photonAddress(p) {
  const parts = [
    p.name,
    [p.housenumber, p.street].filter(Boolean).join(' '),
    p.district, p.city || p.town || p.village, p.state, p.country,
  ].filter(Boolean)
  return parts.filter((v, i) => v !== parts[i - 1]).join(', ')
}

// Reusable place search. Uses Google Places when an API key is set (rich data:
// ratings, reviews, price), otherwise falls back to free OpenStreetMap (Photon)
// autocomplete. Calls onPick with a normalized result either way.
export default function PlaceSearch({ cityName, cityCenter, includedPrimaryTypes, onPick }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [apiKey, setKeyState] = useState(getApiKey())
  const [showKey, setShowKey] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [error, setError] = useState('')

  const debounceRef = useRef(null)
  const reqRef = useRef(0)
  const libRef = useRef(null)
  const sessionRef = useRef(null)

  const useGoogle = !!apiKey

  // Load Google Places lib when a key is present
  useEffect(() => {
    if (!apiKey) { libRef.current = null; return }
    let cancelled = false
    loadGoogleMaps(apiKey)
      .then(g => g.maps.importLibrary('places'))
      .then(lib => {
        if (cancelled) return
        libRef.current = lib
        sessionRef.current = new lib.AutocompleteSessionToken()
        setError('')
      })
      .catch(err => { if (!cancelled) setError(err.message) })
    return () => { cancelled = true }
  }, [apiKey])

  // Type-ahead search (Google or Photon)
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setResults([]); setSearching(false); return }
    setSearching(true)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const reqId = ++reqRef.current
      try {
        if (useGoogle) {
          const lib = libRef.current
          if (!lib) return
          const request = {
            input: q,
            sessionToken: sessionRef.current,
            ...(cityCenter ? { locationBias: { center: { lat: cityCenter.lat, lng: cityCenter.lng }, radius: 30000 } } : {}),
            ...(includedPrimaryTypes ? { includedPrimaryTypes } : {}),
          }
          const { suggestions } = await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
          if (reqId !== reqRef.current) return
          setResults((suggestions || []).filter(s => s.placePrediction).map(s => ({
            source: 'google',
            prediction: s.placePrediction,
            main: s.placePrediction.mainText?.text || s.placePrediction.text?.text || '',
            secondary: s.placePrediction.secondaryText?.text || '',
          })))
        } else {
          const bias = cityCenter ? `&lat=${cityCenter.lat}&lon=${cityCenter.lng}&zoom=12&location_bias_scale=0.6` : ''
          const tags = (includedPrimaryTypes || [])
            .map(t => OSM_TAG_MAP[t]).filter(Boolean)
            .map(t => `&osm_tag=${encodeURIComponent(t)}`).join('')
          const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=en${bias}${tags}`
          const res = await fetch(url)
          const data = await res.json()
          if (reqId !== reqRef.current) return
          setResults((data.features || []).map(f => {
            const pr = f.properties
            const addr = photonAddress(pr)
            return {
              source: 'osm',
              main: pr.name || addr.split(',')[0],
              secondary: addr,
              picked: {
                name: pr.name || addr.split(',')[0],
                type: cap(pr.osm_value || pr.type || ''),
                rating: null, reviewsCompact: '', price: '',
                area: pr.district || pr.city || pr.town || '',
                lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0],
                address: addr,
                mapUrl: `https://www.google.com/maps/search/?api=1&query=${f.geometry.coordinates[1]},${f.geometry.coordinates[0]}`,
              },
            }
          }))
        }
        setError('')
      } catch (err) {
        if (reqId === reqRef.current) { setResults([]); setError(err?.message || 'Search failed') }
      } finally {
        if (reqId === reqRef.current) setSearching(false)
      }
    }, 250)
    return () => clearTimeout(debounceRef.current)
  }, [query, cityCenter, useGoogle, includedPrimaryTypes])

  const handlePick = async (r) => {
    if (r.source === 'osm') {
      setQuery(''); setResults([])
      onPick(r.picked)
      return
    }
    // Google: fetch full details on pick
    setQuery(''); setResults([]); setSearching(true)
    try {
      const place = r.prediction.toPlace()
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'rating', 'userRatingCount', 'types', 'googleMapsURI', 'priceLevel', 'addressComponents'],
      })
      const lat = place.location?.lat()
      const lng = place.location?.lng()
      onPick({
        name: place.displayName || r.main,
        type: cap((place.types && place.types[0]) || ''),
        rating: place.rating ?? null,
        reviewsCompact: place.userRatingCount != null ? formatCount(place.userRatingCount) : '',
        price: PRICE_MAP[place.priceLevel] || '',
        area: extractAreaGoogle(place.addressComponents),
        lat: lat ?? null, lng: lng ?? null,
        address: place.formattedAddress || '',
        mapUrl: place.googleMapsURI || (lat != null ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : ''),
      })
    } catch (err) {
      setError(err?.message || 'Could not load place details')
    } finally {
      setSearching(false)
    }
  }

  const saveKey = () => {
    const k = keyInput.trim()
    if (!k) return
    setApiKey(k); setKeyState(k); setShowKey(false); setKeyInput(''); setError('')
  }
  const removeKey = () => { disableApiKey(); setKeyState(''); setError('') }

  return (
    <>
      <label>🔎 Search {cityName ? `in ${cityName}` : 'a place'}
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Start typing a name..."
          autoComplete="off"
        />
      </label>

      {(searching || results.length > 0) && (
        <div className="geo-results">
          {searching && <div className="geo-loading">Searching…</div>}
          {!searching && results.map((r, i) => (
            <button type="button" key={i} className="geo-result" onClick={() => handlePick(r)}>
              <span className="geo-result-name">{r.main}</span>
              {r.secondary && <span className="geo-result-addr">{r.secondary}</span>}
            </button>
          ))}
          {!searching && results.length === 0 && query.trim().length >= 2 && (
            <div className="geo-loading">No matches — type the name below.</div>
          )}
        </div>
      )}

      {/* Source indicator + Google connect toggle */}
      {useGoogle ? (
        <div className="geo-source">
          ✅ Google Places (ratings & reviews) · <button type="button" className="geo-key-reset" onClick={removeKey}>use free search</button>
        </div>
      ) : (
        <div className="geo-source">
          ✨ Free OpenStreetMap search ·{' '}
          <button type="button" className="geo-key-reset" onClick={() => setShowKey(s => !s)}>
            {showKey ? 'cancel' : 'connect Google for ratings'}
          </button>
        </div>
      )}

      {!useGoogle && showKey && (
        <div className="geo-keybox">
          <p className="geo-key-help">
            Paste a Google Maps API key (Places API enabled). Stored only on this device, billed to your Google account.{' '}
            <a href="https://developers.google.com/maps/documentation/places/web-service/get-api-key" target="_blank" rel="noreferrer">Get a key</a>
          </p>
          <div className="activity-add-row">
            <input value={keyInput} onChange={e => setKeyInput(e.target.value)} placeholder="AIza..." autoComplete="off" />
            <button type="button" className="btn-add-act" onClick={saveKey}>Save</button>
          </div>
        </div>
      )}

      {error && <div className="geo-error">{error} <button type="button" className="geo-key-reset" onClick={removeKey}>use free search</button></div>}
    </>
  )
}

import { useState, useEffect, useMemo, useRef } from 'react'
import { useData } from '../context/DataContext'
import RestaurantForm from '../components/RestaurantForm'
import { cityCenterOf } from '../lib/geo'
import { lookupRating, popularityScore, isLocalFavourite, formatCount } from '../lib/placeRatings'

function EditIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
}

// Split a "Café / French", "Street Food, Turkish" style type into clean tokens
// so cuisine filtering has sensible chips rather than one messy combined string.
function typeTokens(type) {
  return (type || '')
    .split(/[/,&]| - /)
    .map(t => t.trim())
    .filter(Boolean)
}

const PRICES = ['€', '€€', '€€€', '€€€€']

export default function Food() {
  const { cities, restaurants, places, itinerary, addRestaurant, updateRestaurant, deleteRestaurant } = useData()

  const [mode, setMode] = useState('city')        // 'city' | 'day'
  const [activeCity, setActiveCity] = useState('paris')
  const [modal, setModal] = useState(null)

  // Filters
  const [priceSet, setPriceSet] = useState(() => new Set())
  const [typeSet, setTypeSet] = useState(() => new Set())
  const [kidOnly, setKidOnly] = useState(false)
  const [sortPopular, setSortPopular] = useState(true)

  // Live Google rating/review data, keyed by `${cityId}:${restId}`.
  const [ratings, setRatings] = useState({}) // key -> { rating, reviews } | 'loading' | null
  const [ratingError, setRatingError] = useState(null)
  const inflight = useRef(new Set())

  useEffect(() => {
    if (cities.length && !cities.some(c => c.id === activeCity)) setActiveCity(cities[0].id)
  }, [cities, activeCity])

  // Which cities are in play for the current view (active city, or every trip
  // city in day mode) — used to scope both the live lookups and the type chips.
  const tripCityIds = useMemo(() => [...new Set(itinerary.map(d => d.city))], [itinerary])
  const visibleCityIds = mode === 'day' ? tripCityIds : [activeCity]

  // The flat list of restaurants currently in view — a stable dependency so the
  // lookup effect only re-runs when the set actually changes (not on every
  // setRatings re-render, which previously cancelled in-flight lookups).
  const lookupTargets = useMemo(() => {
    const out = []
    visibleCityIds.forEach(cityId => {
      const cityName = cities.find(c => c.id === cityId)?.name
      ;(restaurants[cityId] || []).forEach(r => out.push({ cityId, id: r.id, name: r.name, cityName }))
    })
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, activeCity, tripCityIds, restaurants, cities])

  const mounted = useRef(true)
  // Set true on (re)mount too — StrictMode's dev remount would otherwise leave it
  // stuck false after the first cleanup, discarding every lookup result.
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  // Fetch live ratings for the visible restaurants (cached in placeRatings).
  useEffect(() => {
    lookupTargets.forEach(t => {
      const key = `${t.cityId}:${t.id}`
      if (inflight.current.has(key) || ratings[key] !== undefined) return
      inflight.current.add(key)
      setRatings(prev => ({ ...prev, [key]: 'loading' }))
      lookupRating(t.name, t.cityName, cityCenterOf(places[t.cityId]))
        .then(res => { if (mounted.current) setRatings(prev => ({ ...prev, [key]: res })) })
        .catch(e => {
          if (!mounted.current) return
          if (e.message === 'not-enabled') setRatingError('not-enabled')
          else if (e.message === 'no-key') setRatingError('no-key')
          setRatings(prev => ({ ...prev, [key]: null }))
        })
        .finally(() => inflight.current.delete(key))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookupTargets])

  const gdata = (cityId, r) => {
    const v = ratings[`${cityId}:${r.id}`]
    return v && v !== 'loading' ? v : null
  }
  const effRating = (cityId, r) => gdata(cityId, r)?.rating ?? r.rating
  const effReviews = (cityId, r) => gdata(cityId, r)?.reviews ?? 0

  // Type chips come from whatever cities are visible.
  const allTypes = useMemo(() => {
    const set = new Set()
    visibleCityIds.forEach(id => (restaurants[id] || []).forEach(r => typeTokens(r.type).forEach(t => set.add(t))))
    return [...set].sort((a, b) => a.localeCompare(b))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurants, mode, activeCity, tripCityIds])

  const presentPrices = useMemo(() => {
    const set = new Set()
    visibleCityIds.forEach(id => (restaurants[id] || []).forEach(r => r.price && set.add(r.price)))
    return PRICES.filter(p => set.has(p))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurants, mode, activeCity, tripCityIds])

  const toggleIn = (setter) => (val) => setter(prev => {
    const next = new Set(prev)
    next.has(val) ? next.delete(val) : next.add(val)
    return next
  })
  const togglePrice = toggleIn(setPriceSet)
  const toggleType = toggleIn(setTypeSet)
  const clearFilters = () => { setPriceSet(new Set()); setTypeSet(new Set()); setKidOnly(false) }
  const activeFilterCount = priceSet.size + typeSet.size + (kidOnly ? 1 : 0)

  // Apply the active filters + sort to a city's list.
  const filterList = (cityId, list) => {
    let out = list
    if (priceSet.size) out = out.filter(r => priceSet.has(r.price))
    if (typeSet.size) out = out.filter(r => typeTokens(r.type).some(t => typeSet.has(t)))
    if (kidOnly) out = out.filter(r => r.kidFriendly)
    if (sortPopular) {
      out = [...out].sort((a, b) =>
        popularityScore(effRating(cityId, b), effReviews(cityId, b)) -
        popularityScore(effRating(cityId, a), effReviews(cityId, a)))
    }
    return out
  }

  const cityName = cities.find(c => c.id === activeCity)?.name
  const cityCenter = cityCenterOf(places[activeCity])

  const handleDelete = (cityId, id) => {
    if (confirm('Remove this restaurant?')) deleteRestaurant(cityId, id)
  }

  const Card = ({ cityId, r }) => {
    const g = gdata(cityId, r)
    const loading = ratings[`${cityId}:${r.id}`] === 'loading'
    const fav = g && isLocalFavourite(g.rating, g.reviews)
    return (
      <div className={`rest-card ${fav ? 'is-local-fav' : ''}`}>
        <div className="card-actions-row">
          <div>
            <div className="rest-name">
              {r.name}
              {fav && <span className="local-fav-badge">🔥 Local favourite</span>}
            </div>
            <div className="rest-type">{r.type}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="price">{r.price}</div>
            <button className="action-btn edit" onClick={() => setModal({ mode: 'edit', cityId, item: r })}><EditIcon /></button>
            <button className="action-btn delete" onClick={() => handleDelete(cityId, r.id)}><TrashIcon /></button>
          </div>
        </div>
        {r.area && <div className="rest-area">📍 {r.area}</div>}
        <div className="place-meta">
          {g ? (
            <span className="rating">⭐ {g.rating} <span className="rating-reviews">({formatCount(g.reviews)} Google reviews)</span></span>
          ) : (
            <span className="rating">⭐ {r.rating}{loading && <span className="rating-loading"> · checking Google…</span>}</span>
          )}
          {r.kidFriendly && <span className="badge kid">👶 Kids OK</span>}
        </div>
        {r.desc && <div className="rest-desc">{r.desc}</div>}
        {r.tip && <div className="place-tip">{r.tip}</div>}
      </div>
    )
  }

  const FilterBar = () => (
    <div className="food-filters">
      <div className="food-filter-line">
        <button className={`chip toggle ${sortPopular ? 'on' : ''}`} onClick={() => setSortPopular(v => !v)}>🔥 Popular first</button>
        <button className={`chip toggle ${kidOnly ? 'on' : ''}`} onClick={() => setKidOnly(v => !v)}>👶 Kids</button>
        {presentPrices.map(p => (
          <button key={p} className={`chip ${priceSet.has(p) ? 'on' : ''}`} onClick={() => togglePrice(p)}>{p}</button>
        ))}
        {activeFilterCount > 0 && <button className="chip clear" onClick={clearFilters}>✕ Clear ({activeFilterCount})</button>}
      </div>
      {allTypes.length > 0 && (
        <div className="food-type-chips">
          {allTypes.map(t => (
            <button key={t} className={`chip ${typeSet.has(t) ? 'on' : ''}`} onClick={() => toggleType(t)}>{t}</button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="content">
      <div className="map-mode-toggle food-mode">
        <button className={mode === 'city' ? 'active' : ''} onClick={() => setMode('city')}>🏙 By city</button>
        <button className={mode === 'day' ? 'active' : ''} onClick={() => setMode('day')}>📅 By day</button>
      </div>

      {ratingError === 'not-enabled' && (
        <div className="food-rating-note">Live Google ratings need the “Places API (New)” enabled for your key. Showing saved ratings meanwhile.</div>
      )}

      {mode === 'city' ? (
        <>
          <div className="city-tabs">
            {cities.map(c => (
              <button key={c.id} className={`city-tab ${activeCity === c.id ? 'active' : ''}`} onClick={() => setActiveCity(c.id)}>
                {c.flag} {c.name}
              </button>
            ))}
          </div>

          <FilterBar />

          {(() => {
            const list = filterList(activeCity, restaurants[activeCity] || [])
            return (
              <>
                <div className="filter-row">
                  <p className="section-title" style={{ margin: 0 }}>{list.length} places to eat · {cityName}</p>
                  <button className="filter-btn add-btn" onClick={() => setModal({ mode: 'add', cityId: activeCity })}>+ Add</button>
                </div>
                {list.length === 0 && <div className="video-empty">No places match these filters.</div>}
                {list.map(r => <Card key={r.id} cityId={activeCity} r={r} />)}
              </>
            )
          })()}
        </>
      ) : (
        <>
          <FilterBar />
          {itinerary.map(d => {
            const c = cities.find(x => x.id === d.city)
            const list = filterList(d.city, restaurants[d.city] || [])
            return (
              <div key={d.day} className="food-day-group">
                <div className="food-day-head">
                  <span className="food-day-num">Day {d.day}</span>
                  <span className="food-day-city">{c?.flag} {c?.name}</span>
                  <span className="food-day-count">{list.length} spot{list.length === 1 ? '' : 's'}</span>
                </div>
                {list.length === 0
                  ? <div className="food-day-empty">No matching places{(restaurants[d.city] || []).length ? '' : ` saved for ${c?.name} yet`}.</div>
                  : list.map(r => <Card key={r.id} cityId={d.city} r={r} />)}
              </div>
            )
          })}
        </>
      )}

      {modal?.mode === 'add' && (
        <RestaurantForm cityName={cities.find(c => c.id === modal.cityId)?.name} cityCenter={cityCenterOf(places[modal.cityId])} onSave={r => addRestaurant(modal.cityId, r)} onClose={() => setModal(null)} />
      )}
      {modal?.mode === 'edit' && (
        <RestaurantForm initial={modal.item} cityName={cities.find(c => c.id === modal.cityId)?.name} cityCenter={cityCenterOf(places[modal.cityId])} onSave={r => updateRestaurant(modal.cityId, modal.item.id, r)} onClose={() => setModal(null)} />
      )}
    </div>
  )
}

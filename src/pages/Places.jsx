import { useState, useEffect } from 'react'
import { useData } from '../context/DataContext'
import { useNav } from '../context/NavContext'
import PlaceForm from '../components/PlaceForm'
import PlaceSuggestions from '../components/PlaceSuggestions'
import { cityCenterOf } from '../lib/geo'

function EditIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
}

export default function Places() {
  const { cities, places, itinerary, addPlace, updatePlace, deletePlace, scheduleOnBestDay, dayForPlace, setPlaceDay } = useData()
  const nav = useNav()
  const [activeCity, setActiveCity] = useState('paris')
  useEffect(() => {
    if (cities.length && !cities.some(c => c.id === activeCity)) setActiveCity(cities[0].id)
  }, [cities, activeCity])
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(null) // null | { mode: 'add' } | { mode: 'edit', place }
  const [toast, setToast] = useState('')

  const cityPlaces = places[activeCity] || []
  const cityDays = itinerary.filter(d => d.city === activeCity)

  // Bias search results toward this city (like Google biasing to the map view).
  const cityCenter = cityCenterOf(cityPlaces)

  const cityName = cities.find(c => c.id === activeCity)?.name

  // Add a place, then auto-schedule it onto the nearest itinerary day and
  // surface a brief toast saying where it landed.
  const addAndSchedule = (place) => {
    const created = addPlace(activeCity, place)
    const dayNum = scheduleOnBestDay(activeCity, created)
    setToast(dayNum
      ? `Added “${created.name}” · scheduled on Day ${dayNum}`
      : `Added “${created.name}”`)
    clearTimeout(addAndSchedule._t)
    addAndSchedule._t = setTimeout(() => setToast(''), 4000)
    return created
  }

  const filtered = cityPlaces.filter(p => {
    if (filter === 'must') return p.mustSee
    if (filter === 'kids') return p.kidFriendly
    return true
  })

  const handleDelete = (id) => {
    if (confirm('Delete this place?')) deletePlace(activeCity, id)
  }

  return (
    <div className="content">
      <div className="city-tabs">
        {cities.map(c => (
          <button key={c.id} className={`city-tab ${activeCity === c.id ? 'active' : ''}`} onClick={() => setActiveCity(c.id)}>
            {c.flag} {c.name}
          </button>
        ))}
      </div>

      <button className="page-jump" onClick={() => nav('plan')}>
        📅 See these on your Day Plan <span className="page-jump-arrow">→</span>
      </button>

      <div className="filter-row">
        {[['all','All'], ['must','⭐ Must See'], ['kids','👶 Kids']].map(([val, label]) => (
          <button key={val} className={`filter-btn ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>{label}</button>
        ))}
        <button className="filter-btn add-btn" onClick={() => setModal({ mode: 'add' })}>+ Add Place</button>
      </div>

      <PlaceSuggestions
        cityName={cityName}
        existingNames={cityPlaces.map(p => p.name)}
        cityCenter={cityCenter}
        onAdd={addAndSchedule}
      />

      {toast && <div className="toast">{toast}</div>}

      <p className="section-title">{filtered.length} attractions · {cityName}</p>

      {filtered.map(place => (
        <div key={place.id} className={`place-card ${place.mustSee ? 'must-see' : ''}`}>
          <div className="card-actions-row">
            <div className="place-name">{place.name}</div>
            <div className="card-actions">
              <button className="action-btn edit" onClick={() => setModal({ mode: 'edit', place })}><EditIcon /></button>
              <button className="action-btn delete" onClick={() => handleDelete(place.id)}><TrashIcon /></button>
            </div>
          </div>
          <div className="place-meta">
            <span className="badge type">{place.type}</span>
            {place.mustSee && <span className="badge must-see">⭐ Must See</span>}
            {place.kidFriendly && <span className="badge kid">👶 Kid Friendly</span>}
            <span className="rating">⭐ {place.rating} <span>/ 5.0</span></span>
          </div>
          <div className="place-meta" style={{marginTop: -2}}>
            {place.duration && <span className="badge">⏱ {place.duration}</span>}
            {place.reviews && <span style={{fontSize:'0.73rem', color:'var(--text-muted)'}}>📝 {place.reviews} reviews</span>}
          </div>
          {cityDays.length > 0 && (
            <div className="place-day-row">
              <span className="place-day-label">📅 Visit on</span>
              <select
                className="place-day-select"
                value={dayForPlace(activeCity, place.name) ?? ''}
                onChange={e => setPlaceDay(activeCity, place, e.target.value === '' ? null : Number(e.target.value))}
              >
                <option value="">Not scheduled</option>
                {cityDays.map(d => (
                  <option key={d.day} value={d.day}>Day {d.day} — {d.title}</option>
                ))}
              </select>
            </div>
          )}
          {place.desc && <div className="place-desc">{place.desc}</div>}
          {place.tip && <div className="place-tip">{place.tip}</div>}
          {place.mapUrl && <a className="map-link" href={place.mapUrl} target="_blank" rel="noreferrer">📍 Open in Maps</a>}
        </div>
      ))}

      {modal?.mode === 'add' && (
        <PlaceForm
          cityName={cityName}
          cityCenter={cityCenter}
          onSave={p => addAndSchedule(p)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.mode === 'edit' && (
        <PlaceForm
          initial={modal.place}
          cityName={cityName}
          cityCenter={cityCenter}
          onSave={p => updatePlace(activeCity, modal.place.id, p)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

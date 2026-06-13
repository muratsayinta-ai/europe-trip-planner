import { useState, useEffect } from 'react'
import { useData } from '../context/DataContext'
import RestaurantForm from '../components/RestaurantForm'
import { cityCenterOf } from '../lib/geo'

function EditIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
}

export default function Food() {
  const { cities, restaurants, places, addRestaurant, updateRestaurant, deleteRestaurant } = useData()
  const [activeCity, setActiveCity] = useState('paris')
  useEffect(() => {
    if (cities.length && !cities.some(c => c.id === activeCity)) setActiveCity(cities[0].id)
  }, [cities, activeCity])
  const [modal, setModal] = useState(null)

  const cityRests = restaurants[activeCity] || []
  const cityName = cities.find(c => c.id === activeCity)?.name
  const cityCenter = cityCenterOf(places[activeCity])

  const handleDelete = (id) => {
    if (confirm('Remove this restaurant?')) deleteRestaurant(activeCity, id)
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

      <div className="filter-row">
        <p className="section-title" style={{margin:0}}>{cityRests.length} places to eat</p>
        <button className="filter-btn add-btn" onClick={() => setModal({ mode: 'add' })}>+ Add</button>
      </div>

      {cityRests.map(r => (
        <div key={r.id} className="rest-card">
          <div className="card-actions-row">
            <div>
              <div className="rest-name">{r.name}</div>
              <div className="rest-type">{r.type}</div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <div className="price">{r.price}</div>
              <button className="action-btn edit" onClick={() => setModal({ mode: 'edit', item: r })}><EditIcon /></button>
              <button className="action-btn delete" onClick={() => handleDelete(r.id)}><TrashIcon /></button>
            </div>
          </div>
          {r.area && <div className="rest-area">📍 {r.area}</div>}
          <div className="place-meta">
            <span className="rating">⭐ {r.rating}</span>
            {r.kidFriendly && <span className="badge kid">👶 Kids OK</span>}
          </div>
          {r.desc && <div className="rest-desc">{r.desc}</div>}
          {r.tip && <div className="place-tip">{r.tip}</div>}
        </div>
      ))}

      {modal?.mode === 'add' && (
        <RestaurantForm cityName={cityName} cityCenter={cityCenter} onSave={r => addRestaurant(activeCity, r)} onClose={() => setModal(null)} />
      )}
      {modal?.mode === 'edit' && (
        <RestaurantForm initial={modal.item} cityName={cityName} cityCenter={cityCenter} onSave={r => updateRestaurant(activeCity, modal.item.id, r)} onClose={() => setModal(null)} />
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useData } from '../context/DataContext'
import HotelForm from '../components/HotelForm'
import { cityCenterOf } from '../lib/geo'

function EditIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
}

const priceColor = { '€': '#10b981', '€€': '#2563eb', '€€€': '#f59e0b', '€€€€': '#ef4444' }
const priceLabel = { '€': 'Budget', '€€': 'Mid-range', '€€€': 'Upscale', '€€€€': 'Luxury' }

function Stars({ n }) {
  return <span className="hotel-stars">{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
}

export default function Stay() {
  const { cities, hotels, places, addHotel, updateHotel, deleteHotel } = useData()
  const [activeCity, setActiveCity] = useState('paris')
  useEffect(() => {
    if (cities.length && !cities.some(c => c.id === activeCity)) setActiveCity(cities[0].id)
  }, [cities, activeCity])
  const [modal, setModal] = useState(null)

  const cityHotels = hotels[activeCity] || []
  const cityName = cities.find(c => c.id === activeCity)?.name
  const cityCenter = cityCenterOf(places[activeCity])

  const handleDelete = (id) => {
    if (confirm('Remove this hotel?')) deleteHotel(activeCity, id)
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
        <p className="section-title" style={{margin:0}}>{cityHotels.length} hotels · {cities.find(c=>c.id===activeCity)?.name}</p>
        <button className="filter-btn add-btn" onClick={() => setModal({ mode: 'add' })}>+ Add Hotel</button>
      </div>

      {cityHotels.map(h => (
        <div key={h.id} className="hotel-card">
          <div className="card-actions-row">
            <div className="hotel-name">{h.name}</div>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <Stars n={h.stars} />
              <button className="action-btn edit" onClick={() => setModal({ mode: 'edit', item: h })}><EditIcon /></button>
              <button className="action-btn delete" onClick={() => handleDelete(h.id)}><TrashIcon /></button>
            </div>
          </div>
          {h.area && <div className="hotel-area">📍 {h.area}</div>}
          <div className="place-meta">
            <span className="rating">⭐ {h.rating}</span>
            <span className="badge" style={{color: priceColor[h.price], background: priceColor[h.price] + '18'}}>
              {h.price} · {priceLabel[h.price]}
            </span>
          </div>
          {h.desc && <div className="rest-desc">{h.desc}</div>}
          {h.tip && <div className="place-tip">{h.tip}</div>}
        </div>
      ))}

      {modal?.mode === 'add' && (
        <HotelForm cityName={cityName} cityCenter={cityCenter} onSave={h => addHotel(activeCity, h)} onClose={() => setModal(null)} />
      )}
      {modal?.mode === 'edit' && (
        <HotelForm initial={modal.item} cityName={cityName} cityCenter={cityCenter} onSave={h => updateHotel(activeCity, modal.item.id, h)} onClose={() => setModal(null)} />
      )}
    </div>
  )
}

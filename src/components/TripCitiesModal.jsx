import { useState } from 'react'
import Modal from './Modal'
import { useData } from '../context/DataContext'

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#06b6d4']

function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
}

export default function TripCitiesModal({ onClose }) {
  const { cities, cityDayCount, addCity, removeCity, setCityDayCount } = useData()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', country: '', flag: '📍', color: COLORS[0] })

  const totalDays = cities.reduce((s, c) => s + cityDayCount(c.id), 0)

  const handleRemove = (c) => {
    if (confirm(`Remove ${c.name} from your trip? Its days will be deleted.`)) removeCity(c.id)
  }

  const handleAdd = () => {
    if (!form.name.trim()) return
    addCity(form)
    setForm({ name: '', country: '', flag: '📍', color: COLORS[0] })
    setAdding(false)
  }

  return (
    <Modal title="Cities & Days" onClose={onClose}>
      <p className="geo-key-help" style={{ marginTop: 0 }}>
        Choose the cities you're visiting and how many days to spend in each. Total: <strong>{totalDays} days</strong>.
      </p>

      <div className="city-manage-list">
        {cities.map(c => {
          const days = cityDayCount(c.id)
          return (
            <div key={c.id} className="city-manage-row">
              <span className="city-manage-flag">{c.flag}</span>
              <div className="city-manage-info">
                <div className="city-manage-name">{c.name}</div>
                {c.country && <div className="city-manage-country">{c.country}</div>}
              </div>
              <div className="day-stepper">
                <button type="button" onClick={() => setCityDayCount(c.id, days - 1)} disabled={days <= 1} aria-label="Fewer days">−</button>
                <span className="day-stepper-val">{days} {days === 1 ? 'day' : 'days'}</span>
                <button type="button" onClick={() => setCityDayCount(c.id, days + 1)} aria-label="More days">+</button>
              </div>
              <button className="action-btn delete" onClick={() => handleRemove(c)}><TrashIcon /></button>
            </div>
          )
        })}
      </div>

      {adding ? (
        <div className="geo-keybox" style={{ marginTop: 12 }}>
          <div className="form-row">
            <label>Flag<input value={form.flag} onChange={e => setForm(f => ({ ...f, flag: e.target.value }))} placeholder="🇮🇹" /></label>
            <label style={{ flex: 2 }}>City name *<input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Rome" /></label>
          </div>
          <label>Country<input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="e.g. Italy" /></label>
          <label style={{ marginTop: 6 }}>Color</label>
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
          <div className="activity-add-row" style={{ marginTop: 10 }}>
            <button type="button" className="btn-add-act" onClick={handleAdd}>Add city</button>
            <button type="button" className="geo-key-reset" onClick={() => setAdding(false)}>cancel</button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn-suggest" style={{ marginTop: 12 }} onClick={() => setAdding(true)}>
          + Add a city
        </button>
      )}
    </Modal>
  )
}

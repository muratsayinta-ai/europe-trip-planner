import { useState } from 'react'
import Modal from './Modal'
import { useData } from '../context/DataContext'

const emptyDay = { city: 'paris', title: '', notes: '', activities: [] }

export default function DayForm({ initial, onSave, onClose }) {
  const { cities, places } = useData()
  const [form, setForm] = useState({ ...emptyDay, ...initial })
  const [actInput, setActInput] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const cityPlaces = places[form.city] || []
  const usedNames = new Set(form.activities.map(a => a.name.toLowerCase()))

  // An activity shows on the map if it has coords OR its name matches a place that has coords
  const isMappable = (act) => {
    if (act.lat && act.lng) return true
    const match = cityPlaces.find(p => p.name.toLowerCase() === act.name.toLowerCase())
    return !!(match && match.lat && match.lng)
  }

  // Add an activity from an existing place — brings its coordinates so it maps automatically
  const addFromPlace = (id) => {
    const p = cityPlaces.find(x => x.id === id)
    if (!p) return
    set('activities', [...form.activities, {
      name: p.name,
      duration: p.duration || '',
      rating: p.rating || '',
      lat: p.lat,
      lng: p.lng,
    }])
  }

  // Add a free-typed activity — auto-match coordinates if the name matches a known place
  const addActivity = () => {
    const name = actInput.trim()
    if (!name) return
    const match = cityPlaces.find(p => p.name.toLowerCase() === name.toLowerCase())
    const act = match
      ? { name: match.name, duration: match.duration || '', rating: match.rating || '', lat: match.lat, lng: match.lng }
      : { name, duration: '', rating: '' }
    set('activities', [...form.activities, act])
    setActInput('')
  }

  const updateActivity = (i, field, value) => {
    const updated = form.activities.map((a, idx) => idx === i ? { ...a, [field]: value } : a)
    set('activities', updated)
  }

  const removeActivity = (i) => {
    set('activities', form.activities.filter((_, idx) => idx !== i))
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave(form)
    onClose()
  }

  const cityName = cities.find(c => c.id === form.city)?.name || ''

  return (
    <Modal title={initial?.day ? `Edit Day ${initial.day}` : 'Add Day'} onClose={onClose}>
      <form onSubmit={submit} className="edit-form">
        <label>City
          <select value={form.city} onChange={e => set('city', e.target.value)}>
            {cities.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
          </select>
        </label>
        <label>Day Title *<input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Eiffel Tower & Louvre" required /></label>
        <label>Notes<textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="What you're doing this day..." /></label>

        <div className="form-section-label">Activities</div>
        {form.activities.map((act, i) => (
          <div key={i} className="activity-edit-row">
            <div className="activity-edit-name">
              {act.name}
              {isMappable(act)
                ? <span className="map-pin-tag">📍 on map</span>
                : <span className="no-pin-tag">no pin</span>}
            </div>
            <div className="activity-edit-fields">
              <input
                value={act.duration}
                onChange={e => updateActivity(i, 'duration', e.target.value)}
                placeholder="Duration"
                className="act-mini"
              />
              <input
                type="number" step="0.1" min="0" max="5"
                value={act.rating}
                onChange={e => updateActivity(i, 'rating', e.target.value)}
                placeholder="Rating"
                className="act-mini"
              />
              <button type="button" className="btn-remove" onClick={() => removeActivity(i)}>✕</button>
            </div>
          </div>
        ))}

        {/* Pick from existing places — these map automatically */}
        <label>Add from {cityName} attractions
          <select value="" onChange={e => { addFromPlace(e.target.value); e.target.value = '' }}>
            <option value="">+ Choose a place…</option>
            {cityPlaces
              .filter(p => !usedNames.has(p.name.toLowerCase()))
              .map(p => <option key={p.id} value={p.id}>{p.name}{p.lat ? ' 📍' : ''}</option>)}
          </select>
        </label>

        {/* Or type a custom activity */}
        <div className="activity-add-row">
          <input
            value={actInput}
            onChange={e => setActInput(e.target.value)}
            placeholder="Or type a custom activity..."
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addActivity())}
          />
          <button type="button" className="btn-add-act" onClick={addActivity}>+ Add</button>
        </div>

        <button type="submit" className="btn-save">Save Day</button>
      </form>
    </Modal>
  )
}

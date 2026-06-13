import { useState } from 'react'
import Modal from './Modal'
import PlaceSearch from './PlaceSearch'

const empty = { name: '', stars: 3, rating: '', price: '€€', area: '', desc: '', tip: '' }

const HOTEL_TYPES = ['lodging']

export default function HotelForm({ initial, cityName, cityCenter, onSave, onClose }) {
  const [form, setForm] = useState({ ...empty, ...initial })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const applyPick = (r) => {
    setForm(f => ({
      ...f,
      name: r.name,
      rating: r.rating != null ? r.rating : f.rating,
      price: r.price || f.price,
      area: f.area || r.area,
      desc: f.desc || r.address,
      lat: r.lat ?? f.lat ?? null,
      lng: r.lng ?? f.lng ?? null,
      mapUrl: r.mapUrl || f.mapUrl || '',
    }))
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({ ...form, rating: parseFloat(form.rating) || 0, stars: parseInt(form.stars) || 3 })
    onClose()
  }

  return (
    <Modal title={initial?.id ? 'Edit Hotel' : 'Add Hotel'} onClose={onClose}>
      <form onSubmit={submit} className="edit-form">
        <PlaceSearch cityName={cityName} cityCenter={cityCenter} includedPrimaryTypes={HOTEL_TYPES} onPick={applyPick} />

        <label>Hotel Name *<input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Hotel Indigo" required /></label>
        <div className="form-row">
          <label>Stars
            <select value={form.stars} onChange={e => set('stars', e.target.value)}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
            </select>
          </label>
          <label>Rating (0-5)<input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => set('rating', e.target.value)} placeholder="4.5" /></label>
          <label>Price
            <select value={form.price} onChange={e => set('price', e.target.value)}>
              <option value="€">€ Budget</option>
              <option value="€€">€€ Mid</option>
              <option value="€€€">€€€ Upscale</option>
              <option value="€€€€">€€€€ Luxury</option>
            </select>
          </label>
        </div>
        <label>Area / Location<input value={form.area} onChange={e => set('area', e.target.value)} placeholder="e.g. City Centre" /></label>
        <label>Description<textarea rows={2} value={form.desc} onChange={e => set('desc', e.target.value)} /></label>
        <label>Tip<textarea rows={2} value={form.tip} onChange={e => set('tip', e.target.value)} placeholder="Booking tip, what to request..." /></label>
        <button type="submit" className="btn-save">Save Hotel</button>
      </form>
    </Modal>
  )
}

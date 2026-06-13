import { useState } from 'react'
import Modal from './Modal'
import PlaceSearch from './PlaceSearch'

const empty = { name: '', type: '', rating: '', price: '€€', area: '', desc: '', tip: '', kidFriendly: true }

const RESTAURANT_TYPES = ['restaurant', 'cafe', 'bakery', 'bar']

export default function RestaurantForm({ initial, cityName, cityCenter, onSave, onClose }) {
  const [form, setForm] = useState({ ...empty, ...initial })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const applyPick = (r) => {
    setForm(f => ({
      ...f,
      name: r.name,
      type: f.type || r.type,
      rating: r.rating != null ? r.rating : f.rating,
      price: r.price || f.price,
      area: f.area || r.area,
      desc: f.desc || r.address,
    }))
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({ ...form, rating: parseFloat(form.rating) || 0 })
    onClose()
  }

  return (
    <Modal title={initial?.id ? 'Edit Restaurant' : 'Add Restaurant'} onClose={onClose}>
      <form onSubmit={submit} className="edit-form">
        <PlaceSearch cityName={cityName} cityCenter={cityCenter} includedPrimaryTypes={RESTAURANT_TYPES} onPick={applyPick} />

        <label>Name *<input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Café de Flore" required /></label>
        <label>Cuisine / Type<input value={form.type} onChange={e => set('type', e.target.value)} placeholder="e.g. French Café" /></label>
        <div className="form-row">
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
        <label>Area / Neighbourhood<input value={form.area} onChange={e => set('area', e.target.value)} placeholder="e.g. Marais" /></label>
        <label>Description<textarea rows={2} value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="What to expect..." /></label>
        <label>Tip<textarea rows={2} value={form.tip} onChange={e => set('tip', e.target.value)} placeholder="What to order, best time..." /></label>
        <div className="form-checks">
          <label className="check-label"><input type="checkbox" checked={form.kidFriendly} onChange={e => set('kidFriendly', e.target.checked)} /> Kid Friendly</label>
        </div>
        <button type="submit" className="btn-save">Save Restaurant</button>
      </form>
    </Modal>
  )
}

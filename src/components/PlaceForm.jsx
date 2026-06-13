import { useState } from 'react'
import Modal from './Modal'
import PlaceSearch from './PlaceSearch'

const empty = { name: '', type: '', rating: '', reviews: '', duration: '', kidFriendly: false, mustSee: false, desc: '', tip: '', mapUrl: '', lat: null, lng: null }

export default function PlaceForm({ initial, cityName, cityCenter, onSave, onClose }) {
  const [form, setForm] = useState({ ...empty, ...initial })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const applyPick = (r) => {
    setForm(f => ({
      ...f,
      name: r.name,
      type: f.type || r.type,
      rating: r.rating != null ? r.rating : f.rating,
      reviews: r.reviewsCompact || f.reviews,
      lat: r.lat ?? f.lat,
      lng: r.lng ?? f.lng,
      desc: f.desc || r.address,
      mapUrl: r.mapUrl || f.mapUrl,
    }))
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({ ...form, rating: parseFloat(form.rating) || 0 })
    onClose()
  }

  return (
    <Modal title={initial?.id ? 'Edit Place' : 'Add Place'} onClose={onClose}>
      <form onSubmit={submit} className="edit-form">
        <PlaceSearch cityName={cityName} cityCenter={cityCenter} onPick={applyPick} />

        <label>Name *<input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Eiffel Tower" required /></label>
        {form.lat && form.lng && (
          <div className="geo-coords">📍 Will appear on the map · {form.lat.toFixed(4)}, {form.lng.toFixed(4)}</div>
        )}
        <label>Type<input value={form.type} onChange={e => set('type', e.target.value)} placeholder="e.g. Landmark, Museum" /></label>
        <div className="form-row">
          <label>Rating (0-5)<input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => set('rating', e.target.value)} placeholder="4.7" /></label>
          <label>Duration<input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="2-3h" /></label>
        </div>
        <label>Reviews<input value={form.reviews} onChange={e => set('reviews', e.target.value)} placeholder="e.g. 285K" /></label>
        <label>Description<textarea rows={2} value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="Brief description..." /></label>
        <label>Insider Tip<textarea rows={2} value={form.tip} onChange={e => set('tip', e.target.value)} placeholder="Your tip or note..." /></label>
        <label>Maps Link<input value={form.mapUrl} onChange={e => set('mapUrl', e.target.value)} placeholder="https://maps.google.com/?q=..." /></label>
        <div className="form-checks">
          <label className="check-label"><input type="checkbox" checked={form.mustSee} onChange={e => set('mustSee', e.target.checked)} /> Must See</label>
          <label className="check-label"><input type="checkbox" checked={form.kidFriendly} onChange={e => set('kidFriendly', e.target.checked)} /> Kid Friendly</label>
        </div>
        <button type="submit" className="btn-save">Save Place</button>
      </form>
    </Modal>
  )
}

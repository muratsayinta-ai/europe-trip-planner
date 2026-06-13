import { useState } from 'react'
import { suggestPlaces, getGeminiKey, setGeminiKey, disableGeminiKey } from '../lib/gemini'
import { geocodeOne } from '../lib/geocode'

// AI place ideas for the active city (Google Gemini, free tier). Each suggestion
// can be added with one tap — we geocode it so it maps and can be auto-scheduled.
export default function PlaceSuggestions({ cityName, existingNames = [], cityCenter, onAdd }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [added, setAdded] = useState({})   // name -> 'adding' | 'done' | 'failed'
  const [hasKey, setHasKey] = useState(!!getGeminiKey())
  const [showKey, setShowKey] = useState(false)
  const [keyInput, setKeyInput] = useState('')

  const fetchSuggestions = async () => {
    setOpen(true); setLoading(true); setError(''); setItems([])
    try {
      const list = await suggestPlaces({ cityName, existing: existingNames, count: 6 })
      setItems(list)
      if (list.length === 0) setError('No suggestions came back — try again.')
    } catch (err) {
      setError(err?.message || 'Could not get suggestions')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (s) => {
    setAdded(prev => ({ ...prev, [s.name]: 'adding' }))
    try {
      const geo = await geocodeOne(s.name, cityCenter)
      const place = {
        name: s.name,
        type: s.type || 'Attraction',
        rating: '', reviews: '',
        kidFriendly: !!s.kidFriendly,
        mustSee: false,
        duration: '',
        desc: s.why || geo?.address || '',
        tip: '',
        lat: geo?.lat ?? null,
        lng: geo?.lng ?? null,
        mapUrl: geo ? `https://www.google.com/maps/search/?api=1&query=${geo.lat},${geo.lng}` : '',
      }
      onAdd(place)
      setAdded(prev => ({ ...prev, [s.name]: 'done' }))
    } catch {
      setAdded(prev => ({ ...prev, [s.name]: 'failed' }))
    }
  }

  const saveKey = () => {
    const k = keyInput.trim()
    if (!k) return
    setGeminiKey(k); setHasKey(true); setShowKey(false); setKeyInput('')
  }
  const removeKey = () => { disableGeminiKey(); setHasKey(false); setItems([]); setOpen(false) }

  if (!hasKey) {
    return (
      <div className="suggest-box">
        <button type="button" className="btn-suggest" onClick={() => setShowKey(s => !s)}>
          ✨ {showKey ? 'cancel' : 'Get AI place ideas'}
        </button>
        {showKey && (
          <div className="geo-keybox">
            <p className="geo-key-help">
              Paste a free Google Gemini API key for AI suggestions. Stored only on this device.{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">Get a free key</a>
            </p>
            <div className="activity-add-row">
              <input value={keyInput} onChange={e => setKeyInput(e.target.value)} placeholder="AIza..." autoComplete="off" />
              <button type="button" className="btn-add-act" onClick={saveKey}>Save</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="suggest-box">
      <div className="suggest-head">
        <button type="button" className="btn-suggest" onClick={fetchSuggestions} disabled={loading}>
          ✨ {loading ? 'Thinking…' : (items.length ? 'Suggest more' : `Suggest places in ${cityName}`)}
        </button>
        <button type="button" className="geo-key-reset" onClick={removeKey}>turn off AI</button>
      </div>

      {error && <div className="geo-error">{error}</div>}

      {open && items.length > 0 && (
        <div className="suggest-list">
          {items.map((s, i) => {
            const state = added[s.name]
            return (
              <div className="suggest-item" key={i}>
                <div className="suggest-info">
                  <span className="suggest-name">
                    {s.name}
                    {s.kidFriendly && <span className="badge kid" style={{marginLeft:6}}>👶</span>}
                  </span>
                  {s.why && <span className="suggest-why">{s.why}</span>}
                </div>
                <button
                  type="button"
                  className="btn-add-act"
                  disabled={state === 'adding' || state === 'done'}
                  onClick={() => handleAdd(s)}
                >
                  {state === 'done' ? '✓ Added' : state === 'adding' ? '…' : state === 'failed' ? 'Retry' : '+ Add'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

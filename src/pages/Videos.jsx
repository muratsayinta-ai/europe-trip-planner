import { useState, useEffect, useMemo } from 'react'
import { useData } from '../context/DataContext'
import Modal from '../components/Modal'

function EditIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
}

const LANGS = ['English', 'German', 'French', 'Turkish', 'Spanish', 'Italian', 'Dutch', 'Danish', 'Other']
const LANG_FLAG = { English: '🇬🇧', German: '🇩🇪', French: '🇫🇷', Turkish: '🇹🇷', Spanish: '🇪🇸', Italian: '🇮🇹', Dutch: '🇳🇱', Danish: '🇩🇰', Other: '🌐' }

// Pull the YouTube video id out of any common URL form (watch?v=, youtu.be/, shorts/, embed/).
function youtubeId(url = '') {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  if (m) return m[1]
  const q = url.match(/[?&]v=([\w-]{11})/)
  return q ? q[1] : null
}

// Turn a human-typed view count ("1.2M", "350K", "12,000") into a number for sorting.
function parseViews(str) {
  if (typeof str === 'number') return str
  if (!str) return 0
  const s = String(str).trim().toLowerCase().replace(/,/g, '').replace(/views?/g, '').trim()
  const m = s.match(/^([\d.]+)\s*([kmb])?/)
  if (!m) return 0
  let n = parseFloat(m[1]) || 0
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[m[2]]
  return mult ? n * mult : n
}

const emptyForm = { title: '', url: '', language: 'English', views: '', cityId: '' }

function VideoForm({ initial, cities, defaultCityId, onSave, onClose }) {
  const [form, setForm] = useState({ ...emptyForm, cityId: defaultCityId || cities[0]?.id || '', ...initial })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const id = youtubeId(form.url)

  const submit = (e) => {
    e.preventDefault()
    if (!form.url.trim()) return
    onSave({ ...form, title: form.title.trim() || 'Untitled video' })
    onClose()
  }

  return (
    <Modal title={initial?.id ? 'Edit Video' : 'Add Video'} onClose={onClose}>
      <form onSubmit={submit} className="edit-form">
        <label>City
          <select value={form.cityId} onChange={e => set('cityId', e.target.value)}>
            {cities.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
          </select>
        </label>
        <label>YouTube link *
          <input value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://youtube.com/watch?v=..." required />
        </label>
        {id && <img className="video-form-thumb" src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="" />}
        <label>Title<input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Paris in 3 days" /></label>
        <div className="form-row">
          <label>Language
            <select value={form.language} onChange={e => set('language', e.target.value)}>
              {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <label>Views<input value={form.views} onChange={e => set('views', e.target.value)} placeholder="e.g. 1.2M" /></label>
        </div>
        <button type="submit" className="btn-save">Save Video</button>
      </form>
    </Modal>
  )
}

export default function Videos() {
  const { cities, videos, addVideo, updateVideo, deleteVideo } = useData()
  const [activeCity, setActiveCity] = useState(cities[0]?.id || '')
  useEffect(() => {
    if (cities.length && !cities.some(c => c.id === activeCity)) setActiveCity(cities[0].id)
  }, [cities, activeCity])
  const [modal, setModal] = useState(null)

  const cityName = cities.find(c => c.id === activeCity)?.name
  // Ordered by watch amount (view count), most-watched first.
  const cityVideos = useMemo(
    () => [...(videos[activeCity] || [])].sort((a, b) => parseViews(b.views) - parseViews(a.views)),
    [videos, activeCity]
  )

  const handleDelete = (id) => {
    if (confirm('Remove this video?')) deleteVideo(activeCity, id)
  }

  // Save a new video into its chosen city, then jump to that city's tab.
  const handleAdd = ({ cityId, ...video }) => {
    const target = cityId || activeCity
    addVideo(target, video)
    if (target !== activeCity) setActiveCity(target)
  }

  // On edit, if the linked city changed, move the video: remove from the old
  // city and re-add to the new one; otherwise just update it in place.
  const handleEdit = (oldCity, id, { cityId, ...video }) => {
    const target = cityId || oldCity
    if (target === oldCity) {
      updateVideo(oldCity, id, video)
    } else {
      deleteVideo(oldCity, id)
      addVideo(target, video)
      setActiveCity(target)
    }
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
        <p className="section-title" style={{ margin: 0 }}>{cityVideos.length} videos · {cityName}</p>
        <button className="filter-btn add-btn" onClick={() => setModal({ mode: 'add' })}>+ Add Video</button>
      </div>

      {cityVideos.length === 0 && (
        <div className="video-empty">No videos yet for {cityName}. Add YouTube guides you'd like to watch.</div>
      )}

      {cityVideos.map(v => {
        const id = youtubeId(v.url)
        return (
          <div key={v.id} className="video-card">
            <a className="video-thumb" href={v.url} target="_blank" rel="noopener noreferrer">
              {id
                ? <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="" loading="lazy" />
                : <div className="video-thumb-fallback">▶</div>}
              <span className="video-play">▶</span>
            </a>
            <div className="video-body">
              <a className="video-title" href={v.url} target="_blank" rel="noopener noreferrer">{v.title}</a>
              <div className="video-meta">
                <span className="video-lang">{LANG_FLAG[v.language] || '🌐'} {v.language}</span>
                {v.views && <span className="video-views">👁 {v.views} views</span>}
              </div>
            </div>
            <div className="video-actions">
              <button className="action-btn edit" onClick={() => setModal({ mode: 'edit', item: v })}><EditIcon /></button>
              <button className="action-btn delete" onClick={() => handleDelete(v.id)}><TrashIcon /></button>
            </div>
          </div>
        )
      })}

      {modal?.mode === 'add' && (
        <VideoForm cities={cities} defaultCityId={activeCity} onSave={handleAdd} onClose={() => setModal(null)} />
      )}
      {modal?.mode === 'edit' && (
        <VideoForm initial={{ ...modal.item, cityId: activeCity }} cities={cities} defaultCityId={activeCity} onSave={v => handleEdit(activeCity, modal.item.id, v)} onClose={() => setModal(null)} />
      )}
    </div>
  )
}

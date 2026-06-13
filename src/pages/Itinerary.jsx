import { useState } from 'react'
import { useData } from '../context/DataContext'
import DayForm from '../components/DayForm'
import ReorderList from '../components/ReorderList'

function ChevronDown() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><polyline points="6 9 12 15 18 9"/></svg>
}
function EditIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
}

export default function Itinerary() {
  const { cities, itinerary, addDay, updateDay, deleteDay, reorderActivity, optimizeDay } = useData()
  const [openDay, setOpenDay] = useState(1)
  const [modal, setModal] = useState(null)

  const toggle = (day) => setOpenDay(openDay === day ? null : day)

  const handleDelete = (dayNum) => {
    if (confirm(`Delete Day ${dayNum}?`)) deleteDay(dayNum)
  }

  return (
    <div className="content">
      <div className="place-card" style={{borderLeftColor:'#10b981', marginBottom: 16}}>
        <div className="card-actions-row">
          <div className="place-name">📅 {itinerary.length}-Day Plan</div>
          <button className="filter-btn add-btn" style={{marginLeft:'auto'}} onClick={() => setModal({ mode: 'add' })}>+ Add Day</button>
        </div>
        <div className="place-desc">Tap any day to expand. Edit or add days to make it yours.</div>
      </div>

      {itinerary.map(day => {
        const city = cities.find(c => c.id === day.city)
        const isOpen = openDay === day.day
        return (
          <div key={day.day} className="day-card">
            <div className="day-header" onClick={() => toggle(day.day)}>
              <div className="day-number">{day.day}</div>
              <div className="day-info">
                <div className="day-title">{day.title}</div>
                <div className="day-city-label">{city?.flag} {city?.name}, {city?.country}</div>
              </div>
              <div style={{display:'flex', gap:4, alignItems:'center'}}>
                <button
                  className="action-btn edit"
                  onClick={e => { e.stopPropagation(); setModal({ mode: 'edit', day }) }}
                ><EditIcon /></button>
                <button
                  className="action-btn delete"
                  onClick={e => { e.stopPropagation(); handleDelete(day.day) }}
                ><TrashIcon /></button>
                <div className={`chevron ${isOpen ? 'open' : ''}`}><ChevronDown /></div>
              </div>
            </div>
            {isOpen && (
              <div className="day-body">
                {day.notes && <div className="day-notes">{day.notes}</div>}
                {(day.activities || []).filter(a => typeof a.lat === 'number').length > 2 && (
                  <button className="optimize-btn day-optimize" onClick={() => optimizeDay(day.day)} title="Reorder stops to minimize walking distance">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
                    Optimize order (shortest route)
                  </button>
                )}
                <ReorderList
                  items={day.activities || []}
                  itemKey={(act) => `${act.name}-${act.lat ?? 'x'}`}
                  onReorder={(from, to) => reorderActivity(day.day, from, to)}
                  rowClassName="activity-item"
                  renderItem={(act, i) => (
                    <>
                      <div className="activity-num">{i + 1}</div>
                      <div className="activity-body">
                        <div className="activity-name">{act.name}</div>
                        <div className="activity-duration">
                          {act.duration && `⏱ ${act.duration}`}
                          {act.duration && act.rating ? ' · ' : ''}
                          {act.rating ? `⭐ ${act.rating}` : ''}
                        </div>
                      </div>
                    </>
                  )}
                />
              </div>
            )}
          </div>
        )
      })}

      {modal?.mode === 'add' && (
        <DayForm onSave={d => addDay(d)} onClose={() => setModal(null)} />
      )}
      {modal?.mode === 'edit' && (
        <DayForm initial={modal.day} onSave={d => updateDay(modal.day.day, d)} onClose={() => setModal(null)} />
      )}
    </div>
  )
}

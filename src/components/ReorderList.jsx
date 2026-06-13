import { useRef, useState } from 'react'

// Touch- and mouse-friendly drag-to-reorder list (works in an iPhone PWA).
// Uses Pointer Events + pointer capture so a single drag on the ☰ handle moves
// a row up/down; we swap live as the finger crosses each row's midpoint.
//
// Props:
//   items       – array to render
//   itemKey     – (item, i) => stable React key (must be stable across reorders)
//   onReorder   – (fromIndex, toIndex) => void
//   renderItem  – (item, i) => JSX for the row's content
//   rowClassName – extra class for each row
export default function ReorderList({ items, itemKey, onReorder, renderItem, rowClassName = '' }) {
  const [dragIndex, setDragIndex] = useState(null)
  const dragRef = useRef(null)        // current index under the finger
  const rowRefs = useRef([])

  const begin = (e, index) => {
    dragRef.current = index
    setDragIndex(index)
    try { e.target.setPointerCapture(e.pointerId) } catch {}
  }

  const move = (e) => {
    const from = dragRef.current
    if (from == null) return
    const y = e.clientY
    // Find which row the finger is currently over (by midpoint).
    let target = from
    for (let i = 0; i < rowRefs.current.length; i++) {
      const el = rowRefs.current[i]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (y < r.top + r.height / 2) { target = i; break }
      target = i
    }
    if (target !== from) {
      onReorder(from, target)
      dragRef.current = target
      setDragIndex(target)
    }
  }

  const end = () => { dragRef.current = null; setDragIndex(null) }

  return (
    <div className="reorder-list">
      {items.map((item, i) => (
        <div
          key={itemKey(item, i)}
          ref={el => { rowRefs.current[i] = el }}
          className={`reorder-row ${rowClassName} ${dragIndex === i ? 'dragging' : ''}`}
        >
          <button
            type="button"
            className="drag-handle"
            style={{ touchAction: 'none' }}
            onPointerDown={e => begin(e, i)}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            aria-label="Drag to reorder"
          >⠿</button>
          <div className="reorder-content">{renderItem(item, i)}</div>
        </div>
      ))}
    </div>
  )
}

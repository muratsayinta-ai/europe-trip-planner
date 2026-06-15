import { useState } from 'react'
import { DataProvider, useData } from './context/DataContext'
import Overview from './pages/Overview'
import Cities from './pages/Cities'
import Places from './pages/Places'
import Itinerary from './pages/Itinerary'
import Food from './pages/Food'
import Stay from './pages/Stay'
import MapView from './pages/MapView'
import Videos from './pages/Videos'

const tabs = [
  { id: 'overview', label: 'Overview', icon: OverviewIcon },
  { id: 'cities', label: 'Cities', icon: GlobeIcon },
  { id: 'places', label: 'Places', icon: StarIcon },
  { id: 'map', label: 'Map', icon: MapPinIcon },
  { id: 'food', label: 'Food', icon: FoodIcon },
  { id: 'plan', label: 'Plan', icon: CalendarIcon },
  { id: 'stay', label: 'Stay', icon: HotelIcon },
  { id: 'videos', label: 'Videos', icon: VideoIcon },
]

function OverviewIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z"/><path d="M9 3v15M15 6v15"/></svg>
}
function GlobeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
}
function StarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
}
function MapPinIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
}
function CalendarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function FoodIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
}
function HotelIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function VideoIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none"/></svg>
}
function MenuIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
}
function CloseIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}

const pageMap = {
  overview: Overview,
  cities: Cities,
  places: Places,
  map: MapView,
  plan: Itinerary,
  food: Food,
  stay: Stay,
  videos: Videos,
}

const titles = {
  overview: { title: '🌍 Europe Trip 2026', sub: 'Family of 4 · July 2026' },
  cities: { title: '🗺️ Your Cities', sub: 'Pick cities, order & days' },
  places: { title: '🏛️ Places to Visit', sub: 'Attractions & landmarks' },
  map: { title: '🗺️ Daily Map', sub: 'See your day on the map' },
  plan: { title: '📅 Day-by-Day Plan', sub: '16-day suggested itinerary' },
  food: { title: '🍽️ Where to Eat', sub: 'Restaurants & street food' },
  stay: { title: '🏨 Where to Stay', sub: 'Hotels for every budget' },
  videos: { title: '🎬 City Videos', sub: 'YouTube guides, by views' },
}

const SYNC_LABEL = {
  local: { dot: '#9ca3af', text: 'On this device' },
  connecting: { dot: '#f59e0b', text: 'Connecting…' },
  synced: { dot: '#10b981', text: 'Shared & synced' },
}
function SyncBadge() {
  const { syncStatus } = useData()
  const s = SYNC_LABEL[syncStatus] || SYNC_LABEL.local
  return (
    <span className="sync-badge" title={s.text}>
      <span className="sync-dot" style={{ background: s.dot }} />
      {s.text}
    </span>
  )
}

export default function App() {
  const [active, setActive] = useState('overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const Page = pageMap[active]
  const { title, sub } = titles[active]

  const go = (id) => { setActive(id); setMenuOpen(false) }

  return (
    <DataProvider>
      <div className="app">
        <div className="header">
          <div className="header-top">
            <button className="menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <MenuIcon />
            </button>
            <h1>{title}</h1>
            <SyncBadge />
          </div>
          <p>{sub}</p>
        </div>
        <Page />

        {menuOpen && <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />}
        <nav className={`bottom-nav ${menuOpen ? 'open' : ''}`}>
          <div className="nav-brand">
            <span>🌍 Europe Trip</span>
            <button className="nav-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <CloseIcon />
            </button>
          </div>
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                className={`nav-btn ${active === tab.id ? 'active' : ''}`}
                onClick={() => go(tab.id)}
              >
                <Icon />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>
    </DataProvider>
  )
}

import { useData } from '../context/DataContext'

export default function Overview() {
  const { cities, places, cityDayCount } = useData()
  const totalPlaces = Object.values(places).flat().length
  const totalDays = cities.reduce((s, c) => s + cityDayCount(c.id), 0)

  return (
    <div className="content">
      <div className="overview-card">
        <h2>🌍 Europe Family Trip</h2>
        <p>July 2026 · 2 adults + kids</p>
        <div className="overview-stats">
          <div className="stat">
            <div className="stat-num">{cities.length}</div>
            <div className="stat-label">Cities</div>
          </div>
          <div className="stat">
            <div className="stat-num">{totalDays}</div>
            <div className="stat-label">Days</div>
          </div>
          <div className="stat">
            <div className="stat-num">{totalPlaces}</div>
            <div className="stat-label">Attractions</div>
          </div>
        </div>
      </div>

      <p className="section-title">Your Destinations</p>
      {cities.map(city => (
        <div key={city.id} className="city-overview">
          <div className="city-flag">{city.flag}</div>
          <div className="city-info">
            <div className="city-name-text">{city.name}</div>
            <div className="city-country-text">{city.country}</div>
          </div>
          <div className="city-days-badge">{cityDayCount(city.id)} {cityDayCount(city.id) === 1 ? 'day' : 'days'}</div>
        </div>
      ))}

      <p className="section-title" style={{marginTop: 16}}>July 2026 Tips</p>
      <div className="place-card" style={{borderLeftColor: '#ef4444'}}>
        <div className="place-name">🌡️ July Weather</div>
        <div className="place-desc">Paris & Amsterdam: 25°C avg · Brussels & Bruges: 22°C · Berlin & Munich: 27°C · Budapest: 30°C. Pack light clothes, sunscreen & a light layer for evenings.</div>
      </div>
      <div className="place-card" style={{borderLeftColor: '#10b981'}}>
        <div className="place-name">📋 Book in Advance</div>
        <div className="place-desc">July is peak season. Book Anne Frank House (months ahead), Neuschwanstein Castle, Louvre, and Versailles online before you travel. Most thermal baths need advance booking too.</div>
      </div>
      <div className="place-card" style={{borderLeftColor: '#8b5cf6'}}>
        <div className="place-name">✈️ Getting Around</div>
        <div className="place-desc">Paris → Amsterdam: Thalys train (3.5h) · Amsterdam → Brussels: Thalys (1.8h) · Brussels → Berlin: overnight train or flight · Berlin → Munich: ICE train (4h) · Munich → Budapest: overnight train or flight</div>
      </div>
    </div>
  )
}

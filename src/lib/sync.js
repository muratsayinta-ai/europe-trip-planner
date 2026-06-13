// Shared-trip sync layer (Supabase) with graceful offline / local-only fallback.
//
// The whole trip is stored as one JSON snapshot in a `trips` row keyed by a trip
// id. Reads/writes are last-write-wins on the whole blob — simple and robust for
// a small group on a road trip. localStorage remains the offline cache; this just
// pushes/pulls the shared copy when the network is available, plus realtime pushes
// so friends see each other's edits live.
import { createClient } from '@supabase/supabase-js'

const URL = (import.meta.env?.VITE_SUPABASE_URL || '').trim()
const ANON = (import.meta.env?.VITE_SUPABASE_ANON_KEY || '').trim()

export const syncEnabled = !!(URL && ANON)

const client = syncEnabled ? createClient(URL, ANON, { auth: { persistSession: false } }) : null

// Which shared trip to join: ?trip=CODE in the URL, else a saved choice, else a
// default. Persisted so reopening the app rejoins the same trip.
export function getTripId() {
  try {
    const fromUrl = new URLSearchParams(location.search).get('trip')
    if (fromUrl) { localStorage.setItem('trip_id', fromUrl); return fromUrl }
    return localStorage.getItem('trip_id') || 'europe-2026'
  } catch { return 'europe-2026' }
}

// Pull the shared snapshot. Returns { data, rev } or null (missing / offline / error).
export async function fetchTrip(tripId) {
  if (!client) return null
  try {
    const { data, error } = await client
      .from('trips').select('data, rev').eq('id', tripId).maybeSingle()
    if (error || !data) return null
    return { data: data.data, rev: Number(data.rev) || 0 }
  } catch { return null }
}

// Push the full snapshot (upsert). Returns true on success.
export async function pushTrip(tripId, snapshot, rev) {
  if (!client) return false
  try {
    const { error } = await client
      .from('trips')
      .upsert({ id: tripId, data: snapshot, rev, updated_at: new Date().toISOString() })
    return !error
  } catch { return false }
}

// Subscribe to realtime updates for this trip. cb({ data, rev }) fires on remote
// changes. Returns an unsubscribe function.
export function subscribeTrip(tripId, cb) {
  if (!client) return () => {}
  const channel = client
    .channel(`trip:${tripId}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'trips', filter: `id=eq.${tripId}` },
      payload => {
        const row = payload.new
        if (row && row.data) cb({ data: row.data, rev: Number(row.rev) || 0 })
      })
    .subscribe()
  return () => { try { client.removeChannel(channel) } catch {} }
}

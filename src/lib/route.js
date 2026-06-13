// Order a day's stops so the total walking distance is as small as possible.
// This is a small Traveling-Salesman-style problem (an OPEN path — you don't
// need to return to the start). Days only have a handful of stops, so we can
// afford a good heuristic: nearest-neighbor for a starting path, then 2-opt to
// remove crossings/zig-zags. 2-opt is what makes the route look like a clean line.

// Great-circle distance in metres (haversine). Better than raw lat/lng because
// a degree of longitude shrinks as you move away from the equator.
export function haversine(a, b) {
  const R = 6371000
  const toRad = d => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function pathLength(pts) {
  let total = 0
  for (let i = 0; i < pts.length - 1; i++) total += haversine(pts[i], pts[i + 1])
  return total
}

// Greedy nearest-neighbor path starting at index `start`.
function nearestNeighbor(pts, start) {
  const n = pts.length
  const visited = new Array(n).fill(false)
  const order = [start]
  visited[start] = true
  let current = start
  for (let step = 1; step < n; step++) {
    let best = -1, bestDist = Infinity
    for (let j = 0; j < n; j++) {
      if (visited[j]) continue
      const d = haversine(pts[current], pts[j])
      if (d < bestDist) { bestDist = d; best = j }
    }
    visited[best] = true
    order.push(best)
    current = best
  }
  return order
}

// 2-opt: repeatedly reverse a segment of the path if doing so shortens it.
// Works on an open path (endpoints can change), which untangles crossings.
// `lockFirst` keeps index 0 pinned (used to anchor the route at the hotel).
function twoOpt(order, pts, lockFirst = false) {
  let route = order.slice()
  let improved = true
  const startI = lockFirst ? 1 : 0
  while (improved) {
    improved = false
    for (let i = startI; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const candidate = route.slice(0, i)
          .concat(route.slice(i, j + 1).reverse(), route.slice(j + 1))
        if (pathLength(candidate.map(k => pts[k])) < pathLength(route.map(k => pts[k])) - 1e-6) {
          route = candidate
          improved = true
        }
      }
    }
  }
  return route
}

// Return `points` reordered to minimize total open-path distance.
// Each point must have numeric { lat, lng }. Anything without coords is dropped.
// options.start = { lat, lng } anchors the route to begin from that point (e.g.
// the hotel). The start itself is NOT included in the returned list.
export function optimizeOrder(points, options = {}) {
  const start = options.start && typeof options.start.lat === 'number' && typeof options.start.lng === 'number'
    ? options.start : null
  const pts = points.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number')

  if (start) {
    if (pts.length <= 1) return pts
    // Prepend the hotel as a fixed node 0, route from it, then strip it back out.
    const nodes = [start, ...pts]
    const order = nearestNeighbor(nodes, 0)
    const refined = twoOpt(order, nodes, true)
    return refined.filter(k => k !== 0).map(k => nodes[k])
  }

  if (pts.length <= 2) return pts

  // Free endpoints: try nearest-neighbor from every start, keep shortest, then 2-opt.
  let bestOrder = null, bestLen = Infinity
  for (let s = 0; s < pts.length; s++) {
    const order = nearestNeighbor(pts, s)
    const len = pathLength(order.map(k => pts[k]))
    if (len < bestLen) { bestLen = len; bestOrder = order }
  }
  const refined = twoOpt(bestOrder, pts)
  return refined.map(k => pts[k])
}

// Trip date formatting helpers. All take a Date (or null) and return '' for null.

// "Sun, 5 Jul" — compact day label for each itinerary day.
export function fmtDayDate(date) {
  if (!date) return ''
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

// "5 Jul 2026" — used for the trip start/end summary.
export function fmtFullDate(date) {
  if (!date) return ''
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

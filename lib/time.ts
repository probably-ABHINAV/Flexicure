// Time and timezone helpers for booking flows.
// Uses date-fns-tz to convert between user's timezone and UTC.
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz"

// Returns the UTC range [start, end) that corresponds to the entire local date in the user's timezone.
export function getUtcRangeForLocalDate(dateYYYYMMDD: string, timezone: string) {
  // Construct local start/end boundaries in the user's timezone
  const localStart = new Date(`${dateYYYYMMDD}T00:00:00`)
  const localEnd = new Date(`${dateYYYYMMDD}T23:59:59`)

  const startUtc = zonedTimeToUtc(localStart, timezone)
  // End is the end of the day; we'll advance 1 second for an exclusive upper bound semantics if needed
  const endUtc = zonedTimeToUtc(localEnd, timezone)

  return { startUtc, endUtc }
}

// Convert a local date YYYY-MM-DD and local time HH:mm to UTC ISO.
// durationMinutes lets you compute an end ISO easily.
export function toUtcStartEndISO(dateYYYYMMDD: string, timeHHmm: string, timezone: string, durationMinutes = 45) {
  const local = new Date(`${dateYYYYMMDD}T${timeHHmm}:00`)
  const utcStart = zonedTimeToUtc(local, timezone)
  const utcEnd = new Date(utcStart.getTime() + durationMinutes * 60_000)
  return { startISO: utcStart.toISOString(), endISO: utcEnd.toISOString() }
}

// Get day of week (0-6; Sun=0) for a given local date string in timezone
export function getLocalDayOfWeek(dateYYYYMMDD: string, timezone: string) {
  // pick noon to avoid DST edge issues
  const noonLocal = new Date(`${dateYYYYMMDD}T12:00:00`)
  const localZoned = utcToZonedTime(noonLocal, timezone)
  return localZoned.getDay()
}

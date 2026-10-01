/**
 * The five boxes and how often each comes back, in days (research R6).
 */
export const BOX_INTERVAL_DAYS = [1, 2, 4, 8, 16] as const

export interface IBoxCounts {
  box_1_count?: number
  box_2_count?: number
  box_3_count?: number
  box_4_count?: number
  box_5_count?: number
}

/**
 * How many cards of a learning sit in each box, box 1 first.
 */
export const boxCountsOf = (learning: IBoxCounts): number[] => {
  return [
    learning.box_1_count ?? 0,
    learning.box_2_count ?? 0,
    learning.box_3_count ?? 0,
    learning.box_4_count ?? 0,
    learning.box_5_count ?? 0,
  ]
}

/**
 * The box a card goes to: up one when known, box 5 at most; back to box 1 when missed (FR-046).
 */
export const arrivalBox = (box: number, known: boolean): number =>
  known ? Math.min(box + 1, 5) : 1

/**
 * A `YYYY-MM-DD` day moved by a number of days, without any hour to shift it.
 */
export const addDaysToDay = (day: string, days: number): string => {
  const [year, month, date] = day.split('-').map(Number)

  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, (date ?? 1) + days))
    .toISOString()
    .slice(0, 10)
}

/**
 * When a card that arrives in a box on a given day comes back (FR-042).
 */
export const nextReviewOn = (box: number, day: string): string =>
  addDaysToDay(day, BOX_INTERVAL_DAYS[box - 1] ?? 1)

/**
 * The `YYYY-MM-DD` day of an instant in a time zone: reviews fall due at midnight in the
 * account's own time zone, whatever the device's (FR-007).
 */
export const localDay = (instant: Date, timezone: string): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant)

/**
 * Days from the device's today to a `YYYY-MM-DD` date: 0 today, 1 tomorrow, negative if past.
 */
export const daysFromToday = (isoDate: string): number => {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number)
  const target = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

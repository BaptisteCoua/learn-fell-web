/**
 * The five boxes and how often each comes back, in days (research R6).
 */
export const BOX_INTERVAL_DAYS = [1, 2, 4, 8, 16] as const

/**
 * How many cards of a learning sit in each box, box 1 first.
 */
export const boxCountsOf = (learning: Learning): number[] => {
  return [
    learning.box_1_count ?? 0,
    learning.box_2_count ?? 0,
    learning.box_3_count ?? 0,
    learning.box_4_count ?? 0,
    learning.box_5_count ?? 0,
  ]
}

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

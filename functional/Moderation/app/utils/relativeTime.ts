const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
]

/**
 * "il y a 2 jours", "hier", "il y a 3 heures" for a past date.
 */
export const relativeTime = (isoDate: string, now = new Date()): string => {
  const format = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' })
  const elapsed = new Date(isoDate).getTime() - now.getTime()

  for (const [unit, milliseconds] of UNITS) {
    if (Math.abs(elapsed) >= milliseconds) {
      return format.format(Math.round(elapsed / milliseconds), unit)
    }
  }

  return format.format(0, 'minute')
}

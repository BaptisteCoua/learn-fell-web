/**
 * A calendar day (`2026-10-31`) written out in French (`31 octobre 2026`), the same day
 * whatever the time zone of the device.
 */
export const longDate = (day: string): string =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${day}T00:00:00Z`),
  )

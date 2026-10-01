import { describe, expect, it } from 'vitest'
import { addDaysToDay, arrivalBox, localDay, nextReviewOn } from '../app/utils/leitner'

describe('the Leitner rules', () => {
  it.each([
    [1, true, 2, '2026-10-07'],
    [2, true, 3, '2026-10-09'],
    [3, true, 4, '2026-10-13'],
    [4, true, 5, '2026-10-21'],
    [5, true, 5, '2026-10-21'],
    [1, false, 1, '2026-10-06'],
    [2, false, 1, '2026-10-06'],
    [3, false, 1, '2026-10-06'],
    [4, false, 1, '2026-10-06'],
    [5, false, 1, '2026-10-06'],
  ])('box %i answered known=%s goes to box %i, back on %s', (box, known, toBox, backOn) => {
    expect(arrivalBox(box, known)).toBe(toBox)
    expect(nextReviewOn(toBox, '2026-10-05')).toBe(backOn)
  })
})

describe('days', () => {
  it('takes the day in the account time zone, not the device one', () => {
    const instant = new Date('2026-10-05T23:30:00Z')

    expect(localDay(instant, 'Europe/Paris')).toBe('2026-10-06')
    expect(localDay(instant, 'America/Montreal')).toBe('2026-10-05')
  })

  it('adds days across a clock change and the end of a month', () => {
    expect(addDaysToDay('2026-10-24', 2)).toBe('2026-10-26')
    expect(addDaysToDay('2026-10-30', 4)).toBe('2026-11-03')
    expect(addDaysToDay('2026-12-31', 1)).toBe('2027-01-01')
  })
})

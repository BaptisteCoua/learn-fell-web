import { describe, expect, it } from 'vitest'

describe('splitHighlight', () => {
  it('marks every match, ignoring case and accents', () => {
    expect(splitHighlight('La Révolution et la revolution', 'revolution')).toEqual([
      { text: 'La ', isMatch: false },
      { text: 'Révolution', isMatch: true },
      { text: ' et la ', isMatch: false },
      { text: 'revolution', isMatch: true },
    ])
  })

  it('leaves the text whole without a query', () => {
    expect(splitHighlight('Histoire', ' ')).toEqual([{ text: 'Histoire', isMatch: false }])
  })
})

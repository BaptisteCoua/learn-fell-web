export interface IHighlightSegment {
  text: string
  isMatch: boolean
}

// One character per character, so indexes in the folded text match the original text.
const foldCharacter = (character: string): string =>
  (character.normalize('NFD').replace(/\p{M}/gu, '')[0] ?? character).toLowerCase()

const fold = (text: string): string => Array.from(text, foldCharacter).join('')

/**
 * Splits a text around every occurrence of the searched words, ignoring case and accents,
 * so the matches can be marked without rendering HTML.
 */
export const splitHighlight = (text: string, query: string): IHighlightSegment[] => {
  const needle = fold(query.trim())

  if (needle.length === 0) {
    return [{ text, isMatch: false }]
  }

  const characters = Array.from(text)
  const haystack = fold(text)
  const segments: IHighlightSegment[] = []
  let start = 0
  let matchIndex = haystack.indexOf(needle)

  while (matchIndex !== -1) {
    if (matchIndex > start) {
      segments.push({ text: characters.slice(start, matchIndex).join(''), isMatch: false })
    }

    segments.push({
      text: characters.slice(matchIndex, matchIndex + needle.length).join(''),
      isMatch: true,
    })
    start = matchIndex + needle.length
    matchIndex = haystack.indexOf(needle, start)
  }

  if (start < characters.length) {
    segments.push({ text: characters.slice(start).join(''), isMatch: false })
  }

  return segments
}

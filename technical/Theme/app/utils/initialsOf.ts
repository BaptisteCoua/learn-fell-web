/**
 * The avatar letters of a display name: the first letter of its first two words.
 */
export const initialsOf = (displayName: string): string =>
  displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')

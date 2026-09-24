import type { QueryBuilder } from 'laravel-raom-nuxt/runtime'

export const SUBJECTS_PER_PAGE = 20
export const SEARCH_MIN_LENGTH = 2

/**
 * What a subject is shown with: author name, category, tags and question count. The API
 * decides which subjects the viewer may see (FR-023).
 */
export const withSubjectDetails = (query: QueryBuilder<Subject>): QueryBuilder<Subject> =>
  query.include('author').include('category').include('tags').withCount('questions')

/**
 * The subjects of the public catalogue: published only, so a signed-in author's drafts
 * never show up next to everyone else's subjects.
 */
export const withSubjectCard = (query: QueryBuilder<Subject>): QueryBuilder<Subject> =>
  withSubjectDetails(query).where('status', 'published')

/**
 * The searched text from the `q` query parameter, trimmed.
 */
export const readSearchText = (value: unknown): string =>
  (Array.isArray(value) ? value[0] : value)?.toString().trim() ?? ''

/**
 * The name to show for an account: the fallback (« Auteur supprimé », « Compte supprimé ») while
 * its deletion is pending, when its name is null, and once it is erased, when it is null itself.
 */
export const authorName = (
  author: { display_name: string | null } | null | undefined,
  fallback: string,
): string => author?.display_name ?? fallback

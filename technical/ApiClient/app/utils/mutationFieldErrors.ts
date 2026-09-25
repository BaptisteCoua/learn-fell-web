/**
 * lomkit reports a field of a mutation as `mutate.0.attributes.<field>`: keep the field name.
 */
export const mutationFieldErrors = (fieldErrors: Record<string, string>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(fieldErrors).map(([path, message]) => [
      path.replace(/^mutate\.\d+\.attributes\./, ''),
      message,
    ]),
  )

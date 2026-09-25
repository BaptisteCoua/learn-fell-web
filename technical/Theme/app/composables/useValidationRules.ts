/**
 * Field rules shared by the Vuetify forms, with their French messages.
 */
export const useValidationRules = () => {
  const { t } = useI18n()

  const maxItems =
    (max: number) =>
    (value: unknown[] | null): true | string =>
      (value?.length ?? 0) <= max || t('{max} items at most.', { max })

  return { maxItems }
}

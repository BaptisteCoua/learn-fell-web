/**
 * A hidden file input opened by a visible button. Without `capture`, a phone offers both its
 * gallery and its camera (FR-006).
 */
export const useImagePicker = (onPick: (files: File[]) => void) => {
  const input = ref<HTMLInputElement | null>(null)

  const open = (): void => {
    input.value?.click()
  }

  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement
    const files = Array.from(target.files ?? [])

    // The same file chosen again must fire a new change.
    target.value = ''

    if (files.length > 0) {
      onPick(files)
    }
  }

  return { input, open, onChange, accept: ACCEPTED_IMAGE_TYPES.join(',') }
}

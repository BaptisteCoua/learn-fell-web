<template>
  <span :class="['subject-status-badge', `subject-status-badge--${status}`]">{{ label }}</span>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  status: { type: String as PropType<SubjectStatus>, required: true },
})

const { t } = useI18n()
const label = computed(
  () => ({ draft: t('draft'), published: t('published'), retired: t('retired') })[props.status],
)
</script>

<style scoped lang="scss">
.subject-status-badge {
  align-self: flex-start;
  padding: 0.3125rem 0.625rem;
  border: 3px solid var(--cinq-ink);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.125rem;
  text-transform: uppercase;
  white-space: nowrap;

  &--draft {
    background: var(--cinq-white);
  }

  &--published {
    background: var(--cinq-yellow);
  }

  &--retired {
    background: var(--cinq-ink);
    color: var(--cinq-cream);
  }
}
</style>

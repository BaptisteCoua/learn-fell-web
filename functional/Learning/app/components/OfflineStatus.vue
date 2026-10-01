<template>
  <div v-if="lines.length > 0" role="status" class="offline-status">
    <p v-for="line in lines" :key="line" class="offline-status__line">{{ line }}</p>
  </div>
</template>

<script setup lang="ts">
import { isPackOutdated } from '../offline/pack'

const props = defineProps({
  offline: { type: Boolean, required: true },
})

const { t } = useI18n()
const { pack, isPersistent } = useOfflineReview()

const updatedOn = (updatedAt: string): string =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(
    new Date(updatedAt),
  )

// What the device can offer without the network (FR-005, FR-019, US4-5).
const lines = computed<string[]>(() => {
  if (!isPersistent.value) {
    return [t('offline review is not available on this device.')]
  }

  if (!props.offline) {
    return []
  }

  if (!pack.value) {
    return [t('offline review will be possible after opening cinq online once.')]
  }

  const upToDate = t('offline — cards up to date as of {date}', {
    date: updatedOn(pack.value.updated_at),
  })

  return isPackOutdated(pack.value, localDay(new Date(), pack.value.timezone))
    ? [upToDate, t('reconnect to the network to review the next cards.')]
    : [upToDate]
})
</script>

<style scoped lang="scss">
.offline-status {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.875rem 1rem;
  border: var(--cinq-border);
  background: var(--cinq-white);
  font-weight: 700;

  &__line {
    margin: 0;
  }
}
</style>

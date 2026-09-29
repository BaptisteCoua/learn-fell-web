<template>
  <li class="reminder-device-row">
    <div class="reminder-device-row__identity">
      <strong class="reminder-device-row__name">{{ device.device_label }}</strong>
      <span class="reminder-device-row__meta">
        <span v-if="isCurrent" class="reminder-device-row__current">{{ $t('this device') }}</span>
        {{ $t('added on {date}', { date: addedOn }) }}
      </span>
    </div>
    <v-btn
      variant="outlined"
      size="large"
      :disabled
      :aria-label="$t('turn off the notifications of “{device}”', { device: device.device_label })"
      @click="emit('turnOff')"
    >
      {{ $t('turn off') }}
    </v-btn>
  </li>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  device: { type: Object as PropType<PushSubscription>, required: true },
  isCurrent: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['turnOff'])

const { locale } = useI18n()

const addedOn = computed(() =>
  new Date(props.device.created_at).toLocaleDateString(locale.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
)
</script>

<style scoped lang="scss">
.reminder-device-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  padding: 1rem 1.25rem;
  border-top: 3px solid var(--cinq-ink);

  &__identity {
    display: flex;
    flex: 1 1 12rem;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  &__name {
    font-size: 1.0625rem;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9375rem;
    color: var(--cinq-muted);
  }

  &__current {
    padding: 0.125rem 0.5rem;
    background: var(--cinq-yellow);
    color: var(--cinq-ink);
    font-family: var(--cinq-font-mono);
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
  }
}
</style>

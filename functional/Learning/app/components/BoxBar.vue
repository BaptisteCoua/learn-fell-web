<template>
  <div role="img" :aria-label="label" :class="['box-bar', `box-bar--${size}`]">
    <div
      v-for="(count, box) in counts"
      :key="box"
      :class="['box-bar__box', `box-bar__box--${box + 1}`]"
    >
      <strong class="box-bar__count">{{ count }}</strong>
      <span class="box-bar__legend"
        >B{{ box + 1 }} · {{ BOX_INTERVAL_DAYS[box] }}{{ $t('d') }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  counts: { type: Array as PropType<number[]>, required: true },
  size: { type: String as PropType<'small' | 'large'>, default: 'large' },
})

const { t } = useI18n()
const label = computed(() =>
  t('spread: {boxes}', {
    boxes: props.counts
      .map((count, box) => t('box {box}: {count}', { box: box + 1, count }))
      .join(', '),
  }),
)
</script>

<style scoped lang="scss">
.box-bar {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.25rem;

  &__box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 4rem;
    border: 3px solid var(--cinq-ink);
    background: var(--cinq-white);
    line-height: 1;

    &--1,
    &--5 {
      background: var(--cinq-yellow);
    }

    &--3 {
      background: var(--cinq-blue);
    }
  }

  &__count {
    font-family: var(--cinq-font-display);
    font-size: 1.375rem;
    font-weight: 900;
  }

  &__legend {
    font-size: 0.75rem;
    font-weight: 700;
  }

  &--small &__box {
    min-height: 2.75rem;
  }

  &--small &__count {
    font-size: 1rem;
  }
}
</style>

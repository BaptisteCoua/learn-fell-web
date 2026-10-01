<template>
  <p role="status" class="pending-answers">
    <span v-if="pendingCount > 0" class="pending-answers__count">{{
      $t('{count} answers to send | {count} answer to send | {count} answers to send', pendingCount)
    }}</span>
  </p>
</template>

<script setup lang="ts">
// The answers kept on the device and not yet received by the API (FR-009).
const { pendingCount } = useOfflineReview()
</script>

<style scoped lang="scss">
.pending-answers {
  margin: 0;

  &__count {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border: 3px solid var(--cinq-ink);
    background: var(--cinq-yellow);
    font-family: var(--cinq-font-mono);
    font-size: 0.875rem;
    font-weight: 700;
  }
}
</style>

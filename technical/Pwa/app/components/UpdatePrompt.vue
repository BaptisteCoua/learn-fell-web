<template>
  <div v-if="isAvailable" role="status" class="update-prompt">
    <span>
      <strong>{{ $t('a new version of cinq is available.') }}</strong>
      {{ $t('update to get the latest improvements.') }}
    </span>
    <div class="cinq-actions">
      <v-btn variant="outlined" @click="later">{{ $t('later') }}</v-btn>
      <v-btn color="primary" @click="update">{{ $t('update') }}</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isAvailable, update, later } = usePwaUpdate()
</script>

<style scoped>
.update-prompt {
  position: fixed;
  right: 1rem;
  bottom: 5.5rem;
  z-index: 30;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 30rem;
  padding: 1rem;
  border: var(--cinq-border);
  background: var(--cinq-blue);
  box-shadow: 8px 8px 0 var(--cinq-ink);
  font-size: 0.9375rem;
  line-height: 1.45;
}

@media (max-width: 599px) {
  .update-prompt {
    left: 1rem;
  }
}
</style>

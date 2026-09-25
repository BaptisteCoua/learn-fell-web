<template>
  <div v-if="isOffline" role="status" class="offline-banner">
    <v-icon icon="mdi-wifi-off" />
    <span>
      <strong>{{ $t('offline.') }}</strong>
      {{
        $t(
          'you can read the page shown. saving, publishing and reporting will resume when the connection is back.',
        )
      }}
    </span>
  </div>
</template>

<script setup lang="ts">
const { isOffline } = useConnectionStatus()
</script>

<style scoped>
.offline-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  border-bottom: var(--cinq-border);
  background: var(--cinq-ink);
  color: var(--cinq-cream);
  font-size: 0.875rem;
  line-height: 1.4;
}
</style>

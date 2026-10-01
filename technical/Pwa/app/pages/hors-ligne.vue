<template>
  <section class="offline-page">
    <span class="offline-page__icon" aria-hidden="true"
      ><v-icon icon="mdi-wifi-off" size="60"
    /></span>
    <h1 class="offline-page__title">{{ $t('you are offline') }}</h1>
    <p class="offline-page__text">
      {{ $t('cinq needs a connection to show the subjects. check your network, then try again.') }}
    </p>
    <p class="offline-page__text">
      {{
        $t('your reviews stay available offline once cinq has been opened online on this device.')
      }}
    </p>
    <div class="offline-page__actions">
      <v-btn color="primary" size="x-large" @click="retry">{{ $t('try again') }}</v-btn>
      <v-btn to="/revisions" variant="outlined" size="x-large">{{ $t('my reviews') }}</v-btn>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { retry } = useOfflinePage()

useHead({ title: () => t('you are offline') })
</script>

<style scoped lang="scss">
.offline-page {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.25rem;
  max-width: 40rem;
  padding: 2rem clamp(1rem, 5vw, 4rem) 4rem;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 6.875rem;
    height: 6.875rem;
    border: var(--cinq-border);
    background: var(--cinq-ink);
    color: var(--cinq-yellow);
    box-shadow: 10px 10px 0 var(--cinq-blue);
  }

  &__title {
    margin: 0;
    font-size: clamp(2.25rem, 10vw, 5rem);
    line-height: 0.86;
    text-transform: uppercase;
  }

  &__text {
    margin: 0;
    font-size: 1.0625rem;
    line-height: 1.5;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
}
</style>

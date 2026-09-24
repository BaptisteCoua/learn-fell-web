<template>
  <div class="card-mode">
    <header class="card-mode__header">
      <NuxtLink
        :to="`/sujets/${subject.id}`"
        :aria-label="$t('back to the subject')"
        class="card-mode__back"
      >
        <v-icon icon="mdi-arrow-left" />
      </NuxtLink>
      <div class="card-mode__subject">
        <span class="card-mode__category">{{ subject.category.name }}</span>
        <span class="card-mode__title">{{ subject.title }}</span>
      </div>
      <div class="card-mode__position">{{ position }}</div>
    </header>
    <div class="card-mode__progress" aria-hidden="true">
      <div class="card-mode__progress-bar" :style="progressStyle" />
    </div>

    <main v-if="current" class="card-mode__main">
      <section v-if="!isFlipped" :aria-label="$t('recto')" class="card-mode__card">
        <span class="card-mode__face card-mode__face--recto">{{ $t('recto') }}</span>
        <RichTextView :html="current.recto_html" class="card-mode__question" />
        <span>{{ $t('think, then flip the card.') }}</span>
      </section>
      <section v-else :aria-label="$t('verso')" class="card-mode__card card-mode__card--verso">
        <span class="card-mode__face card-mode__face--verso">{{ $t('verso') }}</span>
        <RichTextView :html="current.recto_html" class="card-mode__reminder" />
        <RichTextView :html="current.verso_html" class="card-mode__answer" />
      </section>
    </main>
    <p v-else class="card-mode__main">{{ $t('this subject has no question yet.') }}</p>

    <footer class="card-mode__footer">
      <v-btn color="primary" size="x-large" :disabled="!current" @click="flip">
        {{ isFlipped ? $t('show the question') : $t('flip the card') }}
      </v-btn>
      <div class="cinq-actions">
        <v-btn variant="outlined" size="large" :disabled="!current" @click="previous">{{
          $t('previous')
        }}</v-btn>
        <v-btn color="secondary" size="large" :disabled="!current" @click="next">{{
          $t('next')
        }}</v-btn>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { subject, current, position, progressStyle, isFlipped, flip, next, previous } =
  await useCardMode(Number(route.params.id))

useHead({ title: subject.title })
</script>

<style scoped lang="scss">
.card-mode {
  display: flex;
  flex-direction: column;
  max-width: 45rem;
  min-height: calc(100dvh - 160px);
  margin: 0 auto;
  border-inline: var(--cinq-border);

  &__header {
    display: flex;
    align-items: stretch;
    height: 4rem;
    border-bottom: var(--cinq-border);
  }

  &__back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    border-right: var(--cinq-border);
  }

  &__subject {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: center;
    min-width: 0;
    padding: 0 0.875rem;
  }

  &__category {
    font-family: var(--cinq-font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__title {
    overflow: hidden;
    font-family: var(--cinq-font-display);
    font-size: clamp(0.875rem, 4.36vw, 1.0625rem);
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__position {
    display: flex;
    align-items: center;
    padding: 0 0.875rem;
    border-left: var(--cinq-border);
    background: var(--cinq-ink);
    color: var(--cinq-cream);
    font-family: var(--cinq-font-display);
    font-size: clamp(0.9375rem, 4.62vw, 1.125rem);
    font-weight: 900;
    white-space: nowrap;
  }

  &__progress {
    height: 10px;
    border-bottom: var(--cinq-border);
    background: var(--cinq-white);
  }

  &__progress-bar {
    height: 100%;
    background: var(--cinq-yellow);
  }

  &__main {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 1.5rem 1.25rem;
  }

  &__card {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: space-between;
    gap: 1.25rem;
    min-height: 20rem;
    padding: 1.5rem;
    border: var(--cinq-border);
    background: var(--cinq-white);
    box-shadow: 8px 8px 0 var(--cinq-ink);

    &--verso {
      justify-content: flex-start;
      background: var(--cinq-blue);
    }
  }

  &__face {
    align-self: flex-start;
    padding: 0.25rem 0.625rem;
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.154em;
    text-transform: uppercase;

    &--recto {
      border: 3px solid var(--cinq-ink);
      background: var(--cinq-yellow);
    }

    &--verso {
      background: var(--cinq-ink);
      color: var(--cinq-cream);
    }
  }

  &__question {
    font-family: var(--cinq-font-display);
    font-size: clamp(1.5rem, 5vw, 2.125rem);
    font-weight: 900;
    line-height: 1.05;
  }

  &__reminder {
    font-weight: 700;
  }

  &__answer {
    font-size: clamp(1rem, 4.87vw, 1.1875rem);
  }

  &__footer {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    padding: 0 1.25rem 1rem;
  }
}
</style>

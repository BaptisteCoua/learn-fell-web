<template>
  <div>
    <section id="top" class="landing__hero">
      <div class="landing__hero-text">
        <div class="landing__eyebrow">{{ $t('public learning space') }}</div>
        <h1 class="landing__title">
          {{ $t('learn') }}<br />{{ $t('everything.') }}<br />
          <span class="landing__title-accent">{{ $t('remember') }}</span
          ><br />{{ $t('everything.') }}
        </h1>
        <p class="landing__lead">
          {{
            $t(
              'questions written by the community, sorted by subject. read freely, without an account. create your own subjects and share them.',
            )
          }}
        </p>
        <SubjectSearchForm size="large" />
      </div>
      <div class="landing__cards" aria-hidden="true">
        <div class="landing__card landing__card--recto">
          <span class="landing__card-face">{{ $t('recto') }}</span>
          <span class="landing__card-text">{{ $t('what year did the berlin wall fall?') }}</span>
        </div>
        <div class="landing__card landing__card--verso">
          <span class="landing__card-face">{{ $t('verso') }}</span>
          <span class="landing__card-answer">1989</span>
        </div>
      </div>
    </section>

    <section class="landing__section">
      <div class="landing__section-header">
        <div>
          <div class="landing__eyebrow">{{ $t('01 — featured') }}</div>
          <h2 class="landing__section-title">{{ $t('latest subjects') }}</h2>
        </div>
        <v-btn to="/categories" variant="outlined" append-icon="mdi-arrow-right">
          {{ $t('the whole catalogue') }}
        </v-btn>
      </div>
      <SubjectGrid v-if="latestSubjects.length > 0" :subjects="latestSubjects" />
      <p v-else>{{ $t('no subject has been published yet.') }}</p>
    </section>

    <section id="methode" class="landing__section landing__section--yellow">
      <div class="landing__section-header">
        <div>
          <div class="landing__eyebrow">{{ $t('02 — the method') }}</div>
          <h2 class="landing__section-title">
            {{ $t('five boxes.') }}<br />{{ $t('nothing forgotten.') }}
          </h2>
        </div>
        <p class="landing__method-text">
          {{
            $t(
              'the leitner system: a card you get right moves up a box and comes back later. a card you miss goes back to box 1. you review what you forget, not what you already know.',
            )
          }}
        </p>
      </div>
      <ol class="landing__boxes">
        <li v-for="item in leitnerBoxes" :key="item.box" class="landing__box">
          <span class="landing__box-number">{{ item.box }}</span>
          <span>{{ $t(item.interval) }}</span>
        </li>
      </ol>
    </section>

    <section v-if="authors.length > 0" id="auteurs" class="landing__section">
      <div>
        <div class="landing__eyebrow">{{ $t('03 — the authors') }}</div>
        <h2 class="landing__section-title">{{ $t('written by the community') }}</h2>
      </div>
      <div class="landing__authors">
        <div v-for="author in authors" :key="author.id" class="landing__author">
          <span class="landing__author-avatar" aria-hidden="true">{{ author.initials }}</span>
          <span class="landing__author-text">
            <strong>{{ author.displayName }}</strong>
            <span>{{ author.categoryName }}</span>
          </span>
        </div>
      </div>
    </section>

    <section v-if="isVisitor" id="rejoindre" class="landing__join">
      <div>
        <div class="landing__eyebrow">{{ $t('04 — join us') }}</div>
        <h2 class="landing__section-title">{{ $t('start reviewing today') }}</h2>
      </div>
      <div class="landing__join-actions">
        <v-btn to="/inscription" color="secondary" size="x-large">{{
          $t('create an account')
        }}</v-btn>
        <v-btn to="/connexion" variant="outlined" size="x-large">{{ $t('log in') }}</v-btn>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { latestSubjects, authors, isVisitor, leitnerBoxes } = await useLandingPage()

useHead({ title: () => t('learn everything, remember everything'), titleTemplate: 'CINQ · %s' })
</script>

<style scoped lang="scss">
.landing {
  &__hero {
    display: grid;
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: 2.5rem;
    padding: clamp(2.5rem, 6vw, 5.5rem) clamp(1rem, 5vw, 4rem);
    border-bottom: var(--cinq-border);
  }

  &__hero-text {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    min-width: 0;
  }

  &__eyebrow {
    font-family: var(--cinq-font-mono);
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__title {
    margin: 0;
    font-size: var(--cinq-text-h1);
    line-height: 0.84;
    text-transform: uppercase;
  }

  &__title-accent {
    background: var(--cinq-yellow);
  }

  &__lead {
    max-width: 38.75rem;
    margin: 0;
    font-size: clamp(1.0625rem, 1vw + 0.75rem, 1.375rem);
    line-height: 1.5;
  }

  &__cards {
    position: relative;
    min-height: 26rem;
  }

  &__card {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: min(100%, 22rem);
    padding: 1.5rem;
    border: var(--cinq-border);
    box-shadow: 14px 14px 0 var(--cinq-ink);

    &--recto {
      top: 1rem;
      left: 0;
      background: var(--cinq-white);
      transform: rotate(-7deg);
    }

    &--verso {
      top: 11rem;
      right: 0;
      background: var(--cinq-blue);
      transform: rotate(5deg);
    }
  }

  &__card-face {
    align-self: flex-start;
    padding: 0.25rem 0.625rem;
    background: var(--cinq-ink);
    color: var(--cinq-cream);
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.154em;
    text-transform: uppercase;
  }

  &__card-text {
    font-family: var(--cinq-font-display);
    font-size: 1.75rem;
    font-weight: 900;
    line-height: 1.05;
  }

  &__card-answer {
    font-family: var(--cinq-font-display);
    font-size: 4rem;
    font-weight: 900;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    padding: clamp(2.5rem, 6vw, 5rem) clamp(1rem, 5vw, 4rem);
    border-bottom: var(--cinq-border);

    &--yellow {
      background: var(--cinq-yellow);
    }
  }

  &__section-header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.5rem;
  }

  &__section-title {
    margin: 0.5rem 0 0;
    font-size: var(--cinq-text-h2);
    text-transform: uppercase;
  }

  &__method-text {
    max-width: 35rem;
    margin: 0;
    font-size: 1.125rem;
    line-height: 1.5;
  }

  &__boxes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
    gap: 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__box {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.25rem;
    border: var(--cinq-border);
    background: var(--cinq-cream);
    box-shadow: 6px 6px 0 var(--cinq-ink);
    font-weight: 700;
  }

  &__box-number {
    font-family: var(--cinq-font-display);
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 900;
    line-height: 0.9;
  }

  &__authors {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
    gap: 1.5rem;
  }

  &__author {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    border: var(--cinq-border);
    background: var(--cinq-white);
    box-shadow: 6px 6px 0 var(--cinq-ink);
  }

  &__author-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    border: 3px solid var(--cinq-ink);
    background: var(--cinq-blue);
    font-family: var(--cinq-font-display);
    font-size: 1.375rem;
    font-weight: 900;
  }

  &__author-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__join {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
    padding: clamp(2.5rem, 6vw, 5rem) clamp(1rem, 5vw, 4rem);
    background: var(--cinq-ink);
    color: var(--cinq-cream);
  }

  &__join-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  @media (max-width: 959px) {
    &__hero {
      grid-template-columns: minmax(0, 1fr);
    }

    &__cards {
      display: none;
    }
  }
}
</style>

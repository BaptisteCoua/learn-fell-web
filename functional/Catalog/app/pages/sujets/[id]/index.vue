<template>
  <div>
    <section class="subject-page__hero">
      <div class="subject-page__heading">
        <nav :aria-label="$t('breadcrumb')" class="subject-page__breadcrumb">
          <NuxtLink to="/categories">{{ $t('catalogue') }}</NuxtLink> /
          <NuxtLink :to="`/categories/${subject.category.id}`">{{
            subject.category.name
          }}</NuxtLink>
        </nav>
        <h1 class="subject-page__title">{{ subject.title }}</h1>
        <p class="subject-page__description">{{ subject.description }}</p>
        <div class="subject-page__tags">
          <span v-for="tag in subject.tags" :key="tag.id" class="subject-page__tag">{{
            tag.name
          }}</span>
        </div>
      </div>

      <aside class="subject-page__aside">
        <div class="subject-page__facts">
          <span class="subject-page__count">{{ questions.length }}</span>
          <span class="subject-page__byline">
            {{ $t('questions · by {name}', { name: subject.author.display_name }) }}
          </span>
          <span v-if="publishedOn">{{ $t('published on {date}', { date: publishedOn }) }}</span>
        </div>
        <div class="subject-page__actions">
          <v-btn
            :to="`/sujets/${subject.id}/cartes`"
            :disabled="questions.length === 0"
            color="primary"
            size="x-large"
          >
            {{ $t('card mode') }}
          </v-btn>
          <NuxtLink v-if="isVisitor" to="/connexion" class="subject-page__report-link">
            {{ $t('log in to report this subject') }}
          </NuxtLink>
        </div>
      </aside>
    </section>

    <section v-if="isVisitor" :aria-label="$t('learning')" class="subject-page__learn">
      <strong class="subject-page__learn-title">{{ $t('learn this subject') }}</strong>
      <span>
        {{
          $t('create a free account to review its {count} cards with the leitner method.', {
            count: questions.length,
          })
        }}
      </span>
      <div class="subject-page__learn-actions">
        <v-btn to="/inscription" color="secondary" size="large">{{
          $t('create an account')
        }}</v-btn>
        <v-btn to="/connexion" variant="outlined" size="large">{{ $t('log in') }}</v-btn>
      </div>
    </section>

    <section class="subject-page__questions">
      <div class="subject-page__questions-header">
        <h2 class="subject-page__questions-title">{{ $t('questions') }}</h2>
        <v-btn v-if="questions.length > 0" variant="outlined" @click="toggleAll">
          {{ areAllRevealed ? $t('hide all the answers') : $t('show all the answers') }}
        </v-btn>
      </div>
      <p v-if="questions.length === 0">{{ $t('this subject has no question yet.') }}</p>
      <QuestionItem
        v-for="(question, index) in questions"
        :key="question.id"
        :question
        :index
        :is-revealed="isRevealed(question.id)"
        @toggle="toggle(question.id)"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const {
  subject,
  questions,
  publishedOn,
  isVisitor,
  isRevealed,
  areAllRevealed,
  toggle,
  toggleAll,
} = await useSubjectDetails(Number(route.params.id))

useHead({ title: subject.title })
</script>

<style scoped lang="scss">
.subject-page {
  &__hero {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 2rem;
    padding: clamp(2rem, 5vw, 3rem) clamp(1rem, 5vw, 4rem);
    border-bottom: var(--cinq-border);
    background: var(--cinq-blue);
  }

  &__heading {
    display: flex;
    flex-direction: column;
    grid-column: span 8;
    gap: 1.25rem;
    min-width: 0;
  }

  &__breadcrumb {
    font-family: var(--cinq-font-mono);
    font-size: 0.9375rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__title {
    margin: 0;
    font-size: clamp(2.25rem, 7vw, 6rem);
    line-height: 0.88;
  }

  &__description {
    max-width: 47.5rem;
    margin: 0;
    font-size: clamp(1.0625rem, 1vw + 0.75rem, 1.3125rem);
    line-height: 1.45;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
  }

  &__tag {
    padding: 0.375rem 0.75rem;
    border: 3px solid var(--cinq-ink);
    background: var(--cinq-cream);
    font-size: 0.9375rem;
    font-weight: 700;
  }

  &__aside {
    display: flex;
    flex-direction: column;
    grid-column: span 4;
    align-self: end;
    gap: 1rem;
  }

  &__facts {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 1.5rem;
    border: var(--cinq-border);
    background: var(--cinq-cream);
    box-shadow: 8px 8px 0 var(--cinq-ink);
    font-size: 0.9375rem;
  }

  &__count {
    font-family: var(--cinq-font-display);
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 900;
    line-height: 0.9;
  }

  &__byline {
    font-size: 1.0625rem;
    font-weight: 700;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__report-link {
    font-weight: 700;
  }

  &__learn {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 2rem clamp(1rem, 5vw, 4rem);
    border-bottom: var(--cinq-border);
    background: var(--cinq-white);
    font-size: 1.125rem;
    line-height: 1.5;
  }

  &__learn-title {
    font-family: var(--cinq-font-display);
    font-size: clamp(1.375rem, 3vw, 1.875rem);
    font-weight: 900;
    text-transform: uppercase;
  }

  &__learn-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
  }

  &__questions {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    padding: clamp(2rem, 5vw, 3rem) clamp(1rem, 5vw, 4rem);
  }

  &__questions-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  &__questions-title {
    margin: 0;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    text-transform: uppercase;
  }

  @media (max-width: 959px) {
    &__heading,
    &__aside {
      grid-column: 1 / -1;
    }
  }
}
</style>

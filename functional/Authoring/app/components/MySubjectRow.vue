<template>
  <article class="my-subject-row">
    <div class="my-subject-row__status"><SubjectStatusBadge :status="subject.status" /></div>
    <div class="my-subject-row__main">
      <span class="my-subject-row__category">{{ subject.category.name }}</span>
      <NuxtLink :to="`/sujets/${subject.id}/modifier`" class="my-subject-row__title">{{
        subject.title
      }}</NuxtLink>
      <span class="my-subject-row__updated">{{
        $t('changed on {date}', { date: updatedOn })
      }}</span>
      <p
        v-if="subject.status === 'retired' && subject.retired_reason"
        class="my-subject-row__reason"
      >
        <strong>{{ $t('moderation reason:') }}</strong> {{ subject.retired_reason }}
      </p>
    </div>
    <div class="my-subject-row__count">
      <span class="my-subject-row__number">{{ subject.questions_count ?? 0 }}</span>
      <span>{{ $t('questions') }}</span>
    </div>
    <div class="my-subject-row__actions">
      <template v-if="subject.status === 'draft'">
        <v-btn :to="`/sujets/${subject.id}/modifier`" variant="outlined">{{ $t('edit') }}</v-btn>
        <v-btn color="primary" @click="emit('publish', subject)">{{ $t('publish') }}</v-btn>
      </template>
      <template v-else-if="subject.status === 'published'">
        <v-btn :to="`/sujets/${subject.id}`" variant="outlined">{{ $t('view') }}</v-btn>
        <v-btn :to="`/sujets/${subject.id}/modifier`" variant="outlined">{{ $t('edit') }}</v-btn>
        <v-btn color="secondary" @click="emit('unpublish', subject)">{{ $t('unpublish') }}</v-btn>
      </template>
      <v-btn v-else :to="`/sujets/${subject.id}/modifier`" variant="outlined">{{
        $t('consult')
      }}</v-btn>
      <v-btn
        icon="mdi-delete-outline"
        variant="outlined"
        :aria-label="$t('delete “{title}”', { title: subject.title })"
        @click="emit('delete', subject)"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  subject: { type: Object as PropType<Subject>, required: true },
})
const emit = defineEmits<{ publish: [Subject]; unpublish: [Subject]; delete: [Subject] }>()

const updatedOn = computed(() =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(
    new Date(props.subject.updated_at),
  ),
)
</script>

<style scoped lang="scss">
.my-subject-row {
  display: grid;
  grid-template-columns: 10rem minmax(0, 1fr) 8rem auto;
  border: var(--cinq-border);
  background: var(--cinq-white);
  box-shadow: 6px 6px 0 var(--cinq-ink);

  &__status,
  &__main,
  &__count,
  &__actions {
    padding: 1.25rem;
  }

  &__status {
    display: flex;
    border-right: var(--cinq-border);
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    min-width: 0;
  }

  &__category {
    font-family: var(--cinq-font-mono);
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__title {
    font-family: var(--cinq-font-display);
    font-size: clamp(1.25rem, 2vw + 0.5rem, 1.75rem);
    font-weight: 900;
    line-height: 1.05;
    text-decoration: none;
  }

  &__updated {
    font-size: 0.9375rem;
    color: var(--cinq-muted);
  }

  &__reason {
    margin: 0.25rem 0 0;
    padding: 0.5rem 0.75rem;
    background: var(--cinq-ink);
    color: var(--cinq-cream);
    font-size: 0.9375rem;
  }

  &__count {
    display: flex;
    flex-direction: column;
    border-left: var(--cinq-border);
    font-size: 0.875rem;
    font-weight: 700;
  }

  &__number {
    font-family: var(--cinq-font-display);
    font-size: 2.25rem;
    font-weight: 900;
    line-height: 1;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    border-left: var(--cinq-border);
  }

  @media (max-width: 959px) {
    grid-template-columns: minmax(0, 1fr) auto;

    &__status {
      grid-column: 1 / -1;
      border-right: 0;
      border-bottom: var(--cinq-border);
      padding-bottom: 0.75rem;
    }

    &__count {
      border-left: var(--cinq-border);
    }

    &__actions {
      grid-column: 1 / -1;
      justify-content: flex-start;
      border-top: var(--cinq-border);
      border-left: 0;
    }
  }
}
</style>

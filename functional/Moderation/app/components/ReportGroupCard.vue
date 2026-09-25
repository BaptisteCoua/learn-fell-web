<template>
  <article class="report-group">
    <div class="report-group__row">
      <div class="report-group__count">
        <strong>{{ group.reports.length }}</strong>
        <span>{{ $t('reports | report | reports', group.reports.length) }}</span>
      </div>
      <div class="report-group__subject">
        <span class="report-group__meta">{{ meta }}</span>
        <NuxtLink :to="`/sujets/${group.subject.id}`" class="report-group__title">{{
          group.subject.title
        }}</NuxtLink>
        <span>{{ $t('oldest report: {age}', { age: relativeTime(group.oldestAt) }) }}</span>
      </div>
      <ul class="report-group__reasons">
        <li v-for="item in group.reasonCounts" :key="item.reason">
          <span>{{ labelOf(item.reason) }}</span
          ><strong>{{ item.count }}</strong>
        </li>
      </ul>
      <div class="report-group__actions">
        <v-btn color="primary" @click="emit('retire', group)">{{ $t('retire the subject') }}</v-btn>
        <div class="cinq-actions">
          <v-btn variant="outlined" @click="emit('ignore', group)">{{
            $t('ignore the reports')
          }}</v-btn>
          <v-btn variant="outlined" :aria-expanded="isOpen" @click="toggle">
            {{ isOpen ? $t('hide') : $t('comments') }}
          </v-btn>
        </div>
      </div>
    </div>
    <div v-if="isOpen" class="report-group__comments">
      <span class="report-group__comments-title">{{ $t('comments of the reports') }}</span>
      <p v-if="commentedReports.length === 0">{{ $t('no comment.') }}</p>
      <blockquote v-for="report in commentedReports" :key="report.id" class="report-group__comment">
        « {{ report.comment }} » — {{ report.reporter.display_name }},
        {{ labelOf(report.reason).toLowerCase() }}
      </blockquote>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { IReportGroup } from '../composables/useModerationQueue'

const props = defineProps({
  group: { type: Object as PropType<IReportGroup>, required: true },
})
const emit = defineEmits<{ retire: [IReportGroup]; ignore: [IReportGroup] }>()

const { labelOf } = useReportReasons()
const { isOpen, toggle } = useToggle()

const meta = computed(() =>
  [props.group.subject.category?.name, props.group.subject.author?.display_name]
    .filter(Boolean)
    .join(' · '),
)
const commentedReports = computed(() => props.group.reports.filter((report) => report.comment))
</script>

<style scoped lang="scss">
.report-group {
  border: var(--cinq-border);
  background: var(--cinq-white);
  box-shadow: 8px 8px 0 var(--cinq-ink);

  &__row {
    display: grid;
    grid-template-columns: 8rem minmax(0, 1fr) minmax(0, 16rem) minmax(20rem, 24rem);
  }

  &__count {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    border-right: var(--cinq-border);
    background: var(--cinq-yellow);
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.125rem;
    text-transform: uppercase;

    strong {
      font-family: var(--cinq-font-display);
      font-size: 3.5rem;
      font-weight: 900;
      line-height: 0.9;
    }
  }

  &__subject {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
    padding: 1.375rem 1.625rem;
  }

  &__meta {
    font-family: var(--cinq-font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__title {
    font-family: var(--cinq-font-display);
    font-size: clamp(1.25rem, 2vw + 0.5rem, 1.875rem);
    font-weight: 900;
    line-height: 1.05;
  }

  &__reasons {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
    margin: 0;
    padding: 1.375rem 1.625rem;
    border-left: var(--cinq-border);
    font-weight: 700;
    list-style: none;

    li {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.625rem;
    padding: 1.375rem 1.625rem;
    border-left: var(--cinq-border);

    // Long labels in a narrow column: smaller type so that no word is cut.
    :deep(.v-btn) {
      padding-inline: 0.75rem;
      font-size: 0.8125rem;
      letter-spacing: 0;
    }
  }

  &__comments {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    padding: 1.25rem 1.625rem;
    border-top: var(--cinq-border);

    p {
      margin: 0;
    }
  }

  &__comments-title {
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: 0.125rem;
    text-transform: uppercase;
  }

  &__comment {
    margin: 0;
    padding: 0.75rem 1rem;
    border-left: 6px solid var(--cinq-ink);
    background: var(--cinq-cream);
    line-height: 1.45;
  }

  @media (max-width: 1199px) {
    &__row {
      grid-template-columns: 6rem minmax(0, 1fr);
    }

    &__reasons,
    &__actions {
      grid-column: 1 / -1;
      border-top: var(--cinq-border);
      border-left: 0;
    }
  }
}
</style>

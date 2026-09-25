<template>
  <li class="category-admin-row">
    <span class="category-admin-row__position" aria-hidden="true">{{ position }}</span>
    <div v-if="!isRenaming" class="category-admin-row__name">{{ category.name }}</div>
    <form v-else class="category-admin-row__rename" @submit.prevent="emit('save')">
      <label :for="inputId" class="category-admin-row__hidden-label">{{
        $t('new name of the category')
      }}</label>
      <v-text-field
        :id="inputId"
        v-model="draftName"
        :error-messages="error ? [error] : []"
        hide-details="auto"
        autofocus
      />
    </form>
    <span class="category-admin-row__count">
      <strong>{{ category.subjects_count ?? 0 }}</strong>
      <span>{{ $t('subjects') }}</span>
    </span>
    <div class="category-admin-row__tools">
      <template v-if="!isRenaming">
        <v-btn
          icon="mdi-chevron-up"
          variant="outlined"
          size="small"
          :disabled="isFirst"
          :aria-label="$t('move {name} up', { name: category.name })"
          @click="emit('move', -1)"
        />
        <v-btn
          icon="mdi-chevron-down"
          variant="outlined"
          size="small"
          :disabled="isLast"
          :aria-label="$t('move {name} down', { name: category.name })"
          @click="emit('move', 1)"
        />
        <v-btn
          icon="mdi-pencil-outline"
          variant="outlined"
          size="small"
          :aria-label="$t('rename {name}', { name: category.name })"
          @click="emit('rename')"
        />
        <v-btn
          icon="mdi-delete-outline"
          variant="outlined"
          size="small"
          :aria-label="$t('delete {name}', { name: category.name })"
          @click="emit('delete')"
        />
      </template>
      <div v-else class="cinq-actions">
        <v-btn variant="outlined" @click="emit('cancel')">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="emit('save')">{{ $t('save') }}</v-btn>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const draftName = defineModel<string>('draftName', { required: true })

const props = defineProps({
  category: { type: Object as PropType<Category>, required: true },
  index: { type: Number, required: true },
  isFirst: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
  isRenaming: { type: Boolean, default: false },
  error: { type: String, default: '' },
})
const emit = defineEmits<{ move: [-1 | 1]; rename: []; delete: []; cancel: []; save: [] }>()

const inputId = useId()
const position = computed(() => String(props.index + 1).padStart(2, '0'))
</script>

<style scoped lang="scss">
.category-admin-row {
  display: grid;
  grid-template-columns: 4.5rem minmax(0, 1fr) 8rem auto;
  border: var(--cinq-border);
  background: var(--cinq-white);

  &__position {
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: var(--cinq-border);
    background: var(--cinq-yellow);
    font-family: var(--cinq-font-display);
    font-size: 1.375rem;
    font-weight: 900;
  }

  &__name {
    display: flex;
    align-items: center;
    min-width: 0;
    padding: 1.125rem 1.375rem;
    font-family: var(--cinq-font-display);
    font-size: clamp(1.25rem, 2vw + 0.5rem, 1.625rem);
    font-weight: 800;
    overflow-wrap: anywhere;
  }

  &__rename {
    min-width: 0;
    padding: 0.625rem 1rem;
  }

  &__hidden-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  &__count {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 1.125rem 1.25rem;
    border-left: var(--cinq-border);
    font-size: 0.875rem;
    font-weight: 700;

    strong {
      font-family: var(--cinq-font-display);
      font-size: 1.875rem;
      font-weight: 900;
      line-height: 0.9;
    }
  }

  &__tools {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem;
    padding: 0.625rem 0.875rem;
    border-left: var(--cinq-border);
  }

  @media (max-width: 767px) {
    grid-template-columns: 3.5rem minmax(0, 1fr) auto;

    &__tools {
      grid-column: 1 / -1;
      justify-content: flex-end;
      border-top: var(--cinq-border);
      border-left: 0;
    }
  }
}
</style>

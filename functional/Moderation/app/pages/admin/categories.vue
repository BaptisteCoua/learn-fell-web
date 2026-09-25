<template>
  <div class="categories-admin">
    <section class="categories-admin__hero">
      <div>
        <div class="categories-admin__eyebrow">
          {{ $t('administration / categories · {count}', { count: categories.length }) }}
        </div>
        <h1 class="categories-admin__title">{{ $t('categories') }}</h1>
      </div>
      <p class="categories-admin__lead">
        {{
          $t('the order below is the one of the catalogue and of the choice offered to authors.')
        }}
      </p>
    </section>

    <section class="categories-admin__content">
      <ol :aria-label="$t('categories')" class="categories-admin__list">
        <CategoryAdminRow
          v-for="(category, index) in categories"
          :key="category.id"
          v-model:draft-name="draftName"
          :category
          :index
          :is-first="index === 0"
          :is-last="index === categories.length - 1"
          :is-renaming="renamingId === category.id"
          :error="renamingId === category.id ? renameError : ''"
          @move="(step) => move(index, step)"
          @rename="startRename(category)"
          @cancel="cancelRename"
          @save="saveRename(category)"
          @delete="askToDelete(category)"
        />
      </ol>

      <form class="categories-admin__new" @submit.prevent="create">
        <label :for="newId" class="categories-admin__label">{{ $t('new category') }}</label>
        <div class="categories-admin__new-row">
          <v-text-field
            :id="newId"
            v-model="newName"
            :placeholder="$t('e.g. philosophy')"
            :error-messages="createError ? [createError] : []"
            hide-details="auto"
          />
          <v-btn type="submit" color="secondary" size="x-large" prepend-icon="mdi-plus">{{
            $t('add')
          }}</v-btn>
        </div>
        <span class="categories-admin__hint">
          {{
            $t('one level only. two categories cannot share a name, ignoring capitals and accents.')
          }}
        </span>
      </form>
    </section>

    <ConfirmDialog
      :open="dialog === 'refused'"
      :title="$t('cannot delete')"
      :cancel-label="$t('got it')"
      @close="closeDialog"
    >
      {{
        $t(
          '“{name}” holds {count} subjects, whatever their status. a category can be deleted only once it is empty.',
          {
            name: target?.name,
            count: target?.subjects_count ?? 0,
          },
        )
      }}
    </ConfirmDialog>
    <ConfirmDialog
      :open="dialog === 'confirm'"
      :title="$t('delete “{name}”?', { name: target?.name })"
      :confirm-label="$t('delete the category')"
      danger
      @close="closeDialog"
      @confirm="confirmDelete"
    >
      {{
        $t(
          'this category holds no subject. it will disappear from the catalogue and from the choice offered to authors.',
        )
      }}
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'permission', permission: 'categories.manage' })

const { t } = useI18n()
const newId = useId()
const {
  categories,
  newName,
  createError,
  renamingId,
  draftName,
  renameError,
  dialog,
  target,
  create,
  startRename,
  cancelRename,
  saveRename,
  move,
  askToDelete,
  closeDialog,
  confirmDelete,
} = await useCategoryAdmin()

useHead({ title: () => t('categories') })
</script>

<style scoped lang="scss">
.categories-admin {
  &__hero {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.5rem 2.5rem;
    padding: clamp(2rem, 5vw, 3rem) clamp(1rem, 5vw, 4rem) 2rem;
    border-bottom: var(--cinq-border);
  }

  &__eyebrow,
  &__label {
    font-family: var(--cinq-font-mono);
    font-size: 0.9375rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__title {
    margin: 0.5rem 0 0;
    font-size: clamp(2.5rem, 9vw, 6.5rem);
    line-height: 0.86;
    text-transform: uppercase;
  }

  &__lead {
    max-width: 28rem;
    margin: 0;
    font-size: 1.125rem;
    line-height: 1.5;
  }

  &__content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 28rem);
    align-items: start;
    gap: 2.5rem;
    padding: 2.5rem clamp(1rem, 5vw, 4rem);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__new {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    padding: 1.75rem;
    border: var(--cinq-border);
    background: var(--cinq-white);
    box-shadow: 8px 8px 0 var(--cinq-ink);
  }

  &__new-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 0.75rem;

    > :first-child {
      flex: 1 1 12rem;
    }
  }

  &__hint {
    font-size: 0.9375rem;
    color: var(--cinq-muted);
  }

  @media (max-width: 959px) {
    &__content {
      grid-template-columns: minmax(0, 1fr);
    }

    &__new {
      order: -1;
    }
  }
}
</style>

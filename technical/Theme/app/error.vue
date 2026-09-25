<template>
  <v-app>
    <NuxtLayout>
      <section class="error-page">
        <div class="error-page__text">
          <div class="error-page__eyebrow">
            {{ $t('error {code}', { code: error.statusCode }) }}
          </div>
          <h1 class="error-page__title">
            {{ isNotFound ? $t('content not found') : $t('something went wrong') }}
          </h1>
          <p class="error-page__lead">
            {{
              isNotFound
                ? $t(
                    'this subject does not exist, or it is no longer available. its author may have unpublished it.',
                  )
                : $t('something went wrong, please try again')
            }}
          </p>
          <div class="error-page__actions">
            <v-btn color="primary" size="x-large" @click="leaveTo('/categories')">
              {{ $t('explore the catalogue') }}
            </v-btn>
            <v-btn variant="outlined" size="x-large" @click="leaveTo('/')">
              {{ $t('back to home') }}
            </v-btn>
          </div>
        </div>
        <div class="error-page__cards" aria-hidden="true">
          <div class="error-page__card error-page__card--white">4</div>
          <div class="error-page__card error-page__card--yellow">04</div>
        </div>
      </section>
    </NuxtLayout>
  </v-app>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
import type { PropType } from 'vue'

const props = defineProps({
  error: { type: Object as PropType<NuxtError>, required: true },
})

const { t } = useI18n()
const { isNotFound, leaveTo } = useErrorPage(props.error)

useHead({ title: () => (isNotFound.value ? t('content not found') : t('something went wrong')) })
</script>

<style scoped lang="scss">
.error-page {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  align-items: center;
  gap: 2rem;
  padding: clamp(3rem, 8vw, 5.5rem) clamp(1rem, 5vw, 4rem);

  &__text {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    min-width: 0;
  }

  &__eyebrow {
    font-family: var(--cinq-font-mono);
    font-size: 1.125rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__title {
    margin: 0;
    font-size: clamp(2.75rem, 10vw, 8rem);
    line-height: 0.84;
    text-transform: uppercase;
  }

  &__lead {
    max-width: 38.75rem;
    margin: 0;
    font-size: clamp(1.0625rem, 1vw + 0.75rem, 1.375rem);
    line-height: 1.5;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  &__cards {
    position: relative;
    min-height: 30rem;
  }

  &__card {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: min(100%, 22.5rem);
    height: 15rem;
    border: var(--cinq-border);
    box-shadow: 14px 14px 0 var(--cinq-ink);
    font-family: var(--cinq-font-display);
    font-size: 8.75rem;
    font-weight: 900;

    &--white {
      top: 1.25rem;
      left: 0;
      background: var(--cinq-white);
      transform: rotate(-8deg);
    }

    &--yellow {
      top: 11.25rem;
      right: 0;
      background: var(--cinq-yellow);
      transform: rotate(6deg);
    }
  }

  @media (max-width: 959px) {
    grid-template-columns: minmax(0, 1fr);

    &__cards {
      display: none;
    }
  }
}
</style>

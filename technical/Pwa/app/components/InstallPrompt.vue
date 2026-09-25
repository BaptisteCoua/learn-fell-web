<template>
  <v-bottom-sheet :model-value="isNativePromptOpen || isIosOpen" persistent>
    <div role="document" class="install-prompt">
      <div class="install-prompt__identity">
        <AppMark />
        <div>
          <h2 class="install-prompt__title">
            {{ isIosOpen ? $t('install on iphone') : $t('install cinq') }}
          </h2>
          <span class="install-prompt__host">{{ host }}</span>
        </div>
      </div>

      <template v-if="isIosOpen">
        <p>{{ $t('safari shows no install button. three gestures are enough:') }}</p>
        <ol class="install-prompt__steps">
          <li class="install-prompt__step">
            <span class="install-prompt__number">1</span>
            <span>{{ $t('tap the share button at the bottom of safari.') }}</span>
            <v-icon icon="mdi-export-variant" />
          </li>
          <li class="install-prompt__step">
            <span class="install-prompt__number">2</span>
            <span>{{ $t('choose add to home screen.') }}</span>
            <v-icon icon="mdi-plus-box-outline" />
          </li>
          <li class="install-prompt__step">
            <span class="install-prompt__number">3</span>
            <span>{{ $t('tap add at the top right.') }}</span>
          </li>
        </ol>
        <v-btn color="primary" size="x-large" block @click="closeIos">{{ $t('got it') }}</v-btn>
      </template>

      <template v-else>
        <p>
          {{
            $t(
              'add cinq to your home screen: the application opens full screen, like an application of the phone.',
            )
          }}
        </p>
        <div class="cinq-actions">
          <v-btn variant="outlined" size="x-large" @click="later">{{ $t('later') }}</v-btn>
          <v-btn color="secondary" size="x-large" @click="install">{{ $t('install') }}</v-btn>
        </div>
      </template>
    </div>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
const { isNativePromptOpen, isIosOpen, install, later, closeIos } = usePwaInstall()

const host = computed(() => useRequestURL().host)
</script>

<style scoped lang="scss">
.install-prompt {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.375rem 1.25rem 1.5rem;
  border-top: var(--cinq-border);
  background: var(--cinq-cream);
  box-shadow: 0 -10px 0 var(--cinq-yellow);
  font-size: 1rem;
  line-height: 1.5;

  p {
    margin: 0;
  }

  &__identity {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }

  &__title {
    margin: 0;
    font-size: clamp(1.25rem, 6vw, 1.5rem);
    line-height: 1;
    text-transform: uppercase;
  }

  &__host {
    font-size: 0.875rem;
    color: var(--cinq-muted);
  }

  &__steps {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__step {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0.875rem;
    border: 3px solid var(--cinq-ink);
    background: var(--cinq-white);

    > span:nth-child(2) {
      flex-grow: 1;
    }
  }

  &__number {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: var(--cinq-ink);
    color: var(--cinq-cream);
    font-family: var(--cinq-font-display);
    font-weight: 900;
  }
}
</style>

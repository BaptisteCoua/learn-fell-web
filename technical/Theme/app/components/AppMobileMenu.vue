<template>
  <div class="app-mobile-menu">
    <button
      type="button"
      :class="['app-mobile-menu__toggle', `app-mobile-menu__toggle--${currentLink?.tone ?? 'ink'}`]"
      :aria-label="
        currentLink ? $t('menu, current page: {page}', { page: currentLink.label }) : undefined
      "
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      @click="open"
    >
      <span class="app-mobile-menu__current">
        <v-icon v-if="currentLink" :icon="currentLink.icon" />
        {{ currentLink?.label ?? $t('menu') }}
      </span>
      <v-icon icon="mdi-chevron-up" />
    </button>

    <v-bottom-sheet v-model="isOpen">
      <nav :aria-label="$t('main navigation')" class="app-mobile-menu__sheet">
        <ul class="app-mobile-menu__tiles">
          <li v-for="link in menuLinks" :key="link.to" class="app-mobile-menu__item">
            <NuxtLink
              :to="link.to"
              :aria-current="isActive(link) ? 'page' : undefined"
              :class="[
                'app-mobile-menu__tile',
                `app-mobile-menu__tile--${link.tone}`,
                { 'app-mobile-menu__tile--active': isActive(link) },
              ]"
              @click="close"
            >
              <v-icon :icon="link.icon" size="28" />
              <span class="app-mobile-menu__label">{{ link.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </v-bottom-sheet>
  </div>
</template>

<script setup lang="ts">
const { menuLinks, currentLink, isActive, isOpen, open, close } = useAppMobileMenu()
</script>

<style scoped lang="scss">
$tones: (
  yellow: var(--cinq-yellow),
  blue: var(--cinq-blue),
  white: var(--cinq-white),
  ink: var(--cinq-ink),
);

.app-mobile-menu {
  &__toggle {
    position: fixed;
    inset: auto 0 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 64px;
    padding: 0 1.25rem env(safe-area-inset-bottom);
    border-top: var(--cinq-border);
    color: var(--cinq-ink);
    font-family: var(--cinq-font-display);
    font-size: 1rem;
    font-weight: 900;
    text-transform: uppercase;

    @each $tone, $background in $tones {
      &--#{$tone} {
        background: $background;
      }
    }

    &--ink {
      color: var(--cinq-cream);
    }
  }

  &__current {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  &__sheet {
    padding-bottom: env(safe-area-inset-bottom);
    border-top: var(--cinq-border);
    background: var(--cinq-ink);
  }

  &__tiles {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__item:last-child:nth-child(odd) {
    grid-column: 1 / -1;
  }

  &__tile {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 0.375rem;
    min-height: 7.5rem;
    height: 100%;
    padding: 1rem;
    color: var(--cinq-ink);
    font-family: var(--cinq-font-display);
    font-size: 1.25rem;
    font-weight: 900;
    text-decoration: none;

    @each $tone, $background in $tones {
      &--#{$tone} {
        background: $background;
      }
    }

    &--ink {
      color: var(--cinq-cream);
    }

    &--active .app-mobile-menu__label {
      text-decoration: underline;
      text-decoration-thickness: 4px;
      text-underline-offset: 6px;
    }
  }
}
</style>

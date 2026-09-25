<template>
  <header class="app-header">
    <NuxtLink to="/" class="app-header__logo">CINQ</NuxtLink>

    <nav :aria-label="$t('main navigation')" class="app-header__nav">
      <NuxtLink
        v-for="link in headerLinks"
        :key="link.to"
        :to="link.to"
        :aria-current="isActive(link) ? 'page' : undefined"
        :class="['cinq-tab', { 'cinq-tab--active': isActive(link) }]"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>

    <div class="app-header__actions">
      <template v-if="isSignedIn">
        <NuxtLink to="/sujets/nouveau" class="app-header__cell app-header__cell--yellow">
          {{ $t('create a subject') }}
        </NuxtLink>
        <!-- The account menu belongs to the Account layer, like the pages it opens. -->
        <AccountMenu />
      </template>
      <template v-else>
        <NuxtLink to="/connexion" class="app-header__cell">{{ $t('log in') }}</NuxtLink>
        <NuxtLink to="/inscription" class="app-header__cell app-header__cell--yellow">
          {{ $t('create an account') }}
        </NuxtLink>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts">
const { headerLinks, isActive, isSignedIn } = useAppNavigation()
</script>

<style scoped lang="scss">
.app-header {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  height: 88px;
  border-bottom: var(--cinq-border);
  background: var(--cinq-cream);

  &__logo {
    display: flex;
    align-items: center;
    padding: 0 2.5rem;
    background: var(--cinq-ink);
    color: var(--cinq-cream);
    font-family: var(--cinq-font-display);
    font-size: 1.875rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    text-decoration: none;
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 2.5rem;
    font-size: 1.0625rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  &__actions {
    display: flex;
    align-items: stretch;
  }

  &__cell {
    display: flex;
    align-items: center;
    padding: 0 2rem;
    border-left: var(--cinq-border);
    font-weight: 700;
    text-decoration: none;

    &--yellow {
      background: var(--cinq-yellow);
    }
  }
}
</style>

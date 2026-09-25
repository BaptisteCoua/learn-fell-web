<template>
  <nav :aria-label="$t('main navigation')" class="app-tab-bar">
    <NuxtLink
      v-for="link in tabLinks"
      :key="link.to"
      :to="link.to"
      :aria-current="isActive(link) ? 'page' : undefined"
      :class="['app-tab-bar__tab', { 'app-tab-bar__tab--active': isActive(link) }]"
    >
      {{ link.label }}
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const { tabLinks, isActive } = useAppNavigation()
</script>

<style scoped lang="scss">
.app-tab-bar {
  position: fixed;
  inset: auto 0 0;
  z-index: 5;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border-top: var(--cinq-border);
  background: var(--cinq-cream);

  &__tab {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 64px;
    font-size: 0.8125rem;
    font-weight: 700;
    text-decoration: none;

    & + & {
      border-left: var(--cinq-border);
    }

    &--active {
      background: var(--cinq-yellow);
    }
  }
}
</style>

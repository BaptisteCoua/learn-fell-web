<template>
  <div class="default-layout">
    <div class="d-none d-md-block"><AppHeader /></div>
    <div class="d-md-none"><AppMobileHeader /></div>
    <main class="default-layout__main">
      <slot />
    </main>
    <div class="d-md-none"><AppTabBar /></div>
  </div>
</template>

<style scoped lang="scss">
.default-layout__main {
  min-height: 60vh;
}

@media (max-width: 959px) {
  .default-layout__main {
    padding-bottom: 72px;
  }
}
</style>

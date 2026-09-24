export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  pinia: {
    // Relative, so each layer's app/stores is auto-imported (an absolute default only covers the root).
    storesDirs: ['stores'],
  },
})

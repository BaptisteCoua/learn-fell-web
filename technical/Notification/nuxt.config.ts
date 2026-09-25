import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  css: [
    'vue3-toastify/dist/index.css',
    fileURLToPath(new URL('./app/assets/toast.scss', import.meta.url)),
  ],
})

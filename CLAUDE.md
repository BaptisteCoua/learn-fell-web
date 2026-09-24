# Learn Fell — Web

Nuxt 4 front of Learn Fell, shipped as a PWA — there is no native mobile app. It consumes
the `back` repo (Laravel API). Part of the `learn-fell-workspace` spec-kit workspace: open
sessions at the workspace root.

## Stack

- Nuxt 4, Vue 3, TypeScript 6 (typescript-eslint does not support 7 yet), pnpm only.
- Architecture: `nuxt-osdd` layers at the root — `technical/<Layer>` for infrastructure, `functional/<Layer>` for business domains, PascalCase, declared in `nuxt.config.ts` under `osdd`. No root `app/`.
- Vuetify through `vuetify-nuxt-module` (`technical/Vuetify`, project colours in `technical/Theme`); Vuetify's `useLayout` is auto-imported as `useVLayout`.
- `@nuxtjs/i18n` (`technical/Internationalization`), French only; each layer keeps its keys in `<layer>/i18n/locales/fr.json`.
- PWA through `@vite-pwa/nuxt` (`technical/Pwa`), state with Pinia (`technical/State`), API calls through `laravel-raom-nuxt` models (`technical/ApiClient`).

## Run

```bash
pnpm install
pnpm dev          # http://localhost:3000, API expected on http://localhost:8090
pnpm build        # generates sw.js and manifest.webmanifest
```

## Test

```bash
pnpm test         # Vitest + @nuxt/test-utils, happy-dom; tests live in <layer>/tests/
pnpm lint
pnpm exec prettier --check .
```

## Commits

Imperative English subject line, no AI attribution trailer.

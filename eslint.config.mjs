import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      // Prettier writes void elements as `<br />`; let it own that formatting.
      'vue/html-self-closing': ['warn', { html: { void: 'any' } }],
    },
  },
  {
    // Page names are French route segments (`nouveau`, `modifier`), in every layer.
    files: ['**/pages/**/*.vue'],
    rules: { 'vue/multi-word-component-names': 'off' },
  },
)

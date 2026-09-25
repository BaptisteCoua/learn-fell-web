<template>
  <!-- The HTML is sanitized by the API on save (allow-list: p, strong, em, lists, code, links). -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="rich-text-view" v-html="html" />
</template>

<script setup lang="ts">
defineProps({
  html: { type: String, required: true },
})
</script>

<style scoped lang="scss">
.rich-text-view {
  line-height: 1.5;
  // "anywhere" also lowers the minimum width, so a long word never pushes the page sideways.
  overflow-wrap: anywhere;

  :deep(p) {
    margin: 0 0 0.5rem;
  }

  :deep(ul),
  :deep(ol) {
    margin: 0 0 0.5rem;
    padding-left: 1.5rem;
  }

  :deep(code) {
    padding: 0.125rem 0.5rem;
    background: var(--cinq-ink);
    color: var(--cinq-cream);
    font-size: 0.92em;
  }

  :deep(pre) {
    margin: 0 0 0.5rem;
    padding: 1rem 1.25rem;
    background: var(--cinq-ink);
    color: var(--cinq-cream);
    overflow-x: auto;
    white-space: pre-wrap;
  }

  :deep(pre code) {
    padding: 0;
    background: none;
  }

  :deep(a) {
    font-weight: 700;
  }
}
</style>

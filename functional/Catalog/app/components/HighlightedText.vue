<template>
  <span>
    <template v-for="(segment, index) in segments" :key="index">
      <mark v-if="segment.isMatch" class="highlighted-text__mark">{{ segment.text }}</mark>
      <template v-else>{{ segment.text }}</template>
    </template>
  </span>
</template>

<script setup lang="ts">
const props = defineProps({
  text: { type: String, required: true },
  query: { type: String, default: '' },
})

const segments = computed(() => splitHighlight(props.text, props.query))
</script>

<style scoped>
.highlighted-text__mark {
  padding: 0 0.1875rem;
  background: var(--cinq-yellow);
  color: var(--cinq-ink);
}
</style>

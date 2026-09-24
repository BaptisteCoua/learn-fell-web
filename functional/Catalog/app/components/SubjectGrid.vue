<template>
  <div class="subject-grid">
    <SubjectCard v-for="(subject, index) in subjects" :key="subject.id" :subject :index :query />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  subjects: { type: Array as PropType<Subject[]>, required: true },
  query: { type: String, default: '' },
})
</script>

<style scoped>
.subject-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
  gap: clamp(1.25rem, 3vw, 2rem);
}
</style>

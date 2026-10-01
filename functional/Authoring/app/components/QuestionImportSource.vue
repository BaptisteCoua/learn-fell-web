<template>
  <section class="question-import-source">
    <v-tabs v-model="kind" color="primary" class="question-import-source__tabs">
      <v-tab value="file">{{ $t('file') }}</v-tab>
      <v-tab value="text">{{ $t('paste') }}</v-tab>
    </v-tabs>

    <div v-if="kind === 'file'" class="question-import-source__panel">
      <p class="question-import-source__help">
        {{
          $t(
            'one question per line: the recto in the first column, the verso in the second. bold, italic, lists, code and links written in markdown are kept.',
          )
        }}
      </p>
      <div class="question-import-source__actions">
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-file-upload-outline"
          :loading="isReading"
          @click="open"
        >
          {{ $t('choose a file') }}
        </v-btn>
        <a :href="templateUrl" download class="cinq-standalone-link">{{
          $t('download the template')
        }}</a>
      </div>
      <input ref="input" type="file" :accept hidden @change="onChange" />
    </div>

    <div v-else class="question-import-source__panel">
      <p class="question-import-source__help">
        {{
          $t(
            'copy two columns from your spreadsheet, or the export of anki or quizlet, and paste them here: one question per line.',
          )
        }}
      </p>
      <v-textarea
        v-model="text"
        :label="$t('recto and verso, separated by a tab')"
        rows="8"
        auto-grow
        hide-details
        class="question-import-source__text"
      />
      <div class="question-import-source__actions">
        <v-btn
          color="primary"
          size="large"
          :disabled="text.trim() === ''"
          :loading="isReading"
          @click="emit('text')"
          >{{ $t('see the preview') }}</v-btn
        >
      </div>
    </div>

    <p v-if="error" role="alert" class="question-import-source__error">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { IMPORT_EXTENSIONS, type ImportSourceKind } from '../composables/useQuestionImport'

defineProps({
  templateUrl: { type: String, required: true },
  isReading: { type: Boolean, default: false },
  error: { type: String, default: null },
})
const kind = defineModel<ImportSourceKind>('kind', { required: true })
const text = defineModel<string>('text', { required: true })
const emit = defineEmits<{ file: [File]; text: [] }>()

const { input, open, onChange, accept } = useFilePicker(([file]) => {
  if (file) {
    emit('file', file)
  }
}, IMPORT_EXTENSIONS.join(','))
</script>

<style scoped lang="scss">
.question-import-source {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border: var(--cinq-border);
  background: var(--cinq-white);
  box-shadow: 6px 6px 0 var(--cinq-ink);

  &__tabs {
    border-bottom: var(--cinq-border);
  }

  &__panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__help {
    margin: 0;
  }

  &__text :deep(textarea) {
    font-family: var(--cinq-font-mono);
    tab-size: 4;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 1.5rem;
  }

  &__error {
    margin: 0;
    color: var(--cinq-red);
    font-weight: 700;
  }
}
</style>

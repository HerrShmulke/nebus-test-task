import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { Note } from '../types/note'
import { useNotePersistence } from '../composables/useNotePersistence'

interface UseNoteDraftOptions {
  noteId: string
  baseNote: Note
  draft: Ref<Note>
  isDirty: ComputedRef<boolean>
  reset: (note: Note) => void
}

export function useNoteDraft(options: UseNoteDraftOptions) {
  const persistence = useNotePersistence()

  const restorePrompt = ref(false)
  const restoredDraft = ref<Note | null>(null)

  let saveTimer: ReturnType<typeof setTimeout> | undefined

  onMounted(() => {
    const savedDraft = persistence.readDraft(options.noteId)

    if (
      savedDraft
      && savedDraft.savedAt
      && savedDraft.note.updatedAt === options.baseNote.updatedAt
      && JSON.stringify(savedDraft.note) !== JSON.stringify(options.baseNote)
    ) {
      restoredDraft.value = savedDraft.note
      restorePrompt.value = true
    }
  })

  watch(
    options.draft,
    draftValue => {
      if (saveTimer) clearTimeout(saveTimer)

      saveTimer = setTimeout(() => {
        if (!options.isDirty.value) return

        persistence.saveDraft(
          draftValue,
          options.baseNote.updatedAt,
        )
      }, 500)
    },
    { deep: true },
  )

  onBeforeUnmount(() => {
    if (saveTimer) clearTimeout(saveTimer)

    if (options.isDirty.value) {
      persistence.saveDraft(
        options.draft.value,
        options.baseNote.updatedAt,
      )
    }
  })

  function restoreDraft() {
    if (restoredDraft.value) {
      options.reset(restoredDraft.value)
    }

    restorePrompt.value = false
  }

  function discardDraft() {
    persistence.removeDraft(options.noteId)
    restorePrompt.value = false
  }

  return {
    restorePrompt,
    restoreDraft,
    discardDraft,
  }
}
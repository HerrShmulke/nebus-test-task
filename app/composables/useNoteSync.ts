import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useNotesStore } from '../stores/notes'

const STORAGE_KEY = 'notes-app:data'

export function useNoteSync(noteId: string) {
  const store = useNotesStore()

  const deletedExternally = ref(false)

  onMounted(() => {
    window.addEventListener('storage', onStorage)
  })

  onBeforeUnmount(() => {
    if (import.meta.client) {
      window.removeEventListener('storage', onStorage)
    }
  })

  watch(
    () => store.getById(noteId),
    note => {
      if (!note) {
        deletedExternally.value = true
      }
    },
  )

  function onStorage(event: StorageEvent) {
    if (event.key !== STORAGE_KEY) return

    store.syncFromStorage(event.newValue)
  }

  return {
    deletedExternally,
  }
}
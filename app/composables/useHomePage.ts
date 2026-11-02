import { useNotesStore } from '../stores/notes'
import { useConfirm } from '../composables/useConfirm'
import { storeToRefs } from 'pinia'

const STORAGE_KEY = 'notes-app:data'

export function useHomePage() {
  const store = useNotesStore()
  const { notes } = storeToRefs(store)

  const { confirm, dialog, accept, dismiss } = useConfirm()

  onMounted(() => {
    store.init()

    if (!import.meta.client) return

    window.addEventListener('storage', onStorage)
  })

  onBeforeUnmount(() => {
    if (!import.meta.client) return

    window.removeEventListener('storage', onStorage)
  })

  function onStorage(event: StorageEvent) {
    if (event.key !== STORAGE_KEY) return

    store.syncFromStorage(event.newValue)
  }

  async function createNote() {
    const note = store.addNote()

    await navigateTo(`/notes/${note.id}`)
  }

  async function removeNote(id: string) {
    const approved = await confirm({
      title: 'Удалить заметку?',
      message: 'Заметка и её задачи будут удалены. Это действие нельзя отменить.',
      confirmText: 'Удалить',
      danger: true,
    })

    if (!approved) return

    store.deleteNote(id)
  }

  return {
    notes,
    dialog,
    accept,
    dismiss,
    createNote,
    removeNote
  }
}
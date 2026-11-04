import type { Ref } from 'vue'
import type { Note } from '../types/note'
import { useNotesStore } from '../stores/notes'
import { useNotePersistence } from '../composables/useNotePersistence'
import { useConfirm } from '../composables/useConfirm'

interface NoteEditorState {
  isDirty: Readonly<Ref<boolean>>
  buildUpdatedNote: () => Note
}

export function useNoteActions(noteId: Note['id'], editor: NoteEditorState) {
  const store = useNotesStore()
  const persistence = useNotePersistence()
  const { confirm } = useConfirm()

  async function save() {
    const updated = editor.buildUpdatedNote()

    if (!store.updateNote(updated)) {
      return false
    }

    persistence.removeDraft(noteId)

    await navigateTo('/')

    return true
  }

  async function cancelEditing() {
    if (editor.isDirty.value) {
      const approved = await confirm({
        title: 'Отменить редактирование?',
        message: 'Все несохранённые изменения этой заметки будут потеряны.',
        confirmText: 'Отменить изменения',
        danger: true,
      })

      if (!approved) return
    }

    persistence.removeDraft(noteId)

    await navigateTo('/')
  }

  async function deleteCurrent() {
    const approved = await confirm({
      title: 'Удалить заметку?',
      message: 'Заметка и все её задачи будут удалены без возможности восстановления.',
      confirmText: 'Удалить',
      danger: true,
    })

    if (!approved) return

    store.deleteNote(noteId)
    persistence.removeDraft(noteId)

    await navigateTo('/')
  }

  return {
    save,
    cancelEditing,
    deleteCurrent,
  }
}
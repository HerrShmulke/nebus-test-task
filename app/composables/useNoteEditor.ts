import { computed, toRaw } from 'vue'
import type { Note } from '../types/note'
import { useNotesStore } from '../stores/notes'
import { useNoteHistory } from '../composables/useNoteHistory'
import { useNotePersistence } from '../composables/useNotePersistence'
import { useConfirm } from '../composables/useConfirm'

export function useNoteEditor(note: Note) {
  const store = useNotesStore()
  const persistence = useNotePersistence()
  const { confirm } = useConfirm()

  const baseNote = structuredClone(toRaw(note))
  const history = useNoteHistory(baseNote)

  const isDirty = computed(
    () => JSON.stringify(history.draft.value) !== JSON.stringify(baseNote),
  )

  async function save() {
    history.commitPending()

    const title = history.draft.value.title.trim()

    const todos = history.draft.value.todos
      .map(todo => ({
        ...todo,
        text: todo.text.trim(),
      }))
      .filter(todo => todo.text.length > 0)

    const updated: Note = {
      ...history.draft.value,
      title: title || 'Без названия',
      todos,
    }

    if (!store.updateNote(updated)) {
      return false
    }

    persistence.removeDraft(note.id)

    await navigateTo('/')

    return true
  }

  async function cancelEditing() {
    if (isDirty.value) {
      const approved = await confirm({
        title: 'Отменить редактирование?',
        message: 'Все несохранённые изменения этой заметки будут потеряны.',
        confirmText: 'Отменить изменения',
        danger: true,
      })

      if (!approved) return
    }

    persistence.removeDraft(note.id)

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

    store.deleteNote(note.id)
    persistence.removeDraft(note.id)

    await navigateTo('/')
  }

  return {
    baseNote,
    history,
    isDirty,
    save,
    cancelEditing,
    deleteCurrent,
  }
}
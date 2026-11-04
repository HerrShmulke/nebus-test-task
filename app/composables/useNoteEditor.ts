import { computed, toRaw } from 'vue'
import type { Note } from '../types/note'
import { useNoteHistory } from '../composables/useNoteHistory'

export function useNoteEditor(note: Note) {
  const baseNote = structuredClone(toRaw(note))
  const history = useNoteHistory(baseNote)

  const isDirty = computed(
    () => JSON.stringify(history.draft.value) !== JSON.stringify(baseNote),
  )

  /**
   * Фиксирует отложенные изменения и возвращает
   * нормализованную версию заметки, готовую к сохранению.
   */
  function buildUpdatedNote(): Note {
    history.commitPending()

    const title = history.draft.value.title.trim()

    const todos = history.draft.value.todos
      .map(todo => ({
        ...todo,
        text: todo.text.trim(),
      }))
      .filter(todo => todo.text.length > 0)

    return {
      ...history.draft.value,
      title: title || 'Без названия',
      todos,
    }
  }

  return {
    baseNote,
    history,
    isDirty,
    buildUpdatedNote,
  }
}
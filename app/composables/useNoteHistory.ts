import { computed, onScopeDispose, ref } from 'vue'
import type { Note, TodoItem } from '../types/note'
import {
  applyOperation,
  createHistory,
  recordOperation,
  redo as redoHistory,
  undo as undoHistory,
  type HistoryState,
  type NoteOperation,
} from '../utils/note-history'

const INPUT_COMMIT_DELAY = 650

export function useNoteHistory(initialNote: Note) {
  const draft = ref<Note>(structuredClone(toRaw(initialNote)))
  const history = ref<HistoryState>(createHistory(50))
  const canUndo = computed(() => history.value.past.length > 0)
  const canRedo = computed(() => history.value.future.length > 0)

  let pending: { operation: NoteOperation; key: string } | null = null
  let timer: ReturnType<typeof setTimeout> | undefined

  function commitPending() {
    if (timer) clearTimeout(timer)
    timer = undefined
    if (!pending) return
    history.value = recordOperation(history.value, pending.operation, pending.key)
    pending = null
  }

  function commit(operation: NoteOperation) {
    commitPending()
    draft.value = applyOperation(draft.value, operation)
    history.value = recordOperation(history.value, operation)
  }

  function updateTitle(value: string) {
    if (value === draft.value.title && !pending) return
    const before = pending?.key === 'title' && pending.operation.type === 'title'
      ? pending.operation.before
      : draft.value.title
    draft.value = { ...draft.value, title: value }
    pending = { key: 'title', operation: { type: 'title', before, after: value } }
    scheduleCommit()
  }

  function updateTodoText(todoId: string, value: string) {
    const todo = draft.value.todos.find(item => item.id === todoId)
    if (!todo) return
    const key = `todo-text:${todoId}`
    const before = pending?.key === key && pending.operation.type === 'todo-text'
      ? pending.operation.before
      : todo.text
    draft.value = {
      ...draft.value,
      todos: draft.value.todos.map(item => item.id === todoId ? { ...item, text: value } : item),
    }
    pending = { key, operation: { type: 'todo-text', todoId, before, after: value } }
    scheduleCommit()
  }

  function scheduleCommit() {
    if (timer) clearTimeout(timer)
    timer = setTimeout(commitPending, INPUT_COMMIT_DELAY)
  }

  function blurText() {
    commitPending()
  }

  function toggleTodo(todoId: string) {
    const todo = draft.value.todos.find(item => item.id === todoId)
    if (!todo) return
    commit({ type: 'todo-completed', todoId, before: todo.completed, after: !todo.completed })
  }

  function addTodo(todo: TodoItem) {
    commit({ type: 'todo-add', todo: structuredClone(toRaw(todo)), index: draft.value.todos.length })
  }

  function removeTodo(todoId: string) {
    const index = draft.value.todos.findIndex(item => item.id === todoId)
    if (index === -1) return
    commit({ type: 'todo-remove', todo: structuredClone(toRaw(draft.value.todos[index]!)), index })
  }

  function undo() {
    commitPending()
    const result = undoHistory(history.value, draft.value)
    history.value = result.history
    draft.value = result.note
  }

  function redo() {
    commitPending()
    const result = redoHistory(history.value, draft.value)
    history.value = result.history
    draft.value = result.note
  }

  function reset(note: Note) {
    if (timer) clearTimeout(timer)
    timer = undefined
    pending = null
    draft.value = structuredClone(toRaw(note))
    history.value = createHistory(50)
  }

  onScopeDispose(() => {
    if (timer) clearTimeout(timer)
  })

  return {
    draft,
    canUndo,
    canRedo,
    updateTitle,
    updateTodoText,
    blurText,
    toggleTodo,
    addTodo,
    removeTodo,
    undo,
    redo,
    reset,
    commitPending,
  }
}

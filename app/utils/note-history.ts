import type { Note, TodoItem } from '../types/note'

export type NoteOperation =
  | { type: 'title'; before: string; after: string }
  | { type: 'todo-text'; todoId: string; before: string; after: string }
  | { type: 'todo-completed'; todoId: string; before: boolean; after: boolean }
  | { type: 'todo-add'; todo: TodoItem; index: number }
  | { type: 'todo-remove'; todo: TodoItem; index: number }

export interface HistoryState {
  past: NoteOperation[]
  future: NoteOperation[]
  limit: number
}

export function createHistory(limit = 50): HistoryState {
  return { past: [], future: [], limit }
}

export function recordOperation(
  history: HistoryState,
  operation: NoteOperation,
  coalesceKey?: string,
): HistoryState {
  const past = [...history.past]
  const previous = past.at(-1)

  if (coalesceKey && previous && getCoalesceKey(previous) === coalesceKey) {
    past[past.length - 1] = mergeOperation(previous, operation)
  } else {
    past.push(operation)
  }

  return {
    ...history,
    past: past.slice(-history.limit),
    future: [],
  }
}

function getCoalesceKey(operation: NoteOperation): string | undefined {
  if (operation.type === 'title') return 'title'
  if (operation.type === 'todo-text') return `todo-text:${operation.todoId}`
  return undefined
}

function mergeOperation(previous: NoteOperation, next: NoteOperation): NoteOperation {
  if (previous.type === 'title' && next.type === 'title') {
    return { type: 'title', before: previous.before, after: next.after }
  }

  if (previous.type === 'todo-text' && next.type === 'todo-text'
    && previous.todoId === next.todoId) {
    return {
      type: 'todo-text',
      todoId: previous.todoId,
      before: previous.before,
      after: next.after,
    }
  }

  return next
}

export function applyOperation(note: Note, operation: NoteOperation): Note {
  switch (operation.type) {
    case 'title':
      return { ...note, title: operation.after }
    case 'todo-text':
      return updateTodo(note, operation.todoId, todo => ({ ...todo, text: operation.after }))
    case 'todo-completed':
      return updateTodo(note, operation.todoId, todo => ({ ...todo, completed: operation.after }))
    case 'todo-add': {
      const todos = [...note.todos]
      todos.splice(Math.min(operation.index, todos.length), 0, { ...operation.todo })
      return { ...note, todos }
    }
    case 'todo-remove': {
      const todos = note.todos.filter(todo => todo.id !== operation.todo.id)
      return { ...note, todos }
    }
  }
}

export function invertOperation(operation: NoteOperation): NoteOperation {
  switch (operation.type) {
    case 'title':
      return { ...operation, before: operation.after, after: operation.before }
    case 'todo-text':
      return { ...operation, before: operation.after, after: operation.before }
    case 'todo-completed':
      return { ...operation, before: operation.after, after: operation.before }
    case 'todo-add':
      return { type: 'todo-remove', todo: operation.todo, index: operation.index }
    case 'todo-remove':
      return { type: 'todo-add', todo: operation.todo, index: operation.index }
  }
}

export function undo(history: HistoryState, note: Note): { history: HistoryState; note: Note } {
  const operation = history.past.at(-1)
  if (!operation) return { history, note }

  return {
    history: {
      ...history,
      past: history.past.slice(0, -1),
      future: [...history.future, operation],
    },
    note: applyOperation(note, invertOperation(operation)),
  }
}

export function redo(history: HistoryState, note: Note): { history: HistoryState; note: Note } {
  const operation = history.future.at(-1)
  if (!operation) return { history, note }

  return {
    history: {
      ...history,
      past: [...history.past, operation].slice(-history.limit),
      future: history.future.slice(0, -1),
    },
    note: applyOperation(note, operation),
  }
}

function updateTodo(note: Note, todoId: string, update: (todo: TodoItem) => TodoItem): Note {
  return {
    ...note,
    todos: note.todos.map(todo => todo.id === todoId ? update(todo) : todo),
  }
}

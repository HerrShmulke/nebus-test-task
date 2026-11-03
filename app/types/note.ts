export interface TodoItem {
  id: string
  text: string
  completed: boolean
}

export interface Note {
  id: string
  title: string
  todos: TodoItem[]
  createdAt: string
  updatedAt: string
}

export interface NotesStorage {
  version: number
  notes: Note[]
}

export interface NoteDraft {
  version: number
  noteId: string
  baseUpdatedAt: string
  savedAt: string
  note: Note
}

import { defineStore } from 'pinia'
import type { Note, NotesStorage } from '../types/note'
import { createId } from '../utils/id'
import { isNote } from '../utils/validation/note'
import { STORAGE_KEY } from '../constants/storage'

const STORAGE_VERSION = 1

function parseStorage(raw: string | null): Note[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return []
    const data = parsed as Partial<NotesStorage>
    if (data.version !== STORAGE_VERSION || !Array.isArray(data.notes)) return []
    return data.notes.filter(isNote)
  } catch {
    return []
  }
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const isInitialized = ref(false)

  function getById(id: string): Note | undefined {
    return notes.value.find((note) => note.id === id)
  }

  function init() {
    if (import.meta.server || isInitialized.value) return
    notes.value = parseStorage(localStorage.getItem(STORAGE_KEY))
    isInitialized.value = true
  }

  function persist() {
    if (import.meta.server) return
    const data: NotesStorage = { version: STORAGE_VERSION, notes: notes.value }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function addNote(title = ''): Note {
    const now = new Date().toISOString()
    const note: Note = {
      id: createId(),
      title,
      todos: [],
      createdAt: now,
      updatedAt: now,
    }

    notes.value.unshift(note)
    persist()
    return note
  }

  function updateNote(updatedNote: Note) {
    const index = notes.value.findIndex(note => note.id === updatedNote.id)
    if (index === -1) return false
    notes.value[index] = {
      ...updatedNote,
      updatedAt: new Date().toISOString(),
    }
    persist()
    return true
  }

  function deleteNote(id: string) {
    const next = notes.value.filter(note => note.id !== id)
    if (next.length === notes.value.length) return false
    notes.value = next
    persist()
    return true
  }

  function syncFromStorage(raw: string | null) {
    notes.value = parseStorage(raw)
    isInitialized.value = true
  }

  return {
    notes,
    isInitialized,
    getById,
    init,
    persist,
    addNote,
    deleteNote,
    updateNote,
    syncFromStorage
  }
})

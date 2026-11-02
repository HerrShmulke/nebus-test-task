
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { Note, NotesStorage } from '../types/note'
import { useNotesStore } from './notes'

vi.mock('~/utils/id', () => ({
  createId: () => 'generated-id',
}))

const STORAGE_KEY = 'notes-app:data'

function createNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    title: 'Test note',
    todos: [
      {
        id: 'todo-1',
        text: 'Test todo',
        completed: false,
      },
    ],
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    ...overrides,
  }
}

function createStorage(notes: Note[], version = 1): string {
  const data: NotesStorage = {
    version,
    notes,
  }

  return JSON.stringify(data)
}

describe('useNotesStore', () => {
  let store: ReturnType<typeof useNotesStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()

    store = useNotesStore()
  })

  describe('initial state', () => {
    it('should have empty notes', () => {
      expect(store.notes).toEqual([])
    })

    it('should not be initialized', () => {
      expect(store.isInitialized).toBe(false)
    })
  })

  describe('init', () => {
    it('should load notes from localStorage', () => {
      const notes = [
        createNote(),
        createNote({ id: 'note-2', title: 'Another note' }),
      ]

      localStorage.setItem(STORAGE_KEY, createStorage(notes))

      store.init()

      expect(store.notes).toEqual(notes)
      expect(store.isInitialized).toBe(true)
    })

    it('should initialize with empty notes if localStorage is empty', () => {
      store.init()

      expect(store.notes).toEqual([])
      expect(store.isInitialized).toBe(true)
    })

    it('should initialize with empty notes if storage contains invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, '{invalid json')

      store.init()

      expect(store.notes).toEqual([])
      expect(store.isInitialized).toBe(true)
    })

    it.each([
      ['null', 'null'],
      ['number', '123'],
      ['string', '"invalid"'],
      ['array', '[]'],
      ['object without version', '{"notes":[]}'],
      ['unsupported version', '{"version":2,"notes":[]}'],
      ['missing notes', '{"version":1}'],
      ['notes is not an array', '{"version":1,"notes":{}}'],
    ])('should ignore invalid storage: %s', (_, raw) => {
      localStorage.setItem(STORAGE_KEY, raw)

      store.init()

      expect(store.notes).toEqual([])
      expect(store.isInitialized).toBe(true)
    })

    it('should filter invalid notes from storage', () => {
      const validNote = createNote()

      const invalidNotes = [
        null,
        {},
        { id: 'invalid-1' },
        { ...validNote, title: 123 },
        { ...validNote, todos: 'invalid' },
        {
          ...validNote,
          todos: [{ id: 'todo-1', text: 'Test', completed: 'yes' }],
        },
        { ...validNote, createdAt: null },
        { ...validNote, updatedAt: 123 },
      ]

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          notes: [...invalidNotes, validNote],
        }),
      )

      store.init()

      expect(store.notes).toEqual([validNote])
    })

    it('should initialize only once', () => {
      const firstNote = createNote()

      localStorage.setItem(STORAGE_KEY, createStorage([firstNote]))

      store.init()

      const secondNote = createNote({
        id: 'note-2',
        title: 'Second note',
      })

      localStorage.setItem(STORAGE_KEY, createStorage([secondNote]))

      store.init()

      expect(store.notes).toEqual([firstNote])
    })
  })

  describe('getById', () => {
    it('should return note by ID', () => {
      const note = createNote()

      store.notes.push(note)

      expect(store.getById(note.id)).toEqual(note)
    })

    it('should return undefined if note does not exist', () => {
      expect(store.getById('unknown-id')).toBeUndefined()
    })
  })

  describe('addNote', () => {
    it('should create a note with default title', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-11-03T10:00:00.000Z'))

      const note = store.addNote()

      expect(note).toEqual({
        id: 'generated-id',
        title: '',
        todos: [],
        createdAt: '2026-11-03T10:00:00.000Z',
        updatedAt: '2026-11-03T10:00:00.000Z',
      })

      vi.useRealTimers()
    })

    it('should create a note with provided title', () => {
      const note = store.addNote('My note')

      expect(note.title).toBe('My note')
    })

    it('should add note to the beginning of the list', () => {
      const existingNote = createNote()

      store.notes.push(existingNote)

      const newNote = store.addNote('New note')

      expect(store.notes).toEqual([newNote, existingNote])
    })

    it('should persist changes to localStorage', () => {
      store.addNote('New note')

      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY)!,
      )

      expect(saved.version).toBe(1)
      expect(saved.notes).toEqual(store.notes)
    })
  })

  describe('updateNote', () => {
    it('should update existing note', () => {
      const note = createNote()

      store.notes.push(note)

      const updatedNote = {
        ...note,
        title: 'Updated title',
      }

      expect(store.updateNote(updatedNote)).toBe(true)
      expect(store.getById(note.id)?.title).toBe('Updated title')
    })

    it('should update updatedAt timestamp', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-11-03T12:00:00.000Z'))

      const note = createNote()

      store.notes.push(note)
      store.updateNote({ ...note, title: 'Updated' })

      expect(store.getById(note.id)?.updatedAt)
        .toBe('2026-11-03T12:00:00.000Z')

      vi.useRealTimers()
    })

    it('should return false if note does not exist', () => {
      const note = createNote()

      expect(store.updateNote(note)).toBe(false)
      expect(store.notes).toEqual([])
    })

    it('should persist changes to localStorage', () => {
      const note = createNote()

      store.notes.push(note)

      store.updateNote({
        ...note,
        title: 'Updated title',
      })

      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY)!,
      )

      expect(saved.notes[0].title).toBe('Updated title')
    })
  })

  describe('deleteNote', () => {
    it('should delete existing note', () => {
      const note = createNote()

      store.notes.push(note)

      expect(store.deleteNote(note.id)).toBe(true)
      expect(store.notes).toEqual([])
    })

    it('should return false if note does not exist', () => {
      expect(store.deleteNote('unknown-id')).toBe(false)
    })

    it('should not modify notes if ID does not exist', () => {
      const note = createNote()

      store.notes.push(note)

      store.deleteNote('unknown-id')

      expect(store.notes).toEqual([note])
    })

    it('should persist changes to localStorage', () => {
      const note = createNote()

      store.notes.push(note)
      store.deleteNote(note.id)

      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY)!,
      )

      expect(saved.notes).toEqual([])
    })
  })

  describe('syncFromStorage', () => {
    it('should update notes from storage', () => {
      const notes = [
        createNote(),
        createNote({ id: 'note-2' }),
      ]

      store.syncFromStorage(createStorage(notes))

      expect(store.notes).toEqual(notes)
    })

    it('should set isInitialized to true', () => {
      store.syncFromStorage(null)

      expect(store.isInitialized).toBe(true)
    })

    it('should clear notes if storage is empty', () => {
      store.notes.push(createNote())

      store.syncFromStorage(null)

      expect(store.notes).toEqual([])
    })

    it('should handle invalid storage data', () => {
      store.notes.push(createNote())

      store.syncFromStorage('{invalid json')

      expect(store.notes).toEqual([])
    })

    it('should filter invalid notes during synchronization', () => {
      const validNote = createNote()

      store.syncFromStorage(
        JSON.stringify({
          version: 1,
          notes: [
            validNote,
            { id: 'invalid', title: 123 },
          ],
        }),
      )

      expect(store.notes).toEqual([validNote])
    })
  })

  describe('persist', () => {
    it('should save current notes to localStorage', () => {
      const notes = [
        createNote(),
        createNote({ id: 'note-2' }),
      ]

      store.notes = notes

      store.persist()

      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY)!,
      )

      expect(saved).toEqual({
        version: 1,
        notes,
      })
    })
  })
})

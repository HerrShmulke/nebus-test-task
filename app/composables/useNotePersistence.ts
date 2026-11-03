import type { Note, NoteDraft } from '../types/note'

const DRAFT_PREFIX = 'notes-app:draft:'

export function useNotePersistence() {
  function saveDraft(note: Note, baseUpdatedAt: string) {
    if (import.meta.server) return
    const draft: NoteDraft = {
      version: 1,
      noteId: note.id,
      baseUpdatedAt,
      savedAt: new Date().toISOString(),
      note,
    }
    localStorage.setItem(`${DRAFT_PREFIX}${note.id}`, JSON.stringify(draft))
  }

  function readDraft(noteId: string): NoteDraft | null {
    if (import.meta.server) return null
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${noteId}`)
    if (!raw) return null

    try {
      const parsed: unknown = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return null
      const draft = parsed as Partial<NoteDraft>
      if (draft.version !== 1 || draft.noteId !== noteId || !draft.note
        || draft.note.id !== noteId || !Array.isArray(draft.note.todos)) return null
      return draft as NoteDraft
    } catch {
      return null
    }
  }

  function removeDraft(noteId: string) {
    if (import.meta.server) return
    localStorage.removeItem(`${DRAFT_PREFIX}${noteId}`)
  }

  return { saveDraft, readDraft, removeDraft }
}

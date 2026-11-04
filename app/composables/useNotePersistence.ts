import { isNoteDraft } from '~/utils/validation/note-draft'
import type { Note, NoteDraft } from '../types/note'

const DRAFT_KEY_PREFIX = 'notes-app:draft:'
const DRAFT_VERSION = 1

function getDraftKey(noteId: string): string {
  return `${DRAFT_KEY_PREFIX}${noteId}`
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function useNotePersistence() {
  function saveDraft(note: Note, baseUpdatedAt: string) {
    if (import.meta.server) return

    const draft: NoteDraft = {
      version: DRAFT_VERSION,
      noteId: note.id,
      baseUpdatedAt,
      savedAt: new Date().toISOString(),
      note,
    }

    localStorage.setItem(getDraftKey(note.id), JSON.stringify(draft))
  }

  function readDraft(noteId: string): NoteDraft | null {
    if (import.meta.server) return null

    const raw = localStorage.getItem(getDraftKey(noteId))
    if (!raw) return null

    const parsed = parseJson(raw)
    return isNoteDraft(parsed) ? parsed : null
  }

  function removeDraft(noteId: string) {
    if (import.meta.server) return

    localStorage.removeItem(getDraftKey(noteId))
  }

  return { saveDraft, readDraft, removeDraft }
}
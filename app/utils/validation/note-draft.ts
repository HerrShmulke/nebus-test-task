import z from "zod";
import { NOTE_SCHEMA } from "./note";
import type { NoteDraft } from '../../types/note'

export const NOTE_DRAFT_SCHEMA = z.object({
  version: z.number(),
  noteId: z.string(),
  baseUpdatedAt: z.string(),
  savedAt: z.string(),
  note: NOTE_SCHEMA
})

export function isNoteDraft(value: unknown): value is NoteDraft {
  return NOTE_DRAFT_SCHEMA.safeParse(value).success
}
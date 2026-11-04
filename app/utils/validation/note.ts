import z from "zod"

export const NOTE_SCHEMA = z.object({
  id: z.string(),
  title: z.string(),
  todos: z.array(z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean(),
  })),
  createdAt: z.string(),
  updatedAt: z.string()
}) 

export function isNote(value: unknown): value is Note {
  return NOTE_SCHEMA.safeParse(value).success
}
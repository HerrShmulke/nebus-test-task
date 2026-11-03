
import { describe, expect, it } from 'vitest'
import type { Note, TodoItem } from '../types/note'
import {
  applyOperation,
  createHistory,
  invertOperation,
  recordOperation,
  undo,
  redo,
  type NoteOperation,
} from './note-history'

function createTodo(overrides: Partial<TodoItem> = {}): TodoItem {
  return {
    id: 'todo-1',
    text: 'Initial todo',
    completed: false,
    ...overrides,
  }
}

function createNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    title: 'Initial title',
    todos: [createTodo()],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('createHistory', () => {
  it('creates an empty history with default limit', () => {
    expect(createHistory()).toEqual({
      past: [],
      future: [],
      limit: 50,
    })
  })

  it('creates a history with custom limit', () => {
    expect(createHistory(10)).toEqual({
      past: [],
      future: [],
      limit: 10,
    })
  })
})

describe('recordOperation', () => {
  it('adds an operation to past', () => {
    const history = createHistory()
    const operation: NoteOperation = {
      type: 'title',
      before: 'Initial',
      after: 'Updated',
    }

    const result = recordOperation(history, operation)

    expect(result.past).toEqual([operation])
    expect(result.future).toEqual([])
  })

  it('preserves the original history', () => {
    const history = createHistory()
    const operation: NoteOperation = {
      type: 'title',
      before: 'Initial',
      after: 'Updated',
    }

    recordOperation(history, operation)

    expect(history.past).toEqual([])
    expect(history.future).toEqual([])
  })

  it('clears future when a new operation is recorded', () => {
    const history = {
      ...createHistory(),
      future: [
        {
          type: 'title',
          before: 'Second',
          after: 'Third',
        } as NoteOperation,
      ],
    }

    const operation: NoteOperation = {
      type: 'title',
      before: 'First',
      after: 'Second',
    }

    const result = recordOperation(history, operation)

    expect(result.future).toEqual([])
  })

  it('limits the number of stored operations', () => {
    const history = createHistory(2)

    const first: NoteOperation = {
      type: 'title',
      before: 'A',
      after: 'B',
    }

    const second: NoteOperation = {
      type: 'title',
      before: 'B',
      after: 'C',
    }

    const third: NoteOperation = {
      type: 'title',
      before: 'C',
      after: 'D',
    }

    const result = recordOperation(
      recordOperation(
        recordOperation(history, first),
        second,
      ),
      third,
    )

    expect(result.past).toEqual([second, third])
  })

  it('coalesces consecutive title operations', () => {
    const history = createHistory()

    const first: NoteOperation = {
      type: 'title',
      before: 'Initial',
      after: 'First',
    }

    const second: NoteOperation = {
      type: 'title',
      before: 'First',
      after: 'Second',
    }

    const result = recordOperation(
      recordOperation(history, first),
      second,
      'title',
    )

    expect(result.past).toEqual([
      {
        type: 'title',
        before: 'Initial',
        after: 'Second',
      },
    ])
  })

  it('coalesces consecutive changes to the same todo text', () => {
    const history = createHistory()

    const first: NoteOperation = {
      type: 'todo-text',
      todoId: 'todo-1',
      before: 'Initial',
      after: 'First',
    }

    const second: NoteOperation = {
      type: 'todo-text',
      todoId: 'todo-1',
      before: 'First',
      after: 'Second',
    }

    const result = recordOperation(
      recordOperation(history, first),
      second,
      'todo-text:todo-1',
    )

    expect(result.past).toEqual([
      {
        type: 'todo-text',
        todoId: 'todo-1',
        before: 'Initial',
        after: 'Second',
      },
    ])
  })

  it('does not coalesce operations for different todos', () => {
    const history = createHistory()

    const first: NoteOperation = {
      type: 'todo-text',
      todoId: 'todo-1',
      before: 'First',
      after: 'First updated',
    }

    const second: NoteOperation = {
      type: 'todo-text',
      todoId: 'todo-2',
      before: 'Second',
      after: 'Second updated',
    }

    const result = recordOperation(
      recordOperation(history, first),
      second,
      'todo-text:todo-2',
    )

    expect(result.past).toEqual([first, second])
  })

  it('does not coalesce when the key is not provided', () => {
    const history = createHistory()

    const first: NoteOperation = {
      type: 'title',
      before: 'Initial',
      after: 'First',
    }

    const second: NoteOperation = {
      type: 'title',
      before: 'First',
      after: 'Second',
    }

    const result = recordOperation(
      recordOperation(history, first),
      second,
    )

    expect(result.past).toEqual([first, second])
  })

  it('does not coalesce when the previous operation has another type', () => {
    const history = createHistory()

    const first: NoteOperation = {
      type: 'todo-completed',
      todoId: 'todo-1',
      before: false,
      after: true,
    }

    const second: NoteOperation = {
      type: 'todo-text',
      todoId: 'todo-1',
      before: 'Initial',
      after: 'Updated',
    }

    const result = recordOperation(
      recordOperation(history, first),
      second,
      'todo-text:todo-1',
    )

    expect(result.past).toEqual([first, second])
  })
})

describe('applyOperation', () => {
  it('updates note title', () => {
    const note = createNote()

    const result = applyOperation(note, {
      type: 'title',
      before: 'Initial title',
      after: 'Updated title',
    })

    expect(result.title).toBe('Updated title')
  })

  it('updates todo text', () => {
    const note = createNote()

    const result = applyOperation(note, {
      type: 'todo-text',
      todoId: 'todo-1',
      before: 'Initial todo',
      after: 'Updated todo',
    })

    expect(result.todos[0]!.text).toBe('Updated todo')
  })

  it('updates todo completion status', () => {
    const note = createNote()

    const result = applyOperation(note, {
      type: 'todo-completed',
      todoId: 'todo-1',
      before: false,
      after: true,
    })

    expect(result.todos[0]!.completed).toBe(true)
  })

  it('adds todo at the specified index', () => {
    const note = createNote({
      todos: [
        createTodo({ id: 'todo-1', text: 'First' }),
        createTodo({ id: 'todo-2', text: 'Second' }),
      ],
    })

    const newTodo = createTodo({
      id: 'todo-3',
      text: 'New todo',
    })

    const result = applyOperation(note, {
      type: 'todo-add',
      todo: newTodo,
      index: 1,
    })

    expect(result.todos.map(todo => todo.id)).toEqual([
      'todo-1',
      'todo-3',
      'todo-2',
    ])
  })

  it('adds todo at the end when index exceeds array length', () => {
    const note = createNote()

    const result = applyOperation(note, {
      type: 'todo-add',
      todo: createTodo({ id: 'todo-2' }),
      index: 100,
    })

    expect(result.todos.map(todo => todo.id)).toEqual([
      'todo-1',
      'todo-2',
    ])
  })

  it('removes todo by id', () => {
    const note = createNote({
      todos: [
        createTodo({ id: 'todo-1' }),
        createTodo({ id: 'todo-2' }),
      ],
    })

    const result = applyOperation(note, {
      type: 'todo-remove',
      todo: createTodo({ id: 'todo-1' }),
      index: 0,
    })

    expect(result.todos.map(todo => todo.id)).toEqual(['todo-2'])
  })

  it('does not modify the original note', () => {
    const note = createNote()

    const result = applyOperation(note, {
      type: 'todo-text',
      todoId: 'todo-1',
      before: 'Initial todo',
      after: 'Updated todo',
    })

    expect(note.todos[0]!.text).toBe('Initial todo')
    expect(result).not.toBe(note)
    expect(result.todos).not.toBe(note.todos)
  })

  it('does not modify other todos when updating one todo', () => {
    const secondTodo = createTodo({
      id: 'todo-2',
      text: 'Second todo',
    })

    const note = createNote({
      todos: [
        createTodo(),
        secondTodo,
      ],
    })

    const result = applyOperation(note, {
      type: 'todo-text',
      todoId: 'todo-1',
      before: 'Initial todo',
      after: 'Updated todo',
    })

    expect(result.todos[1]).toBe(secondTodo)
  })

  it('returns a new note when todo does not exist', () => {
    const note = createNote()

    const result = applyOperation(note, {
      type: 'todo-text',
      todoId: 'unknown-id',
      before: 'Initial',
      after: 'Updated',
    })

    expect(result).not.toBe(note)
    expect(result.todos).toEqual(note.todos)
  })
})

describe('invertOperation', () => {
  it('inverts title operation', () => {
    const operation: NoteOperation = {
      type: 'title',
      before: 'Initial',
      after: 'Updated',
    }

    expect(invertOperation(operation)).toEqual({
      type: 'title',
      before: 'Updated',
      after: 'Initial',
    })
  })

  it('inverts todo text operation', () => {
    const operation: NoteOperation = {
      type: 'todo-text',
      todoId: 'todo-1',
      before: 'Initial',
      after: 'Updated',
    }

    expect(invertOperation(operation)).toEqual({
      type: 'todo-text',
      todoId: 'todo-1',
      before: 'Updated',
      after: 'Initial',
    })
  })

  it('inverts todo completion operation', () => {
    const operation: NoteOperation = {
      type: 'todo-completed',
      todoId: 'todo-1',
      before: false,
      after: true,
    }

    expect(invertOperation(operation)).toEqual({
      type: 'todo-completed',
      todoId: 'todo-1',
      before: true,
      after: false,
    })
  })

  it('converts todo-add into todo-remove', () => {
    const todo = createTodo()

    expect(invertOperation({
      type: 'todo-add',
      todo,
      index: 2,
    })).toEqual({
      type: 'todo-remove',
      todo,
      index: 2,
    })
  })

  it('converts todo-remove into todo-add', () => {
    const todo = createTodo()

    expect(invertOperation({
      type: 'todo-remove',
      todo,
      index: 2,
    })).toEqual({
      type: 'todo-add',
      todo,
      index: 2,
    })
  })
})

describe('undo', () => {
  it('reverts the last operation', () => {
    const note = createNote()
    const operation: NoteOperation = {
      type: 'title',
      before: 'Initial title',
      after: 'Updated title',
    }

    const history = recordOperation(createHistory(), operation)
    const updatedNote = applyOperation(note, operation)

    const result = undo(history, updatedNote)

    expect(result.note.title).toBe('Initial title')
    expect(result.history.past).toEqual([])
    expect(result.history.future).toEqual([operation])
  })

  it('does nothing when past is empty', () => {
    const history = createHistory()
    const note = createNote()

    const result = undo(history, note)

    expect(result.history).toBe(history)
    expect(result.note).toBe(note)
  })

  it('preserves the original history and note', () => {
    const note = createNote()
    const operation: NoteOperation = {
      type: 'title',
      before: 'Initial title',
      after: 'Updated title',
    }

    const history = recordOperation(createHistory(), operation)
    const updatedNote = applyOperation(note, operation)

    undo(history, updatedNote)

    expect(history.past).toEqual([operation])
    expect(history.future).toEqual([])
    expect(updatedNote.title).toBe('Updated title')
  })

  it('restores removed todo at its original position', () => {
    const note = createNote({
      todos: [
        createTodo({ id: 'todo-1' }),
        createTodo({ id: 'todo-2' }),
        createTodo({ id: 'todo-3' }),
      ],
    })

    const operation: NoteOperation = {
      type: 'todo-remove',
      todo: note.todos[1]!,
      index: 1,
    }

    const history = recordOperation(createHistory(), operation)
    const updatedNote = applyOperation(note, operation)

    const result = undo(history, updatedNote)

    expect(result.note.todos.map(todo => todo.id)).toEqual([
      'todo-1',
      'todo-2',
      'todo-3',
    ])
  })
})

describe('redo', () => {
  it('reapplies the last undone operation', () => {
    const note = createNote()
    const operation: NoteOperation = {
      type: 'title',
      before: 'Initial title',
      after: 'Updated title',
    }

    const history = recordOperation(createHistory(), operation)
    const updatedNote = applyOperation(note, operation)
    const undone = undo(history, updatedNote)

    const result = redo(undone.history, undone.note)

    expect(result.note.title).toBe('Updated title')
    expect(result.history.past).toEqual([operation])
    expect(result.history.future).toEqual([])
  })

  it('does nothing when future is empty', () => {
    const history = createHistory()
    const note = createNote()

    const result = redo(history, note)

    expect(result.history).toBe(history)
    expect(result.note).toBe(note)
  })

  it('respects history limit when redoing', () => {
    const history = createHistory(2)

    const operations: NoteOperation[] = [
      { type: 'title', before: 'A', after: 'B' },
      { type: 'title', before: 'B', after: 'C' },
      { type: 'title', before: 'C', after: 'D' },
    ]

    const past = operations.slice(0, 2)
    const future = [operations[2]!]

    const result = redo(
      { ...history, past, future },
      createNote({ title: 'C' }),
    )

    expect(result.history.past).toEqual([
      operations[1],
      operations[2],
    ])
    expect(result.history.future).toEqual([])
  })

  it('preserves the original history and note', () => {
    const note = createNote()
    const operation: NoteOperation = {
      type: 'title',
      before: 'Initial title',
      after: 'Updated title',
    }

    const history = recordOperation(createHistory(), operation)
    const undone = undo(history, applyOperation(note, operation))

    redo(undone.history, undone.note)

    expect(undone.history.past).toEqual([])
    expect(undone.history.future).toEqual([operation])
    expect(undone.note.title).toBe('Initial title')
  })
})

describe('undo and redo integration', () => {
  it('restores the original note after undoing and redoing all operations', () => {
    const initialNote = createNote()
    let note = initialNote
    let history = createHistory()

    const operations: NoteOperation[] = [
      {
        type: 'title',
        before: 'Initial title',
        after: 'Updated title',
      },
      {
        type: 'todo-text',
        todoId: 'todo-1',
        before: 'Initial todo',
        after: 'Updated todo',
      },
      {
        type: 'todo-completed',
        todoId: 'todo-1',
        before: false,
        after: true,
      },
      {
        type: 'todo-add',
        todo: createTodo({ id: 'todo-2' }),
        index: 1,
      },
    ]

    for (const operation of operations) {
      note = applyOperation(note, operation)
      history = recordOperation(history, operation)
    }

    for (let i = 0; i < operations.length; i++) {
      const result = undo(history, note)
      history = result.history
      note = result.note
    }

    expect(note).toEqual(initialNote)
    expect(history.past).toEqual([])
    expect(history.future).toHaveLength(operations.length)

    for (let i = 0; i < operations.length; i++) {
      const result = redo(history, note)
      history = result.history
      note = result.note
    }

    expect(note.title).toBe('Updated title')
    expect(note.todos).toHaveLength(2)
    expect(note.todos[0]!.text).toBe('Updated todo')
    expect(note.todos[0]!.completed).toBe(true)
    expect(history.future).toEqual([])
    expect(history.past).toHaveLength(operations.length)
  })
})

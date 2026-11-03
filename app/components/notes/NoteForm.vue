<script setup lang="ts">
import { createId } from '../../utils/id';
import type { Note, TodoItem } from '../../types/note';

defineProps<{
  note: Note
  canUndo: boolean
  canRedo: boolean
}>()

const emit = defineEmits<{
  title: [value: string]
  todoText: [id: string, value: string]
  todoBlur: []
  toggleTodo: [id: string]
  addTodo: [todo: TodoItem]
  removeTodo: [id: string]
  undo: []
  redo: []
}>()

function onTodoUpdate(id: string, value: string) {
  emit('todoText', id, value)
}

async function addTodo() {
  emit('addTodo', { id: createId(), text: '', completed: false })
  await nextTick()
  todoList.value?.focusLast()
}

const noteTitle = useTemplateRef('noteTitle')

onMounted(() => {
  noteTitle.value?.focus()
})

const todoList = useTemplateRef('todoList')
</script>

<template>
  <div class="note-form">
    <label class="field-label" for="note-title">Название заметки</label>
    <input
      id="note-title"
      ref="noteTitle"
      class="title-input"
      :value="note.title"
      maxlength="120"
      placeholder="Например, планы на неделю"
      @input="emit('title', ($event.target as HTMLInputElement).value)"
      @blur="emit('todoBlur')"
    >

    <div class="todo-section">
      <div class="todo-section__heading">
        <div>
          <h2>Список задач</h2>
          <p>Отмечайте выполненные пункты и редактируйте их текст.</p>
        </div>
        <div class="history-actions">
          <VButton size="small" variant="secondary" :disabled="!canUndo" aria-label="Отменить действие" @click="emit('undo')">
            <IconUndo />
          </VButton>
          <VButton size="small" variant="secondary" :disabled="!canRedo" aria-label="Повторить действие" @click="emit('redo')">
            <IconRedo />
          </VButton>
        </div>
      </div>

      <TodoList
        ref="todoList"
        :todos="note.todos"
        editable
        @toggle="emit('toggleTodo', $event)"
        @update="onTodoUpdate"
        @remove="emit('removeTodo', $event)"
        @blur="emit('todoBlur')"
      />
      <VButton variant="secondary" @click="addTodo"><IconPlus /> Добавить задачу</VButton>
    </div>
  </div>
</template>

<style lang="scss">
.title-input {
  width: 100%; 
  border: 1px solid $color-border; 
  border-radius: 10px; 
  padding: 14px 15px;
  color: $color-text;
  background: $color-surface-muted; 
  font-size: 17px; 
  font-weight: 650;
}

.field-label { 
  display: block; 
  margin-bottom: 10px; 
  color: $color-text-muted;
  font-size: 12px; 
  font-weight: 700; 
}

.history-actions { 
  display: flex; 
  gap: 8px; 
}

.todo-section { 
  margin-top: 34px; 

  &__heading {
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    gap: 20px; 
    margin-bottom: 22px;
  }
}

.todo-section__heading h2 { 
  margin: 0; 
  font-size: 17px; 
}

.todo-section__heading p { 
  margin: 6px 0 0; 
  color: $color-text-muted; 
  font-size: 12px; 
}

.todo-section > .v-button { 
  margin-top: 20px;
}
</style>
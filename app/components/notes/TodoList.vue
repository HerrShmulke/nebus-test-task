<script setup lang="ts">
import type { TodoItem as Todo } from '../../types/note'
import TodoItem from './TodoItem.vue';

const props = withDefaults(defineProps<{
  todos: Todo[]
  editable?: boolean
  previewLimit?: number
}>(), {
  editable: false,
  previewLimit: 3,
})

const emit = defineEmits<{
  toggle: [id: string]
  update: [id: string, value: string]
  remove: [id: string]
  blur: []
}>()

const internalTodo = computed(() => props.editable ? props.todos : props.todos.slice(0, props.previewLimit))

const todoItems = useTemplateRef('todoItems')

defineExpose({
  focusLast() {
    todoItems.value?.at(-1)?.focus()
  }
})
</script>

<template>
  <div class="todo-list">
    <TodoItem
      v-for="todo in internalTodo"
      ref="todoItems"
      :id="todo.id"
      :key="todo.id"
      :text="todo.text"
      :completed="todo.completed"
      :editable="editable"
      @toggle="emit('toggle', todo.id)"
      @update="emit('update', todo.id, $event)"
      @remove="emit('remove', todo.id)"
      @blur="emit('blur')"
    />
    <p v-if="!todos.length" class="todo-list__empty">Задач пока нет</p>
    <p v-else-if="!editable && todos.length > previewLimit" class="todo-list__more">
      И ещё {{ todos.length - previewLimit }}
    </p>
  </div>
</template>

<style lang="scss">
.todo-list { 
  display: flex; 
  flex-direction: column; 
  gap: 12px;

  &__empty, &__more {
    margin: 0; 
    color: $color-text-muted; 
    font-size: 12px;
  }
}
</style>
<script setup lang="ts">
import VCheckbox from '../../components/ui/VCheckbox.vue'
import VButton from '../../components/ui/VButton.vue'
import IconDelete from '../ui/icons/IconDelete.vue';

defineProps<{
  id: string
  text: string
  completed: boolean
  editable?: boolean
}>()

const emit = defineEmits<{
  toggle: [value: boolean]
  update: [value: string]
  remove: []
  blur: []
}>()

const todoInput = useTemplateRef('todoInput')

defineExpose({
  focus() {
    todoInput.value?.focus()
  }
})
</script>

<template>
  <div class="todo-row" :class="{ 'todo-row--completed': completed }">
    <VCheckbox
      :id="`todo-${id}`"
      :model-value="completed"
      :readonly="!editable"
      :label="text || 'Пустой пункт'"
      @update:model-value="emit('toggle', $event)"
    />
    <template v-if="editable">
      <input
        class="todo-row__input"
        ref="todoInput"
        :value="text"
        aria-label="Текст задачи"
        placeholder="Введите задачу"
        @input="emit('update', ($event.target as HTMLInputElement).value)"
        @blur="emit('blur')"
      >
      <VButton variant="ghost" size="small" aria-label="Удалить задачу" @click="emit('remove')"><IconDelete size="16" /></VButton>
    </template>
    <span v-else class="todo-row__text">{{ text }}</span>
  </div>
</template>

<style lang="scss">
.todo-row { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  min-width: 0;

  &--completed .checkbox__label {
    color: #a0aaba; 
    text-decoration: line-through;
  }

  &__text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__input {
    flex: 1; 
    min-width: 0; 
    border: 1px solid transparent; 
    border-radius: 7px; 
    padding: 7px 9px;
    color: $color-text; 
    background: transparent; 
    font-size: 13px;

    &:focus {
      border-color: $color-border; 
      background: white;
    }
  }
}

.todo-row > .checkbox { 
  flex: 0 0 auto; 
}

.todo-row > .checkbox .checkbox__label { 
  display: none; 
}
</style>
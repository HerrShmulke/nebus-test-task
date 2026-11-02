<script setup lang="ts">
import type { Note } from '../../types/note.ts';
import TodoList from './TodoList.vue'
import VButton from '../../components/ui/VButton.vue'

defineProps<{ note: Note }>()
const emit = defineEmits<{ edit: []; remove: [] }>()
</script>

<template>
  <article class="note-card">
    <div class="note-card__body">
      <div class="note-card__title">{{ note.title.trim() || 'Без названия' }}</div>
      <TodoList :todos="note.todos" :preview-limit="3" />
    </div>
    <div class="note-card__actions">
      <VButton size="small" variant="ghost" @click="emit('edit')">Изменить</VButton>
      <VButton size="small" variant="ghost" @click="emit('remove')">Удалить</VButton>
    </div>
  </article>
</template>

<style lang="scss">
.note-card {
  background: $color-surface; 
  border: 1px solid $color-border; 
  border-radius: $radius-card; 
  box-shadow: $shadow-card;
  display: flex; 
  flex-direction: column; 
  min-height: 210px; 
  padding: 22px;

  &__body {
    flex: 1;
  }

  &__title {
    margin: 0 0 16px; 
    font-size: 17px; 
    letter-spacing: -.3px; 
    overflow-wrap: anywhere;
  }

  &__actions {
    display: flex; 
    align-items: center; 
    justify-content: end;
    gap: 8px; 
    padding-top: 6px; 
    border-top: 1px solid $color-border;
    margin-top: 16px;
  }

  &__link {
    margin-right: auto; 
    color: $color-primary; 
    font-size: 12px; 
    font-weight: 700; 

    &:hover { 
      color: $color-primary; 
    }
  }

  @media (max-width: 680px) {
    min-height: 190px;
  }
}
</style>
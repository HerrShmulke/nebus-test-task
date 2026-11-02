<script setup lang="ts">
import type { Note } from '../../types/note.ts';
import NoteCard from '../notes/NoteCard.vue';
import IconPlus from '../ui/icons/IconPlus.vue';
import VButton from '../ui/VButton.vue';
import HomeEmptyState from './HomeEmptyState.vue';

defineProps<{
  notes: Note[]
}>()

const emit = defineEmits<{
  createNote: [],
  removeNote: [noteId: string]
}>()
</script>

<template>
  <section class="home-page-content">
    <div class="home-page-content__heading">
      <div>
        <h1>Мои заметки</h1>
      </div>
      <VButton variant="primary" @click="emit('createNote')"><IconPlus size="18px" /> Новая заметка</VButton>
    </div>

    <HomeEmptyState v-if="!notes.length" @create-note="emit('createNote')" />

    <div v-else class="home-page-content__notes-grid">
      <NoteCard
        v-for="note in notes"
        :key="note.id"
        :note="note"
        @edit="navigateTo(`/notes/${note.id}`)"
        @remove="emit('removeNote', note.id)"
      />
    </div>
  </section>
</template>

<style lang="scss">
.home-page-content { 
  width: min(100% - 48px, 1040px); 
  margin: 58px auto 80px; 

  &__notes-grid {
    display: grid; 
    grid-template-columns: repeat(2, minmax(0, 1fr)); 
    gap: 18px;

    @media (max-width: 680px) {
      grid-template-columns: 1fr;
    }
  }

  &__heading {
    display: flex; 
    align-items: flex-end; 
    justify-content: space-between; 
    gap: 24px; 
    margin-bottom: 30px;

    @media (max-width: 680px) {
      align-items: flex-start; 
      flex-direction: column; 
      gap: 18px; 

      & > .v-button {
        width: 100%;
      }
    }
  }

  @media (max-width: 680px) {
    width: min(100% - 32px, 540px); 
    margin-top: 34px;
  }
}
</style>
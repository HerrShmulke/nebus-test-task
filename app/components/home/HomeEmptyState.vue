<script setup lang="ts">
import IconPencil from '../ui/icons/IconPencil.vue';
import VButton from '../ui/VButton.vue';

const emit = defineEmits<{
  createNote: []
}>()
</script>

<template>
  <div class="home-empty-state">
    <div class="home-empty-state__icon"><IconPencil size="32px" /></div>
    <h2 class="home-empty-state__title">Пока нет заметок</h2>
    <p class="home-empty-state__description">Создайте первую заметку, чтобы зафиксировать свои планы.</p>
    <VButton variant="primary" @click="emit('createNote')">Создать заметку</VButton>
  </div>
</template>

<style lang="scss">
.home-empty-state {
  min-height: 390px; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center;
  padding: 40px 20px; 
  border: 1px dashed #d4dce7; 
  border-radius: $radius-card; 
  text-align: center;

  &__icon {
    display: grid; 
    place-items: center; 
    width: 56px; 
    height: 56px; 
    border-radius: 18px; 
    background: #edf1ff; 
    color: $color-primary; 
    font-size: 27px;
  }

  &__title {
    margin: 18px 0 6px; 
    font-size: 19px;
  }

  &__description {
    margin: 0 0 20px; 
    color: $color-text-muted; 
    font-size: 13px;
  }
}
</style>
<script setup lang="ts">
defineProps<{ 
  modelValue: boolean; 
  label: string; 
  id: string, 
  readonly?: boolean 
}>()

const emit = defineEmits<{ 
  'update:modelValue': [value: boolean] 
}>()
</script>

<template>
  <label class="checkbox" :for="id">
    <input
      :id="id"
      :disabled="readonly"
      type="checkbox"
      :checked="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    >
    <span class="checkbox__mark" aria-hidden="true" />
    <span class="checkbox__label">{{ label }}</span>
  </label>
</template>

<style lang="scss">
.checkbox { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  min-width: 0; 
  cursor: pointer; 

  &__mark {
    flex: 0 0 17px;
    width: 17px; 
    height: 17px; 
    border: 1.5px solid #c7d0dd; 
    border-radius: 5px; 
    background: white; 
    position: relative;
  }

  &__label {
    overflow: hidden; 
    color: #4d5a6c; 
    font-size: 13px; 
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.checkbox input { 
  position: absolute; 
  width: 1px; 
  height: 1px; 
  opacity: 0; 
}

.checkbox input:checked + .checkbox__mark { 
  background: $color-primary; 
  border-color: $color-primary; 
}

.checkbox input:checked + .checkbox__mark::after {
  content: '';
  position: absolute; 
  left: 5px; 
  top: 2px; 
  width: 4px; 
  height: 8px;
  border: solid white; 
  border-width: 0 2px 2px 0; 
  transform: rotate(45deg);
}

.checkbox input:focus-visible + .checkbox__mark { 
  outline: 3px solid rgba($color-primary, .25); 
  outline-offset: 2px; 
}
</style>
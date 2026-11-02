<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'small' | 'medium'
  type?: 'button' | 'submit'
  disabled?: boolean
}>(), {
  variant: 'secondary',
  size: 'medium',
  type: 'button',
  disabled: false,
})
</script>

<template>
  <button
    class="v-button"
    :class="[`v-button--${variant}`, `v-button--${size}`]"
    :type="type"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style lang="scss">
@use 'sass:color';

.v-button {
  display: inline-flex; 
  align-items: center; 
  justify-content: center; 
  gap: 8px; 
  border: 1px solid transparent;
  border-radius: 9px; 
  padding: 10px 15px; 
  font-weight: 650; 
  font-size: 13px; 
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease, transform .15s ease;

  &:disabled { 
    opacity: .4;
    cursor: not-allowed; 
  }

  &:not(:disabled):active { 
    transform: translateY(1px); 
  }

  &--medium {
    min-height: 40px;
  }

  &--small {
    min-height: 32px; 
    padding: 6px 10px; 
    font-size: 12px;
  }

  &--primary {
    background: $color-primary; 
    color: white; 

    &:hover:not(:disabled) { 
      background: $color-primary-hover; 
    }
  }

  &--secondary {
    background: white; 
    border-color: $color-border; 
    color: $color-text; 
    
    &:hover:not(:disabled) { 
      background: $color-surface-muted; 
    }
  }

  &--danger {
    background: $color-danger; 
    color: white; 

    &:hover:not(:disabled) {
      background: color.adjust($color-danger, $lightness: -7%);
    }
  } 

  &--ghost {
    background: transparent; 
    color: $color-text-muted; 

    &:hover:not(:disabled) { 
      background: $color-surface-muted; 
      color: $color-text; 
    }
  }
}
</style>
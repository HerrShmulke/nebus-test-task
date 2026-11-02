<script setup lang="ts">
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'

const props = withDefaults(defineProps<{
  open: boolean
  title: string
  description?: string
}>(), { description: '' })

const emit = defineEmits<{ close: [] }>()
const panel = useTemplateRef('panel')

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }
}

watch(() => props.open, async open => {
  if (!import.meta.client) return

  if (open) {
    await nextTick()
    activate()
  } else {
    deactivate()
  }
})

onBeforeUnmount(() => {
  deactivate()
})

const { activate, deactivate } = useFocusTrap(panel)
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" @mousedown.self="emit('close')">
      <div
        ref="panel"
        class="modal"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
        @keydown="onKeydown"
      >
        <header class="modal__header">
          <div class="modal__header-title">{{ title }}</div>
          <button class="icon-button" type="button" aria-label="Закрыть" @click="emit('close')">×</button>
        </header>
        <p v-if="description" class="modal__description">{{ description }}</p>
        <div class="modal__content"><slot /></div>
        <footer class="modal__footer"><slot name="footer" /></footer>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss">
.icon-button { 
  width: 30px; 
  height: 30px; 
  border: 0; 
  border-radius: 7px; 
  background: transparent; 
  color: $color-text-muted; 
  font-size: 22px; 
  cursor: pointer; 
}

.modal-backdrop {
  position: fixed; 
  z-index: 1000; 
  inset: 0; 
  display: grid; 
  place-items: center; 
  padding: 20px;
  background: rgba(15, 23, 42, .42); 
  backdrop-filter: blur(3px);
}

.modal {
  width: min(100%, 440px); 
  padding: 23px; 
  border: 1px solid $color-border; 
  border-radius: 15px;
  background: white; 
  box-shadow: 0 24px 80px rgba(15, 23, 42, .2);

  &__header { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    gap: 16px; 
  }

  &__header-title { 
    margin: 0; 
    font-size: 18px; 
  }

  &__description { 
    margin: 12px 0 0; 
    color: $color-text-muted; 
    font-size: 13px; 
    line-height: 1.6; 
  }

  &__footer { 
    display: flex; 
    justify-content: flex-end; 
    gap: 8px; 
    margin-top: 24px; 
  }
}
</style>
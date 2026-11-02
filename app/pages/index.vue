<script setup lang="ts">
import VButton from '../components/ui/VButton.vue'
import VModal from '../components/ui/VModal.vue'
import TheHeader from '../components/ui/TheHeader.vue'
import HomePageContent from '../components/home/HomePageContent.vue'
import { useHomePage } from '../composables/useHomePage.ts'

const {
  notes,
  dialog,
  accept,
  dismiss,
  createNote,
  removeNote
} = useHomePage()
</script>

<template>
  <main class="page-shell">
    <TheHeader />

    <HomePageContent :notes="notes" @create-note="createNote" @remove-note="removeNote" />

    <VModal
      :open="Boolean(dialog)"
      :title="dialog?.options.title ?? ''"
      :description="dialog?.options.message"
      @close="dismiss"
    >
      <template #footer>
        <VButton @click="dismiss">{{ dialog?.options.cancelText ?? 'Отмена' }}</VButton>
        <VButton :variant="dialog?.options.danger ? 'danger' : 'primary'" @click="accept">
          {{ dialog?.options.confirmText ?? 'Подтвердить' }}
        </VButton>
      </template>
    </VModal>
  </main>
</template>
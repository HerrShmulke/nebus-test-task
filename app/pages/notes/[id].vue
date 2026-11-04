<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useNotesStore } from '../../stores/notes'
import { useConfirm } from '../../composables/useConfirm'
import NoteForm from '../../components/notes/NoteForm.vue'
import VButton from '../../components/ui/VButton.vue'
import VModal from '../../components/ui/VModal.vue'
import TheHeader from '../../components/ui/TheHeader.vue'
import { useNoteEditor } from '../../composables/useNoteEditor.ts'
import { useNoteActions } from '../../composables/useNoteActions.ts'
import { useNoteDraft } from '../../composables/useNoteDraft.ts'
import { useNoteSync } from '../../composables/useNoteSync.ts'
import { useNoteKeyboard } from '../../composables/useNoteKeyboard.ts' 

const route = useRoute()
const store = useNotesStore()

store.init()

const noteId = String(route.params.id)
const original = store.getById(noteId)

if (!original && import.meta.client) {
  await navigateTo('/')
  throw createError({
    statusCode: 404,
    statusMessage: 'Заметка не найдена',
  })
}

const editor = useNoteEditor(original!)

const {
  history,
  baseNote,
  isDirty,
} = editor

const { save: saveNote, cancelEditing, deleteCurrent } = useNoteActions(original!.id, editor)

const {
  draft,
  canUndo,
  canRedo,
} = history

const {
  restorePrompt,
  restoreDraft,
  discardDraft,
} = useNoteDraft({
  noteId,
  baseNote,
  draft,
  isDirty,
  reset: note => history.reset(note),
})

const { deletedExternally } = useNoteSync(noteId)

const { dialog, accept, dismiss } = useConfirm()

useNoteKeyboard({
  undo: history.undo,
  redo: history.redo,
})

async function save() {
  const saved = await saveNote()

  if (!saved) {
    deletedExternally.value = true
  }
}

</script>

<template>
  <main class="page-shell">
    <TheHeader />

    <section class="editor-content">
      <div class="editor-content__heading">
        <div>
          <h1>Редактирование</h1>
          <p class="editor-content__heading-subtitle">Изменения сохраняются только после нажатия кнопки «Сохранить».</p>
        </div>
        <div class="editor-content__heading-actions">
          <VButton @click="cancelEditing">Отмена</VButton>
          <VButton variant="primary" @click="save">Сохранить</VButton>
          <VButton variant="danger" @click="deleteCurrent">Удалить</VButton>
        </div>
      </div>

      <div class="editor-card">
        <ClientOnly>
          <NoteForm
            :note="draft"
            :can-undo="canUndo"
            :can-redo="canRedo"
            @title="history.updateTitle"
            @todo-text="history.updateTodoText"
            @todo-blur="history.blurText"
            @toggle-todo="history.toggleTodo"
            @add-todo="history.addTodo"
            @remove-todo="history.removeTodo"
            @undo="history.undo"
            @redo="history.redo"
          />
        </ClientOnly>
      </div>

      <div class="editor-footer">
        <span class="keyboard-hint">Ctrl + Z — отменить | Ctrl + Shift + Z — повторить</span>
      </div>
    </section>

    <VModal :open="Boolean(dialog)" :title="dialog?.options.title ?? ''" :description="dialog?.options.message" @close="dismiss">
      <template #footer>
        <VButton @click="dismiss">{{ dialog?.options.cancelText ?? 'Отмена' }}</VButton>
        <VButton :variant="dialog?.options.danger ? 'danger' : 'primary'" @click="accept">
          {{ dialog?.options.confirmText ?? 'Подтвердить' }}
        </VButton>
      </template>
    </VModal>

    <VModal
      :open="restorePrompt"
      title="Найден черновик"
      description="В этой заметке есть незасохранённые изменения. Хотите восстановить их?"
      @close="discardDraft"
    >
      <template #footer>
        <VButton @click="discardDraft">Не восстанавливать</VButton>
        <VButton variant="primary" @click="restoreDraft">Восстановить</VButton>
      </template>
    </VModal>

    <VModal
      :open="deletedExternally"
      title="Заметка удалена"
      description="Эта заметка была удалена в другой вкладке. Продолжать её редактирование нельзя."
      @close="navigateTo('/')"
    >
      <template #footer>
        <VButton variant="primary" @click="navigateTo('/')">К списку заметок</VButton>
      </template>
    </VModal>
  </main>
</template>

<style lang="scss">
.keyboard-hint { 
  color: $color-text-muted; 
  font-size: 11px; 

  @media (max-width: 680px) {
    line-height: 1.5;
  }
}

.editor-footer { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  gap: 16px; 
  margin-top: 20px; 

  @media (max-width: 680px) {
    align-items: flex-start; 
    flex-direction: column;
  }
}

.editor-card {
  background: $color-surface;
  border: 1px solid $color-border; 
  border-radius: $radius-card; 
  box-shadow: $shadow-card;
  padding: 30px;

  @media (max-width: 680px) {
    padding: 20px 16px;
  }
}

.editor-content { 
  width: min(100% - 48px, 1040px);
  margin: 58px auto 80px;
  max-width: 820px;

  @media (max-width: 680px) {
    width: min(100% - 32px, 540px);
    margin-top: 34px;
  }

  &__heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 30px;

    @media (max-width: 850px) {
      align-items: flex-start; 
      flex-direction: column; 
      gap: 18px;
    }
  }

  &__heading-actions { 
    display: flex; 
    gap: 8px; 

    @media (max-width: 850px) {
      width: 100%;

      & > * {
        flex: 1;
      }
    }

    @media (max-width: 460px) {
      flex-direction: column;
    }
  }

  &__heading-subtitle {
    margin: 10px 0 0; 
    color: $color-text-muted; 
    font-size: 14px; 
    line-height: 1.6;
  }
}
</style>
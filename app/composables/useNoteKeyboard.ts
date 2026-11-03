import { onBeforeUnmount, onMounted } from 'vue'

interface UseNoteKeyboardOptions {
  undo: () => void
  redo: () => void
}

export function useNoteKeyboard(options: UseNoteKeyboardOptions) {
  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
  })

  onBeforeUnmount(() => {
    if (import.meta.client) {
      window.removeEventListener('keydown', onKeydown)
    }
  })

  function onKeydown(event: KeyboardEvent) {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return

    const target = event.target

    if (
      target instanceof HTMLElement
      && (
        target.matches('input, textarea')
        || target.isContentEditable
      )
    ) {
      return
    }

    if (event.key.toLowerCase() !== 'z') return

    event.preventDefault()

    if (event.shiftKey) {
      options.redo()
    } else {
      options.undo()
    }
  }
}
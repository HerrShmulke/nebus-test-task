import { ref } from 'vue'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

const active = ref<{
  options: ConfirmOptions
  resolve: (value: boolean) => void
} | null>(null)

export function useConfirm() {
  function confirm(options: ConfirmOptions): Promise<boolean> {
    if (active.value) return Promise.resolve(false)
    return new Promise(resolve => {
      active.value = { options, resolve }
    })
  }

  function settle(value: boolean) {
    const current = active.value
    if (!current) return
    active.value = null
    current.resolve(value)
  }

  return {
    dialog: active,
    confirm,
    accept: () => settle(true),
    dismiss: () => settle(false),
  }
}

import { ref } from 'vue'

const toasts = ref([])

export const useToastStore = () => {
  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now()
    toasts.value.push({
      id,
      message,
      type,
      duration
    })

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    addToast,
    removeToast
  }
}
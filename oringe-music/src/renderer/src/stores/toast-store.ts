import { create } from 'zustand'

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Toast store for managing toasts
interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const newToast: Toast = { ...toast, id }

    set((state) => ({
      toasts: [...state.toasts, newToast]
    }))

    // Auto-remove after duration (default 5 seconds)
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, duration)
    }

    return id
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  }
}))

// Helper functions for creating toasts
export const toast = {
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>): string =>
    useToastStore.getState().addToast({ type: 'success', message, ...options }),

  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>): string =>
    useToastStore.getState().addToast({ type: 'error', message, duration: 8000, ...options }),

  warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>): string =>
    useToastStore.getState().addToast({ type: 'warning', message, ...options }),

  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>): string =>
    useToastStore.getState().addToast({ type: 'info', message, ...options })
}

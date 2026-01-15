import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useToastStore, toast } from '@renderer/stores/toast-store'

describe('Toast Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useToastStore.setState({ toasts: [] })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('addToast', () => {
    it('should add a toast to the store', () => {
      const id = useToastStore.getState().addToast({
        type: 'success',
        message: 'Test message'
      })

      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0].id).toBe(id)
      expect(toasts[0].type).toBe('success')
      expect(toasts[0].message).toBe('Test message')
    })

    it('should auto-remove toast after duration', () => {
      useToastStore.getState().addToast({
        type: 'info',
        message: 'Auto-remove test',
        duration: 3000
      })

      expect(useToastStore.getState().toasts).toHaveLength(1)

      // Fast-forward time
      vi.advanceTimersByTime(3000)

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('should not auto-remove toast when duration is 0', () => {
      useToastStore.getState().addToast({
        type: 'error',
        message: 'Persistent toast',
        duration: 0
      })

      expect(useToastStore.getState().toasts).toHaveLength(1)

      // Fast-forward time
      vi.advanceTimersByTime(10000)

      // Toast should still be there
      expect(useToastStore.getState().toasts).toHaveLength(1)
    })
  })

  describe('removeToast', () => {
    it('should remove a specific toast', () => {
      const id1 = useToastStore.getState().addToast({
        type: 'success',
        message: 'Toast 1',
        duration: 0
      })
      useToastStore.getState().addToast({
        type: 'error',
        message: 'Toast 2',
        duration: 0
      })

      expect(useToastStore.getState().toasts).toHaveLength(2)

      useToastStore.getState().removeToast(id1)

      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0].message).toBe('Toast 2')
    })
  })

  describe('clearToasts', () => {
    it('should remove all toasts', () => {
      useToastStore.getState().addToast({ type: 'success', message: 'Toast 1', duration: 0 })
      useToastStore.getState().addToast({ type: 'error', message: 'Toast 2', duration: 0 })
      useToastStore.getState().addToast({ type: 'warning', message: 'Toast 3', duration: 0 })

      expect(useToastStore.getState().toasts).toHaveLength(3)

      useToastStore.getState().clearToasts()

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })
  })

  describe('toast helper functions', () => {
    it('should create success toast', () => {
      toast.success('Success message')

      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0].type).toBe('success')
      expect(toasts[0].message).toBe('Success message')
    })

    it('should create error toast with longer duration', () => {
      toast.error('Error message')

      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0].type).toBe('error')
      expect(toasts[0].message).toBe('Error message')
      expect(toasts[0].duration).toBe(8000) // Error toasts have longer duration
    })

    it('should create warning toast', () => {
      toast.warning('Warning message')

      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0].type).toBe('warning')
    })

    it('should create info toast', () => {
      toast.info('Info message')

      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0].type).toBe('info')
    })

    it('should support action in toast', () => {
      const actionFn = vi.fn()
      toast.success('With action', {
        action: {
          label: 'Click me',
          onClick: actionFn
        }
      })

      const toasts = useToastStore.getState().toasts
      expect(toasts[0].action).toBeDefined()
      expect(toasts[0].action?.label).toBe('Click me')

      // Trigger action
      toasts[0].action?.onClick()
      expect(actionFn).toHaveBeenCalled()
    })
  })
})

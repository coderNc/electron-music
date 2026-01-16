import * as React from 'react'

export interface ConfirmDialogConfig {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
}

/**
 * Hook for managing confirm dialog state
 */
export function useConfirmDialog(): {
  isOpen: boolean
  config: ConfirmDialogConfig | null
  confirm: (config: ConfirmDialogConfig) => Promise<boolean>
  close: () => void
  onConfirm?: () => void
  onCancel?: () => void
} {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<ConfirmDialogConfig | null>(null)
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null)

  const confirm = React.useCallback((dialogConfig: ConfirmDialogConfig) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
      setConfig(dialogConfig)
      setIsOpen(true)
    })
  }, [])

  const close = React.useCallback(() => {
    setIsOpen(false)
    setConfig(null)
    if (resolveRef.current) {
      resolveRef.current(false)
      resolveRef.current = null
    }
  }, [])

  const handleConfirm = React.useCallback(() => {
    setIsOpen(false)
    setConfig(null)
    if (resolveRef.current) {
      resolveRef.current(true)
      resolveRef.current = null
    }
  }, [])

  return {
    isOpen,
    config,
    confirm,
    close,
    onConfirm: handleConfirm,
    onCancel: close
  }
}

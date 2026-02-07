import * as React from 'react'
import { createPortal } from 'react-dom'

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = '确认',
  cancelLabel = '取消',
  variant = 'default',
  onConfirm,
  onCancel
}: ConfirmDialogProps): React.JSX.Element | null {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) onCancel()
    }

    if (isOpen) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const confirmButtonStyles = {
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    warning: 'bg-amber-600 hover:bg-amber-500 text-white',
    default: 'bg-orange-600 hover:bg-orange-500 text-white'
  }

  const iconColor = {
    danger: 'text-red-400 bg-red-500/10',
    warning: 'text-amber-400 bg-amber-500/10',
    default: 'text-orange-400 bg-orange-500/10'
  }

  const dialog = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div
        className="glass-panel relative w-full max-w-md rounded-2xl p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <div className="mb-4 flex justify-center">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${iconColor[variant]}`}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h2
          id="confirm-dialog-title"
          className="mb-2 text-center text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {title}
        </h2>

        <p
          id="confirm-dialog-message"
          className="mb-6 text-center text-sm text-zinc-600 dark:text-zinc-300"
        >
          {message}
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="interactive-soft focus-ring rounded-xl bg-zinc-200/70 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`interactive-soft focus-ring rounded-xl px-4 py-2 text-sm font-medium ${confirmButtonStyles[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}

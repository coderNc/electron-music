import * as React from 'react'
import { useToastStore, type Toast } from '@renderer/stores/toast-store'

// Icon components
function SuccessIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function ErrorIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function WarningIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  )
}

function InfoIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function CloseIcon(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// Toast item component
interface ToastItemProps {
  toast: Toast
  onClose: () => void
}

function ToastItem({ toast, onClose }: ToastItemProps): React.JSX.Element {
  const typeStyles = {
    success: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400',
    error: 'bg-red-500/10 border-red-500/50 text-red-400',
    warning: 'bg-amber-500/10 border-amber-500/50 text-amber-400',
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-400'
  }

  const icons = {
    success: <SuccessIcon />,
    error: <ErrorIcon />,
    warning: <WarningIcon />,
    info: <InfoIcon />
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${typeStyles[toast.type]} animate-in slide-in-from-right-full duration-300`}
      role="alert"
    >
      <span className="flex-shrink-0">{icons[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-100">{toast.message}</p>
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-xs font-medium underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
        aria-label="关闭"
      >
        <CloseIcon />
      </button>
    </div>
  )
}

// Toast container component
export function ToastContainer(): React.JSX.Element {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  return (
    <div
      className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 max-w-sm"
      aria-live="polite"
      aria-label="通知"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  )
}

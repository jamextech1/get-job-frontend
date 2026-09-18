'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { motion, MotionConfig } from 'motion/react'

export type ToastKind = 'success' | 'error'

type Toast = { id: number; kind: ToastKind; message: string }

type ToastContextValue = {
  push: (kind: ToastKind, message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (context === null) throw new Error('useToast must be used within ToastProvider')
  return context
}

function SuccessIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="mt-0.5 size-4 shrink-0 text-success"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className="mt-0.5 size-4 shrink-0 text-danger"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  )
}

function DismissIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className="size-3.5"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  )
}

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: number) => void }) {
  const timerRef = useRef<number | null>(null)
  const startedAtRef = useRef(0)
  const remainingRef = useRef(toast.kind === 'error' ? 8000 : 5000)

  const pause = useCallback(() => {
    if (timerRef.current === null) return
    window.clearTimeout(timerRef.current)
    timerRef.current = null
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current))
  }, [])

  const resume = useCallback(() => {
    if (timerRef.current !== null) return
    startedAtRef.current = Date.now()
    timerRef.current = window.setTimeout(() => dismiss(toast.id), remainingRef.current)
  }, [dismiss, toast.id])

  useEffect(() => {
    resume()
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [resume])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      className="pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-card border border-border bg-surface p-4 shadow-lg"
    >
      {toast.kind === 'success' ? <SuccessIcon /> : <ErrorIcon />}
      <p className="min-w-0 flex-1 break-words text-sm text-ink">{toast.message}</p>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-card p-1 text-muted hover:bg-surface-hover hover:text-ink"
      >
        <DismissIcon />
      </button>
    </motion.div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      counter.current += 1
      const id = counter.current
      setToasts(prev => [...prev.slice(-3), { id, kind, message }])
    },
    [],
  )

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <MotionConfig reducedMotion="user">
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4 pb-6"
        >
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} dismiss={dismiss} />
          ))}
        </div>
      </MotionConfig>
    </ToastContext.Provider>
  )
}

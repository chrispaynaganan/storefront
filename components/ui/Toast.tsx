'use client'
import { useToastContext } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

export function ToastContainer() {
  const { toasts, dismiss } = useToastContext()
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={cn(
            'px-4 py-3 rounded-lg text-sm shadow-lg cursor-pointer flex items-center gap-2',
            t.type === 'success' && 'bg-green-600 text-white',
            t.type === 'error' && 'bg-red-600 text-white',
            t.type === 'info' && 'bg-brown text-white',
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

'use client'
interface Props { open: boolean; onClose: () => void; children: React.ReactNode; title?: string }

export function Modal({ open, onClose, children, title }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        {title && <h2 className="text-lg font-medium text-brown mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  )
}

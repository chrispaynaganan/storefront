import Link from 'next/link'

interface Props {
  message?: string
  submessage?: string
  action?: React.ReactNode
}

export function EmptyState({ message = 'Nothing here yet.', submessage, action }: Props) {
  return (
    <div className="py-24 text-center flex flex-col items-center gap-3">
      <div className="w-14 h-14 rounded-full bg-whitewash-off flex items-center justify-center mb-2">
        <svg className="w-6 h-6 text-brown/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v.375c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
      <p className="text-brown font-semibold text-base">{message}</p>
      {submessage && <p className="text-brown/40 text-sm max-w-xs">{submessage}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
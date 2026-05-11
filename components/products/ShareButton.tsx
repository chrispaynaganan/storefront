'use client'
import { useState, useEffect, useRef } from 'react'

interface Props {
  title: string
  url?: string
}

interface ShareOption {
  label: string
  href: string
  color: string
  show: boolean
  icon: React.ReactNode
}

export function ShareButton({ title, url }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const shareUrl =
    url ?? (typeof window !== 'undefined' ? window.location.href : '')

  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    setCopied(true)
    setTimeout(() => {
      setCopied(false)
      setOpen(false)
    }, 1500)
  }

  const MessengerIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.908 1.438 5.504 3.686 7.205V22l3.371-1.851c.9.249 1.853.383 2.943.383 5.523 0 10-4.145 10-9.243S17.523 2 12 2zm1.043 12.454l-2.546-2.715-4.97 2.715 5.467-5.798 2.607 2.715 4.909-2.715-5.467 5.798z"/>
    </svg>
  )

  const WhatsAppIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
    </svg>
  )

  const TelegramIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  )

  const EmailIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  )

  const CopyIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  )

  const options: ShareOption[] = [
    {
      label: 'Messenger',
      href: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=YOUR_FB_APP_ID&redirect_uri=${encodedUrl}`,
      color: 'text-blue-500',
      show: false, // disable until you have real app_id
      icon: <MessengerIcon />,
    },
    {
      label: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      color: 'text-green-500',
      show: true,
      icon: <WhatsAppIcon />,
    },
    {
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'text-sky-500',
      show: true,
      icon: <TelegramIcon />,
    },
    {
      label: 'Email',
      href: `mailto:?subject=${encodedTitle}&body=Check this out: ${encodedUrl}`,
      color: 'text-brown',
      show: true,
      icon: <EmailIcon />,
    },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-10 h-10 rounded-full border border-peach flex items-center justify-center text-brown hover:bg-peach-light/30 transition-colors"
        aria-label="Share"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-12 bg-white rounded-2xl border border-peach-light shadow-lg p-3 w-48 z-20 space-y-1">
          {options.filter(o => o.show).map(opt => (
            <a
              key={opt.label}
              href={opt.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-whitewash-off transition-colors"
            >
              <span className={opt.color}>{opt.icon}</span>
              <span className="text-sm text-brown">{opt.label}</span>
            </a>
          ))}

          <button
            onClick={copyLink}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-whitewash-off transition-colors w-full text-brown"
          >
            <CopyIcon />
            <span className="text-sm">
              {copied ? '✓ Copied!' : 'Copy link'}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
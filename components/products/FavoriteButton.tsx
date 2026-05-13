'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase'

interface FavoriteButtonProps {
  productId: string
  initialFavorited: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function FavoriteButton({
  productId,
  initialFavorited,
  size = 'md',
  className = '',
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
  const buttonSize = size === 'sm' ? 'p-1.5' : size === 'lg' ? 'p-2.5' : 'p-2'

  async function toggle() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }
    setFavorited(prev => !prev)
    startTransition(async () => {
      if (favorited) {
        await supabase.from('favorites').delete()
          .eq('product_id', productId).eq('user_id', user.id)
      } else {
        await supabase.from('favorites').insert({ product_id: productId, user_id: user.id })
      }
    })
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle() }}
      disabled={isPending}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      className={`rounded-full transition-all duration-200 ${buttonSize} ${
        favorited
          ? 'text-red-500 hover:bg-red-50'
          : 'text-brown hover:bg-brown/5'
      } disabled:opacity-50 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={iconSize}
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={favorited ? 0 : 1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  )
}
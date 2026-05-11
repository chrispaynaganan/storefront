'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'

interface Review {
  id: string
  user_id: string
  rating: number
  body: string | null
  image_urls: string[]
  created_at: string
  user: {
    full_name: string | null
    avatar_url: string | null
    email: string
  }
}

interface Props {
  productId: string
  initialReviews: Review[]
  currentUserId: string | null
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type={onChange ? 'button' : 'button'}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          disabled={!onChange}
          className="transition-colors disabled:cursor-default"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill={(hovered || value) >= star ? '#3B1F0E' : 'none'}
            stroke="#3B1F0E"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review, currentUserId, onDelete }: { review: Review; currentUserId: string | null; onDelete: (id: string) => void }) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)
  const initials = (review.user.full_name ?? review.user.email)[0].toUpperCase()

  return (
    <div className="py-6 border-b border-peach-light last:border-0">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-peach flex items-center justify-center shrink-0 overflow-hidden">
            {review.user.avatar_url ? (
              <Image src={review.user.avatar_url} alt="" width={36} height={36} className="object-cover" />
            ) : (
              <span className="text-brown font-medium text-sm">{initials}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-brown">{review.user.full_name ?? 'Customer'}</p>
            <p className="text-xs text-brown-light">{formatDate(review.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StarRating value={review.rating} />
          {currentUserId === review.user_id && (
            <button
              onClick={() => onDelete(review.id)}
              className="text-xs text-brown/30 hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {review.body && (
        <p className="text-sm text-brown-light leading-relaxed mb-3">{review.body}</p>
      )}

      {review.image_urls?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {review.image_urls.map((img, i) => (
            <button
              key={i}
              onClick={() => setLightboxImg(img)}
              className="relative w-20 h-20 rounded-lg overflow-hidden bg-whitewash-off"
            >
              <Image src={img} alt="" fill className="object-cover hover:scale-105 transition-transform" />
            </button>
          ))}
        </div>
      )}

      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative w-full max-w-lg max-h-[85vh] aspect-square mx-4">
            <Image src={lightboxImg} alt="" fill className="object-contain" />
          </div>
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

async function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX = 1200
      let { width, height } = img
      if (width > MAX) { height = Math.round(height * MAX / width); width = MAX }
      if (height > MAX) { width = Math.round(width * MAX / height); height = MAX }
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Conversion failed')), 'image/webp', 0.85)
    }
    img.onerror = reject
    img.src = url
  })
}

export function ReviewSection({ productId, initialReviews, currentUserId }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const hasReviewed = currentUserId
    ? reviews.some(r => r.user_id === currentUserId)
    : false

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 4)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  function removeImage(i: number) {
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError('Please select a rating.'); return }
    setSubmitting(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    // Upload images — convert to WebP first
    const uploadedUrls: string[] = []
    for (const file of images) {
      try {
        const webp = await convertToWebP(file)
        const path = `reviews/${productId}/${user.id}-${Date.now()}.webp`
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(path, webp, { contentType: 'image/webp', upsert: false })
        if (!uploadError) {
          const { data } = supabase.storage.from('products').getPublicUrl(path)
          uploadedUrls.push(data.publicUrl)
        }
      } catch {}
    }

    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        rating,
        body: body.trim() || null,
        image_urls: uploadedUrls,
      })
      .select('*, user:users(full_name, avatar_url, email)')
      .single()

    if (insertError) {
      setError('Failed to submit review. Please try again.')
      setSubmitting(false)
      return
    }

    setReviews(prev => [review as Review, ...prev])
    setRating(0)
    setBody('')
    setImages([])
    setPreviews([])
    setShowForm(false)
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('reviews').delete().eq('id', id)
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 border-t border-peach-light mt-12">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-brown">Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={Math.round(avgRating)} />
              <span className="text-sm text-brown-light">
                {avgRating.toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          )}
        </div>
        {currentUserId && !hasReviewed && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="text-sm border border-brown text-brown px-4 py-2 rounded-full hover:bg-brown hover:text-whitewash transition-colors"
          >
            {showForm ? 'Cancel' : 'Write a review'}
          </button>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-whitewash-off rounded-2xl p-6 mb-8 space-y-4">
          <div>
            <p className="text-sm text-brown mb-2">Your rating</p>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div>
            <p className="text-sm text-brown mb-2">Review <span className="text-brown/40">(optional)</span></p>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={4}
              placeholder="Share your thoughts about this product..."
              className="w-full bg-white border border-peach-light rounded-xl px-4 py-3 text-sm text-brown placeholder:text-brown/30 outline-none focus:ring-2 focus:ring-peach resize-none"
            />
          </div>

          {/* Image upload */}
          <div>
            <p className="text-sm text-brown mb-2">Photos <span className="text-brown/40">(up to 4)</span></p>
            <div className="flex gap-2 flex-wrap">
              {previews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-whitewash">
                  <Image src={src} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              {previews.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-peach flex items-center justify-center text-brown/40 hover:border-brown/40 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-brown text-whitewash px-6 py-2.5 rounded-full text-sm font-medium hover:bg-brown-light transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit review'}
          </button>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-brown/40 text-sm">No reviews yet. Be the first to review this product.</p>
        </div>
      ) : (
        <div>
          {reviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
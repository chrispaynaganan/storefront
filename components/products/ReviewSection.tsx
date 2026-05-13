'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'

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
  } | null
}

interface Props {
  productId: string
  initialReviews: Review[]
  currentUserId: string | null
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          disabled={!onChange}
          className="disabled:cursor-default"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"
            fill={(hovered || value) >= star ? '#F59E0B' : 'none'}
            stroke="#F59E0B" strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

// ─── Single review row (used in both carousel card and modal list) ──────────

function ReviewRow({
  review,
  currentUserId,
  onDelete,
}: {
  review: Review
  currentUserId: string | null
  onDelete?: (id: string) => void
}) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)
  const name = review.user?.full_name ?? review.user?.email ?? 'Customer'

  return (
    <div>
      {/* Name */}
      <p className="font-semibold text-brown text-base">{name}</p>

      {/* Stars + date */}
      <div className="flex items-center justify-between mt-1 mb-3">
        <Stars value={review.rating} />
        <span className="text-sm text-brown-light">{formatMonth(review.created_at)}</span>
      </div>

      {/* Body */}
      {review.body && (
        <p className="text-sm text-brown-light leading-relaxed mb-3">{review.body}</p>
      )}

      {/* Photos */}
      {review.image_urls?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {review.image_urls.map((img, i) => (
            <button
              key={i}
              onClick={() => setLightboxImg(img)}
              className="relative w-20 h-20 rounded-xl overflow-hidden bg-whitewash-off shrink-0"
            >
              <Image src={img} alt="" fill className="object-cover hover:scale-105 transition-transform" />
            </button>
          ))}
        </div>
      )}

      {/* Delete */}
      {onDelete && currentUserId === review.user_id && (
        <button
          onClick={() => onDelete(review.id)}
          className="mt-2 text-xs text-brown/30 hover:text-red-400 transition-colors"
        >
          Delete
        </button>
      )}

      {/* Photo lightbox */}
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

// ─── All Reviews modal ───────────────────────────────────────────────────────

function AllReviewsModal({
  reviews,
  currentUserId,
  onDelete,
  onClose,
}: {
  reviews: Review[]
  currentUserId: string | null
  onDelete: (id: string) => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Panel */}
      <div
        className="relative bg-white w-full md:max-w-2xl md:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto z-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-brown/20" />
        </div>

        <div className="px-6 pb-8 pt-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brown">All Reviews</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-brown/40 hover:text-brown hover:bg-whitewash-off transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Review list */}
          <div className="space-y-8">
            {reviews.map((review, i) => (
              <div key={review.id}>
                <ReviewRow
                  review={review}
                  currentUserId={currentUserId}
                  onDelete={onDelete}
                />
                {i < reviews.length - 1 && (
                  <div className="mt-8 border-b border-peach-light" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Review form ─────────────────────────────────────────────────────────────

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
      canvas.width = width; canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('failed')), 'image/webp', 0.85)
    }
    img.onerror = reject
    img.src = url
  })
}

function ReviewForm({
  productId,
  onSubmitted,
  onCancel,
}: {
  productId: string
  onSubmitted: (review: Review) => void
  onCancel: () => void
}) {
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

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
    setSubmitting(true); setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const uploadedUrls: string[] = []
    for (const file of images) {
      try {
        const webp = await convertToWebP(file)
        const path = `reviews/${productId}/${user.id}-${Date.now()}.webp`
        const { error: uploadError } = await supabase.storage
          .from('products').upload(path, webp, { contentType: 'image/webp', upsert: false })
        if (!uploadError) {
          const { data } = supabase.storage.from('products').getPublicUrl(path)
          uploadedUrls.push(data.publicUrl)
        }
      } catch {}
    }

    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({ product_id: productId, user_id: user.id, rating, body: body.trim() || null, image_urls: uploadedUrls })
      .select('*, user:users(full_name, avatar_url, email)')
      .single()

    if (insertError) { setError('Failed to submit. Please try again.'); setSubmitting(false); return }

    onSubmitted(review as Review)
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="border border-peach-light rounded-2xl p-6 mb-8 space-y-4">
      <div>
        <p className="text-sm text-brown mb-2">Your rating</p>
        <Stars value={rating} onChange={setRating} />
      </div>
      <div>
        <p className="text-sm text-brown mb-2">Review <span className="text-brown/40">(optional)</span></p>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          placeholder="Share your thoughts..."
          className="w-full bg-white border border-peach-light rounded-xl px-4 py-3 text-sm text-brown placeholder:text-brown/30 outline-none focus:ring-2 focus:ring-peach resize-none"
        />
      </div>
      <div>
        <p className="text-sm text-brown mb-2">Photos <span className="text-brown/40">(up to 4)</span></p>
        <div className="flex gap-2 flex-wrap">
          {previews.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-whitewash">
              <Image src={src} alt="" fill className="object-cover" />
              <button type="button" onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white text-xs">×</button>
            </div>
          ))}
          {previews.length < 4 && (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-peach flex items-center justify-center text-brown/40 hover:border-brown/40 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={submitting}
          className="bg-brown text-whitewash px-6 py-2.5 rounded-full text-sm font-medium hover:bg-brown-light transition-colors disabled:opacity-50">
          {submitting ? 'Submitting…' : 'Submit review'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2.5 rounded-full text-sm font-medium border border-peach-light text-brown hover:bg-whitewash-off transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function ReviewSection({ productId, initialReviews, currentUserId }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [showForm, setShowForm] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [activeCard, setActiveCard] = useState(0)

  const totalReviews = reviews.length
  const avgRating = totalReviews
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0

  const hasReviewed = currentUserId ? reviews.some(r => r.user_id === currentUserId) : false

  // Star breakdown counts
  const breakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }))
  const maxCount = Math.max(...breakdown.map(b => b.count), 1)

  function handleSubmitted(review: Review) {
    setReviews(prev => [review, ...prev])
    setShowForm(false)
    setActiveCard(0)
  }

  function handleDelete(id: string) {
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  return (
    <>
      <div className="mt-16 pt-10 border-t border-peach-light">
        <h2 className="text-2xl font-bold text-brown mb-8">Ratings &amp; Reviews</h2>

        {/* Two-column on md+: left = score+bars, right = buttons+card */}
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-10 md:items-start">

          {/* LEFT — score + bar breakdown */}
          {totalReviews > 0 && (
            <div>
              {/* Big score */}
              <div className="flex items-end gap-2 mb-5">
                <span className="text-8xl font-bold text-brown leading-none">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-xl text-brown-light mb-3">/ 5</span>
              </div>

              {/* Bars */}
              <div className="space-y-2">
                {breakdown.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-3">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                    <span className="text-sm text-brown-light w-3 shrink-0">{star}</span>
                    <div className="flex-1 h-1.5 bg-peach-light/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brown rounded-full transition-all duration-500"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RIGHT — buttons + carousel card (or spans full width on mobile) */}
          <div className="mt-8 md:mt-0">
            {/* Action buttons — right-aligned on md+ */}
            <div className="flex items-center justify-center md:justify-end gap-3 mb-6">
              {currentUserId && !hasReviewed && (
                <button
                  onClick={() => setShowForm(v => !v)}
                  className="flex-1 md:flex-none bg-brown text-whitewash font-medium px-6 py-3 rounded-full hover:bg-brown-light transition-colors text-sm"
                >
                  {showForm ? 'Cancel' : 'Add a review'}
                </button>
              )}
              {totalReviews > 0 && (
                <button
                  onClick={() => setShowAll(true)}
                  className="flex-1 md:flex-none border border-brown text-brown font-medium px-6 py-3 rounded-full hover:bg-brown/5 transition-colors text-sm"
                >
                  View all reviews
                </button>
              )}
            </div>

            {/* Review form */}
            {showForm && (
              <ReviewForm
                productId={productId}
                onSubmitted={handleSubmitted}
                onCancel={() => setShowForm(false)}
              />
            )}

            {/* Single review carousel card */}
            {totalReviews > 0 && (
              <div className="border border-peach-light rounded-2xl p-6">
                <ReviewRow
                  review={reviews[activeCard]}
                  currentUserId={currentUserId}
                  onDelete={handleDelete}
                />
                {totalReviews > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {reviews.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveCard(i)}
                        className={`h-1.5 rounded-full transition-all duration-200 ${
                          i === activeCard ? 'w-6 bg-brown' : 'w-4 bg-peach-light'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {totalReviews === 0 && !showForm && (
              <div className="text-center py-12">
                <p className="text-brown/40 text-sm">No reviews yet. Be the first to review this product.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All reviews modal */}
      {showAll && (
        <AllReviewsModal
          reviews={reviews}
          currentUserId={currentUserId}
          onDelete={handleDelete}
          onClose={() => setShowAll(false)}
        />
      )}
    </>
  )
}
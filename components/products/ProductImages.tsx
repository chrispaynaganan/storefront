'use client'
import { useState } from 'react'
import Image from 'next/image'

interface Props { images: string[]; name?: string }

export function ProductImages({ images, name = '' }: Props) {
  const [active, setActive] = useState(0)
  return (
    <div>
      <div className="relative aspect-square bg-whitewash-off rounded-2xl overflow-hidden mb-3">
        {images[active] && (
          <Image src={images[active]} alt={name} fill className="object-cover" />
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === active ? 'border-brown' : 'border-transparent'}`}>
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

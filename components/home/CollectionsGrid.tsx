import Link from 'next/link'
import Image from 'next/image'
import type { Collection } from '@/types'

interface Props { collections?: Collection[] }

export function CollectionsGrid({ collections = [] }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-2xl font-light text-brown mb-8">Shop by collection</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map(col => (
          <Link key={col.id} href={`/collections/${col.slug}`}
            className="group relative aspect-video bg-whitewash-off rounded-2xl overflow-hidden">
            {col.image_url && (
              <Image src={col.image_url} alt={col.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            )}
            <div className="absolute inset-0 bg-brown/20 group-hover:bg-brown/30 transition-colors" />
            <div className="absolute bottom-6 left-6">
              <p className="text-white text-xl font-medium">{col.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

import Link from 'next/link'
import Image from 'next/image'
import { ProductPrice } from './ProductPrice'
import { ProductBadge } from './ProductBadge'
import { FavoriteButton } from './FavoriteButton'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  favoritedIds?: Set<string>
}

export function ProductCard({ product, favoritedIds }: ProductCardProps) {
  const defaultVariant = product.variants?.[0]
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-[#F2EDE8] rounded-xl overflow-hidden mb-3">
        {product.image_urls[0] && (
          <Image
            src={product.image_urls[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {product.is_bestseller && (
          <div className="absolute top-3 left-3">
            <ProductBadge label="Bestseller" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <FavoriteButton
            productId={product.id}
            initialFavorited={favoritedIds?.has(product.id) ?? false}
            size="sm"
          />
        </div>
      </div>
      <p className="text-sm font-medium text-[#3B1F0E]">{product.name}</p>
      {defaultVariant && (
        <ProductPrice
          price={defaultVariant.price}
          compareAtPrice={defaultVariant.compare_at_price}
        />
      )}
    </Link>
  )
}
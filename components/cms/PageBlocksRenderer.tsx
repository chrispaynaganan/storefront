import Image from 'next/image'
import Link from 'next/link'
import type { Block, ImageBlock, BannerBlock, TwoColumnBlock, SpacerBlock } from '@/types/cms'

// ─────────────────────────────────────────────
// Individual block renderers
// ─────────────────────────────────────────────

function RenderImageBlock({ block }: { block: ImageBlock }) {
  if (!block.image_url) return null
  return (
    <figure className={block.full_width ? 'w-full' : 'max-w-3xl mx-auto'}>
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-whitewash-off">
        <Image
          src={block.image_url}
          alt={block.alt || ''}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
      </div>
      {block.caption && (
        <figcaption className="text-center text-xs text-brown/50 mt-2">
          {block.caption}
        </figcaption>
      )}
    </figure>
  )
}

function RenderBannerBlock({ block }: { block: BannerBlock }) {
  return (
    <div
      className="rounded-2xl px-8 py-12 md:px-16 md:py-16 text-center"
      style={{ backgroundColor: block.background_color || '#FFCBA4' }}
    >
      {block.heading && (
        <h2
          className={`text-3xl md:text-4xl font-semibold mb-3 ${
            block.text_color === 'light' ? 'text-white' : 'text-brown'
          }`}
        >
          {block.heading}
        </h2>
      )}
      {block.subheading && (
        <p
          className={`text-base md:text-lg mb-6 max-w-xl mx-auto ${
            block.text_color === 'light' ? 'text-white/80' : 'text-brown-light'
          }`}
        >
          {block.subheading}
        </p>
      )}
      {block.cta_text && block.cta_url && (
        <Link
          href={block.cta_url}
          className={`inline-block px-6 py-3 rounded-full text-sm font-medium transition-opacity hover:opacity-80 ${
            block.text_color === 'light'
              ? 'bg-white text-brown'
              : 'bg-brown text-whitewash'
          }`}
        >
          {block.cta_text}
        </Link>
      )}
    </div>
  )
}

function RenderTwoColumnBlock({ block }: { block: TwoColumnBlock }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      {(['left', 'right'] as const).map(side => (
        <div key={side}>
          {block[side].image_url && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-whitewash-off mb-5">
              <Image
                src={block[side].image_url!}
                alt={block[side].heading || ''}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          )}
          {block[side].heading && (
            <h3 className="text-xl font-semibold text-brown mb-2">
              {block[side].heading}
            </h3>
          )}
          {block[side].body && (
            <p className="text-brown-light leading-relaxed">{block[side].body}</p>
          )}
        </div>
      ))}
    </div>
  )
}

const SPACER_SIZES = {
  sm: 'h-6',
  md: 'h-12',
  lg: 'h-20',
  xl: 'h-28',
}

function RenderSpacerBlock({ block }: { block: SpacerBlock }) {
  if (block.size === 'sm' || block.size === 'md') {
    return <div className={SPACER_SIZES[block.size]} />
  }
  return (
    <div className={`${SPACER_SIZES[block.size]} flex items-center`}>
      <div className="w-full border-t border-peach-light" />
    </div>
  )
}

// ─────────────────────────────────────────────
// Main block renderer dispatcher
// ─────────────────────────────────────────────

function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'image':      return <RenderImageBlock block={block} />
    case 'banner':     return <RenderBannerBlock block={block} />
    case 'two_column': return <RenderTwoColumnBlock block={block} />
    case 'spacer':     return <RenderSpacerBlock block={block} />
    default:           return null
  }
}

// ─────────────────────────────────────────────
// Page blocks renderer — used by custom [slug] route
// ─────────────────────────────────────────────

export function PageBlocksRenderer({ blocks }: { blocks: Block[] }) {
  if (!blocks?.length) return null
  return (
    <div className="space-y-10">
      {blocks.map(block => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </div>
  )
}
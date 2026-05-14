import { notFound } from 'next/navigation'
import Link from 'next/link'

// Placeholder articles — replace with real CMS or DB content when ready
const ARTICLES: Record<string, { title: string; date: string; category: string; content: string }> = {
  'why-heavyweight-cotton': {
    title: 'Why we use heavyweight cotton',
    date: 'May 2025',
    category: 'Craft',
    content: `Most brands use 160gsm cotton. We use 280gsm. The difference is immediate when you hold both — one feels like a t-shirt, the other feels like a garment.\n\nHeavier cotton holds its shape better over time. It doesn't go see-through after a few washes. It drapes properly on the body instead of clinging in the wrong places.\n\nWe tested lighter fabrics early on. They printed well and were cheaper to produce. But after six months of wear, the difference was obvious. The lighter shirts had faded, stretched out, and lost their structure.\n\nThe 280gsm shirts still looked like the day they were bought.\n\nThis is placeholder content. Replace with the real article when ready.`,
  },
  'building-a-repeat-wear-wardrobe': {
    title: 'Building a repeat-wear wardrobe',
    date: 'April 2025',
    category: 'Style',
    content: `The pieces you reach for again and again have something in common. It's not trend. It's not price. It's fit and feel.\n\nA repeat-wear piece fits your body correctly, feels good against your skin, and works across multiple contexts. You don't have to think about it — you just reach for it.\n\nThis is placeholder content. Replace with the real article when ready.`,
  },
  'known-and-worn-story': {
    title: 'How Known & Worn started',
    date: 'March 2025',
    category: 'Brand',
    content: `Known & Worn started in the Philippines with a simple idea: build clothes that people actually wear — not just buy.\n\nThe name came from thinking about identity and expression. Known is how others see you. Worn is how you show up every day. The two are more connected than most people think.\n\nThis is placeholder content. Replace with the real article when ready.`,
  },
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const article = ARTICLES[slug]
  if (!article) return {}
  return { title: `${article.title} — Known & Worn` }
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params
  const article = ARTICLES[slug]
  if (!article) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <Link
        href="/journal"
        className="text-xs text-brown-light uppercase tracking-widest hover:text-brown transition-colors mb-8 inline-block"
      >
        ← Journal
      </Link>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-brown-light uppercase tracking-widest">{article.category}</span>
        <span className="text-brown/20">·</span>
        <span className="text-xs text-brown-light">{article.date}</span>
      </div>

      <h1 className="text-4xl font-light text-brown leading-tight mb-10">
        {article.title}
      </h1>

      {/* TODO: Replace with real rich text / MDX content */}
      <div className="space-y-5">
        {article.content.split('\n\n').map((para, i) => (
          <p key={i} className="text-brown-light leading-relaxed text-base">
            {para}
          </p>
        ))}
      </div>

      <div className="border-t border-peach-light pt-10 mt-12">
        <Link
          href="/journal"
          className="text-sm text-brown underline hover:text-brown-light transition-colors"
        >
          ← Back to Journal
        </Link>
      </div>
    </div>
  )
}
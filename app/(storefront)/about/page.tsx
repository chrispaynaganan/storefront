import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About — Known & Worn',
  description: 'Known & Worn is built for everyday expression. Pieces you reach for without thinking, but still say exactly who you are.',
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">

      <p className="text-xs text-brown-light uppercase tracking-widest mb-4">About</p>
      <h1 className="text-4xl font-light text-brown leading-tight mb-6">
        What you wear says something.<br />Make it count.
      </h1>
      <p className="text-brown-light leading-relaxed mb-10">
        Known & Worn is built for everyday expression. Pieces you reach for without thinking, but still say exactly who you are.
      </p>

      <div className="border-t border-peach-light pt-10 mb-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">The name</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-lg font-medium text-brown mb-2">Known</p>
            <p className="text-sm text-brown-light leading-relaxed">
              Identity. How people see you — your presence, your character, the impression you leave.
            </p>
          </div>
          <div>
            <p className="text-lg font-medium text-brown mb-2">Worn</p>
            <p className="text-sm text-brown-light leading-relaxed">
              Expression. How you show up every day — what you put on, what feels right, what feels like you.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-peach-light pt-10 mb-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">What we make</h2>
        <p className="text-brown-light leading-relaxed mb-4">
          Clean, expressive streetwear. Minimal but intentional. Not loud for the sake of it, not basic for the sake of it.
        </p>
        <p className="text-brown-light leading-relaxed">
          We build pieces for repeat wear — clothes that hold up, that fit into your life, and that still feel deliberate every time you reach for them.
        </p>
      </div>

      <div className="border-t border-peach-light pt-10">
        <p className="text-sm text-brown-light mb-6">
          Questions, feedback, or just want to talk — we're easy to reach.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-brown text-whitewash text-sm font-medium rounded-full px-8 py-3 hover:bg-brown-light transition-colors"
        >
          Get in touch
        </Link>
      </div>

    </div>
  )
}
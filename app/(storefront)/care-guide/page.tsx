import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Care Guide — Known & Worn' }

const CARE_STEPS = [
  {
    label: 'Washing',
    items: [
      'Machine wash cold (30°C / 86°F)',
      'Wash inside out to protect prints and colors',
      'Use a gentle cycle',
      'Use mild detergent — no bleach',
      'Wash with similar colors',
    ],
  },
  {
    label: 'Drying',
    items: [
      'Air dry flat or hang dry where possible',
      'Tumble dry on low heat if needed',
      'Do not wring or twist',
      'Keep away from direct sunlight when drying to preserve color',
    ],
  },
  {
    label: 'Ironing',
    items: [
      'Iron inside out on medium heat',
      'Do not iron directly over printed graphics or embroidery',
      'Steam is fine — direct iron on prints is not',
    ],
  },
  {
    label: 'Storage',
    items: [
      'Fold hoodies rather than hanging to maintain shape',
      'Store in a cool, dry place',
      'Avoid overpacking — compressed fabric loses shape over time',
    ],
  },
]

export default function CareGuidePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="text-xs text-brown-light uppercase tracking-widest mb-4">Care</p>
      <h1 className="text-4xl font-light text-brown mb-6">Care Guide</h1>
      <p className="text-brown-light leading-relaxed mb-12">
        Good clothes last longer when you treat them right. Here's how to keep your Known & Worn pieces looking their best.
      </p>

      <div className="space-y-10">
        {CARE_STEPS.map(({ label, items }) => (
          <section key={label}>
            <h2 className="text-xs text-brown-light uppercase tracking-widest mb-5">{label}</h2>
            <ul className="space-y-3">
              {items.map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-brown-light">
                  <span className="w-1 h-1 rounded-full bg-brown-light shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="border-t border-peach-light pt-10 mt-12">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-4">The short version</h2>
        <div className="bg-whitewash-off rounded-xl p-5 text-sm text-brown-light leading-relaxed">
          Cold wash. Inside out. Air dry. Don't bleach. That's it.
        </div>
      </div>
    </div>
  )
}
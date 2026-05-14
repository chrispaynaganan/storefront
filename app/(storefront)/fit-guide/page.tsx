import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Fit Guide — Known & Worn' }

const MEASUREMENTS = [
  { size: 'XS', chest: '34–36', waist: '28–30', hip: '34–36', length: '26' },
  { size: 'S',  chest: '36–38', waist: '30–32', hip: '36–38', length: '27' },
  { size: 'M',  chest: '38–40', waist: '32–34', hip: '38–40', length: '28' },
  { size: 'L',  chest: '40–42', waist: '34–36', hip: '40–42', length: '29' },
  { size: 'XL', chest: '42–44', waist: '36–38', hip: '42–44', length: '30' },
  { size: 'XXL',chest: '44–46', waist: '38–40', hip: '44–46', length: '31' },
]

export default function FitGuidePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="text-xs text-brown-light uppercase tracking-widest mb-4">Sizing</p>
      <h1 className="text-4xl font-light text-brown mb-6">Fit Guide</h1>
      <p className="text-brown-light leading-relaxed mb-12">
        Our pieces are designed with a relaxed, oversized fit. If you prefer a more fitted look, size down. All measurements are in inches.
      </p>

      <section className="mb-12">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">How to measure</h2>
        <div className="space-y-4 text-sm text-brown-light leading-relaxed">
          <div className="flex gap-4">
            <span className="w-20 text-brown font-medium shrink-0">Chest</span>
            <span>Measure around the fullest part of your chest, keeping the tape horizontal.</span>
          </div>
          <div className="flex gap-4">
            <span className="w-20 text-brown font-medium shrink-0">Waist</span>
            <span>Measure around your natural waistline, just above the hip bone.</span>
          </div>
          <div className="flex gap-4">
            <span className="w-20 text-brown font-medium shrink-0">Hip</span>
            <span>Measure around the fullest part of your hips and seat.</span>
          </div>
          <div className="flex gap-4">
            <span className="w-20 text-brown font-medium shrink-0">Length</span>
            <span>Measured from the highest point of the shoulder to the hem.</span>
          </div>
        </div>
      </section>

      <section className="mb-12 border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Size chart — shirts & hoodies</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-peach-light">
                {['Size', 'Chest', 'Waist', 'Hip', 'Length'].map(h => (
                  <th key={h} className="py-3 text-left text-xs font-medium text-brown/50 uppercase tracking-wide pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEASUREMENTS.map((row, i) => (
                <tr key={row.size} className={`border-b border-peach-light/50 ${i % 2 === 0 ? '' : 'bg-whitewash-off'}`}>
                  <td className="py-3 font-medium text-brown pr-6">{row.size}</td>
                  <td className="py-3 text-brown-light pr-6">{row.chest}"</td>
                  <td className="py-3 text-brown-light pr-6">{row.waist}"</td>
                  <td className="py-3 text-brown-light pr-6">{row.hip}"</td>
                  <td className="py-3 text-brown-light">{row.length}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-4">Still unsure?</h2>
        <p className="text-sm text-brown-light leading-relaxed">
          We offer a free size exchange on your first order. If your size isn't right, we'll sort it out — no hassle.
        </p>
      </section>
    </div>
  )
}
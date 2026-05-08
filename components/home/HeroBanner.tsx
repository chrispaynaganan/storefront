import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function HeroBanner() {
  return (
    <section className="relative min-h-[90vh] bg-[#F2EDE8] overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #FFCBA4 0%, transparent 60%)' }} />

      <div className="relative max-w-7xl mx-auto px-6 h-full min-h-[90vh] flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full py-20">

          {/* Left — text */}
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-[#6B3A22] uppercase mb-6">
              New collection — 2026
            </p>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-light text-[#3B1F0E] leading-[1.05] mb-6">
              Wear<br />
              what<br />
              <em className="not-italic text-[#6B3A22]">feels</em><br />
              right
            </h1>
            <p className="text-[#6B3A22] text-lg max-w-sm mb-10 leading-relaxed">
              Premium hoodies and shirts crafted for everyday comfort. Made in the Philippines.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/products">
                <Button size="lg" className="bg-[#3B1F0E] text-white hover:bg-[#6B3A22] px-8 py-4 text-base rounded-full">
                  Shop now
                </Button>
              </Link>
              <Link href="/collections/hoodies">
                <Button size="lg" variant="outline"
                  className="border-[#3B1F0E] text-[#3B1F0E] hover:bg-[#FFCBA4]/30 px-8 py-4 text-base rounded-full">
                  View hoodies
                </Button>
              </Link>
            </div>
          </div>

          {/* Right — hero image area */}
          <div className="relative hidden md:flex items-center justify-center">
            <div className="relative w-full aspect-[3/4] max-w-sm mx-auto">
              {/* Decorative circle */}
              <div className="absolute inset-0 rounded-[40%_60%_60%_40%/40%_40%_60%_60%] bg-[#FFCBA4]/40" />
              {/* Inner card */}
              <div className="absolute inset-6 rounded-[35%_55%_55%_35%/35%_35%_55%_55%] bg-[#FFCBA4]/60 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-[#3B1F0E]/40 text-sm">Add hero image</p>
                  <p className="text-[#3B1F0E]/30 text-xs mt-1">Recommended: 600×800px</p>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-5 py-3 shadow-lg">
                <p className="text-xs text-[#6B3A22]">Free shipping</p>
                <p className="text-sm font-medium text-[#3B1F0E]">Orders over ₱2,000</p>
              </div>
              {/* Floating tag */}
              <div className="absolute -top-2 -right-2 bg-[#3B1F0E] text-white rounded-2xl px-4 py-2 shadow-lg">
                <p className="text-xs">New drop</p>
                <p className="text-sm font-medium">SS 2026</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#6B3A22]/50">
        <p className="text-xs tracking-widest uppercase">Scroll</p>
        <div className="w-px h-8 bg-[#6B3A22]/30" />
      </div>
    </section>
  )
}

import React from 'react'
import Link from 'next/link'
import { ThreeRoll } from '@/components/ThreeRoll'
import { ProductCard } from '@/components/ProductCard'
import { prisma } from '@/lib/db'
import { Flame, Clock, Award, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'

export const revalidate = 60

async function getLandingData() {
  const featured = await prisma.product.findMany({
    where: { isAvailable: true, isFeatured: true },
    include: { addons: true },
    take: 6,
  })

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  return { featured, categories }
}

export default async function HomePage() {
  const { featured, categories } = await getLandingData()

  return (
    <div className="space-y-20 pb-20">
      
      <section className="relative bg-gradient-to-b from-[#22092C] via-[#351044] to-[#22092C] text-white pt-12 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#872341]/60 border border-[#BE3144]/40 text-[#F05941] text-xs font-black uppercase tracking-widest shadow-inner">
                <Sparkles className="w-4 h-4" /> The Roll Revolution Is Here
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                CRAVE THE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F05941] via-[#BE3144] to-[#F5F1EF]">
                  EXTRAORDINARY.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#F5F1EF]/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Slow-marinated charcoal tikkas, golden multi-layered parathas, and secret chef sauces. Made fresh to order and delivered piping hot in under 30 minutes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/menu"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white font-black text-sm uppercase tracking-wider shadow-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/menu?bestseller=true"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-sm uppercase tracking-wider border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2"
                >
                  <Flame className="w-4 h-4 text-[#F05941]" />
                  <span>View Bestsellers</span>
                </Link>
              </div>

              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/10 text-center lg:text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-[#F05941]">30m</p>
                  <p className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">Lightning Delivery</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-[#F05941]">4.9★</p>
                  <p className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">10,000+ Reviews</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-[#F05941]">100%</p>
                  <p className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">Fresh Ingredients</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-gradient-to-b from-white/10 to-transparent p-4 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl">
                <ThreeRoll />
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#BE3144]">Categories</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#22092C]">Curated for Every Craving</h2>
          </div>
          <Link href="/menu" className="text-xs font-bold text-[#BE3144] hover:underline flex items-center gap-1">
            All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/menu?category=${cat.id}`}
              className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-sm hover:shadow-xl hover:border-[#BE3144] transition-all text-center group flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden mb-3 bg-neutral-100 shadow-inner">
                <img
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h4 className="text-xs font-black text-[#22092C] group-hover:text-[#BE3144] transition-colors line-clamp-1">
                {cat.name}
              </h4>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#BE3144]">Chef's Picks</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#22092C]">Signature Rolls & Bites</h2>
          </div>
          <Link href="/menu" className="text-xs font-bold text-[#BE3144] hover:underline flex items-center gap-1">
            Explore Full Menu <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((prod) => (
            <ProductCard key={prod.id} product={prod as any} />
          ))}
        </div>
      </section>

      <section id="story" className="bg-[#22092C] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#F05941]">The RockinRoll Standard</span>
            <h2 className="text-3xl font-black mt-1">Why Foodies Love Us</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#BE3144] flex items-center justify-center mx-auto text-white shadow-lg">
                <Flame className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold">Charcoal Smoked</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Real tandoor charring with 24-hour spice marinades for that unmatched authentic Mughlai & street aroma.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#F05941] flex items-center justify-center mx-auto text-white shadow-lg">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold">Midnight Delivery</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Hungry at 2 AM? We keep our stoves fired up until 3:00 AM daily with thermally insulated hot delivery boxes.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#872341] flex items-center justify-center mx-auto text-white shadow-lg">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold">Safe & Cashfree Powered</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Instant UPI, Cards, and NetBanking checkout powered by Cashfree Payments with bank-grade 256-bit encryption.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

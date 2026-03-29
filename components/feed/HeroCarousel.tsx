'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Idea } from '@/types'
import { cn, getFormatLabel, getNicheEmoji } from '@/lib/utils'

interface HeroCarouselProps {
  ideas: Idea[]
}

export function HeroCarousel({ ideas }: HeroCarouselProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (ideas.length <= 1) return
    const timer = setInterval(() => setCurrentIndex((p) => (p + 1) % ideas.length), 5000)
    return () => clearInterval(timer)
  }, [ideas.length])

  if (!ideas.length) return null

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % ideas.length)
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + ideas.length) % ideas.length)

  return (
    <div className="relative w-full h-[400px] md:h-[480px] flex items-center justify-center overflow-hidden perspective-[1200px] mb-8 lg:mb-12 mt-4 rounded-[40px] px-4">
      
      {/* Decorative ambient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none rounded-[40px] border border-white/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-accent/20 blur-[120px] pointer-events-none rounded-full" />

      {ideas.map((idea, index) => {
        const offset = index - currentIndex
        // Wrap offset math for clean infinite looping on 3+ cards
        const half = Math.floor(ideas.length / 2)
        let wrappedOffset = offset
        if (Math.abs(offset) > half) {
          wrappedOffset = offset < 0 ? offset + ideas.length : offset - ideas.length
        }

        const isCenter = wrappedOffset === 0
        const isNext = wrappedOffset === 1
        const isPrev = wrappedOffset === -1

        if (Math.abs(wrappedOffset) > 2) return null

        // 3D Matrix Mathematics
        const xPos = wrappedOffset * 55 // % offset, negative for left, positive for right
        const zPos = isCenter ? 0 : -300
        const scale = isCenter ? 1 : 0.8
        const rotateY = wrappedOffset * -20 // Cards tilt inwards toward the center
        const opacity = isCenter ? 1 : Math.abs(wrappedOffset) === 1 ? 0.4 : 0
        const zIndex = isCenter ? 30 : 20 - Math.abs(wrappedOffset)

        return (
          <motion.div
            key={idea.id}
            initial={false}
            animate={{
              x: `${xPos}%`,
              z: zPos,
              scale: scale,
              rotateY: rotateY,
              opacity: opacity,
              zIndex: zIndex,
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 180, mass: 1 }}
            onClick={() => {
              if (isCenter) router.push(`/dashboard/idea/${idea.id}`)
              else if (isNext) handleNext()
              else if (isPrev) handlePrev()
            }}
            className={cn(
              "absolute w-full max-w-sm md:max-w-3xl h-[320px] md:h-[400px] rounded-[32px] cursor-pointer",
              "border border-white/10 glass-panel overflow-hidden flex flex-col justify-end p-6 md:p-10",
              isCenter ? "shadow-[0_0_100px_rgba(124,106,245,0.3)] ring-1 ring-[#7c6af5]/50" : "hover:border-white/20"
            )}
            style={{ 
              transformStyle: 'preserve-3d', 
              backgroundImage: `linear-gradient(to top, rgba(10,10,15,0.98) 0%, rgba(10,10,15,0.6) 50%, rgba(10,10,15,0) 100%)`
            }}
          >
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent opacity-50 pointer-events-none" />
            
            <div className={cn("relative z-10 transition-all duration-500", isCenter ? "translate-y-0" : "translate-y-6")}>
              
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-5">
                <motion.span 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={isCenter ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
                  className="px-3 md:px-4 py-1.5 bg-gradient-to-r from-[#7c6af5] to-[#ec4899] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(124,106,245,0.6)] flex items-center gap-1.5"
                >
                  <span className="text-lg leading-none">🔥</span> #1 Trending Match
                </motion.span>
                <span className="text-emerald-400 font-bold text-xs md:text-sm bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 backdrop-blur-md">
                  {idea.viral_score} Viral Score
                </span>
                <span className="text-amber-400 font-bold text-xs md:text-sm bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 backdrop-blur-md hidden md:flex">
                  High Demand
                </span>
              </div>
              
              {/* Content */}
              <h2 className="text-2xl md:text-4xl font-black text-white leading-[1.15] mb-3 md:mb-4 line-clamp-2 md:line-clamp-3">
                {idea.title}
              </h2>
              
              <p className="text-slate-300 text-sm md:text-base line-clamp-2 mb-6 md:mb-8 max-w-2xl font-medium border-l-[3px] border-accent/60 pl-4 italic">
                "{idea.hook_preview}"
              </p>
              
              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs md:text-sm font-semibold text-slate-400">
                  {idea.recommended_format && (
                    <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                      <Play size={14} className="text-white"/> {getFormatLabel(idea.recommended_format)}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    {getNicheEmoji(idea.niche)} <span className="capitalize">{idea.sub_niche || idea.niche}</span>
                  </span>
                </div>
                
                {isCenter && (
                  <motion.button 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="btn-primary py-2.5 md:py-3 px-6 md:px-8 rounded-xl md:rounded-2xl shadow-[0_0_30px_rgba(124,106,245,0.5)] font-bold tracking-wide"
                  >
                    Open Studio
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}

      {/* Navigation Controls */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 md:gap-6 z-40">
        <button onClick={handlePrev} className="p-2.5 md:p-3 rounded-full bg-black/40 border border-white/10 hover:bg-white/10 hover:scale-105 text-white backdrop-blur-xl transition-all shadow-xl">
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-2.5 bg-black/40 px-4 py-2.5 rounded-full backdrop-blur-xl border border-white/5">
          {ideas.map((_, i) => (
            <div key={i} className={cn("h-1.5 md:h-2 rounded-full transition-all duration-500", i === currentIndex ? "w-8 md:w-10 bg-gradient-to-r from-[#7c6af5] to-[#ec4899] shadow-[0_0_10px_rgba(124,106,245,0.8)]" : "w-2 md:w-2.5 bg-white/20")} />
          ))}
        </div>
        <button onClick={handleNext} className="p-2.5 md:p-3 rounded-full bg-black/40 border border-white/10 hover:bg-white/10 hover:scale-105 text-white backdrop-blur-xl transition-all shadow-xl">
          <ChevronRight size={18} />
        </button>
      </div>

    </div>
  )
}

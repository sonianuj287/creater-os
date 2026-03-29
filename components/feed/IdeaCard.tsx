'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Clock, TrendingUp, Zap, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Idea } from '@/types'
import {
  cn,
  formatNumber,
  getViralScoreColor,
  getPlatformColor,
  getFormatLabel,
  getDifficultyColor,
  getNicheEmoji,
} from '@/lib/utils'

interface IdeaCardProps {
  idea: Idea
  index?: number
  size?: 'standard' | 'wide' | 'tall' | 'featured'
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: 'IG',
  youtube: 'YT',
  tiktok: 'TK',
  twitter: 'X',
  linkedin: 'LI',
}

export function IdeaCard({ idea, index = 0, size = 'standard' }: IdeaCardProps) {
  const router = useRouter()

  const scoreColor =
    idea.viral_score >= 85
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
      : idea.viral_score >= 70
      ? 'text-amber-400 border-amber-500/40 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
      : 'text-slate-400 border-slate-500/40 bg-slate-500/10 shadow-[0_0_15px_rgba(148,163,184,0.1)]'

  const sizeStyles = {
    standard: 'col-span-1',
    wide: 'col-span-1 md:col-span-2',
    tall: 'col-span-1 row-span-2',
    featured: 'col-span-1 md:col-span-2 row-span-2 md:h-[420px]',
  }

  const isLarge = size === 'wide' || size === 'featured'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => router.push(`/dashboard/idea/${idea.id}`)}
      className={cn(
        "group relative bg-surface/80 backdrop-blur-xl border border-white/10 rounded-[24px] overflow-hidden cursor-pointer",
        "transition-all duration-300 hover:border-white/25 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]",
        "flex flex-col",
        sizeStyles[size]
      )}
    >
      {/* Decorative gradient orb inside card (very subtle) */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-accent/20 transition-colors" />

      {/* Internal Content Frame */}
      <div className={cn("p-6 flex flex-col h-full z-10", isLarge ? "gap-6" : "gap-4")}>
        
        {/* Top row: niche + viral score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 min-w-0">
            <span className={cn("leading-none flex-shrink-0 drop-shadow-md", isLarge ? "text-3xl" : "text-xl")}>
              {getNicheEmoji(idea.niche)}
            </span>
            <span className={cn("text-slate-400 capitalize tracking-wide font-medium", isLarge ? "text-sm" : "text-xs truncate")}>
              {idea.sub_niche ?? idea.niche}
            </span>
          </div>

          {/* Viral score badge */}
          <div className={cn('score-ring flex-shrink-0 relative overflow-hidden', scoreColor, isLarge ? "scale-110 origin-top-right" : "")}>
            <div className="absolute inset-0 bg-white/20 blur-sm translate-y-full group-hover:translate-y-[-100%] transition-transform duration-700 ease-in-out pointer-events-none" />
            <span className="relative z-10 font-bold">{idea.viral_score}</span>
          </div>
        </div>

        {/* Title */}
        <div className={cn("mt-auto", isLarge ? "mt-4" : "")}>
          <h3 className={cn("font-bold text-white leading-tight group-hover:text-accent-2 transition-colors", 
            isLarge ? "text-2xl md:text-3xl line-clamp-3" : "text-[17px] line-clamp-2"
          )}>
            {idea.title}
          </h3>
        </div>

        {/* Dynamic content area based on size */}
        {size === 'featured' && idea.description && (
          <p className="text-slate-400 text-sm md:text-base leading-relaxed line-clamp-2">
            {idea.description}
          </p>
        )}

        {/* Hook preview */}
        {idea.hook_preview && (
          <blockquote className={cn("italic border-l-[3px] border-accent/40 pl-4 leading-relaxed", 
            isLarge ? "text-sm md:text-base text-slate-300 line-clamp-3" : "text-xs text-slate-400 line-clamp-2"
          )}>
            "{idea.hook_preview}"
          </blockquote>
        )}

        {/* Trending reason */}
        {idea.trending_reason && (
          <div className="flex items-center gap-2 text-emerald-400/90 font-medium">
            <TrendingUp size={isLarge ? 14 : 12} className="flex-shrink-0" />
            <span className={cn("truncate", isLarge ? "text-sm" : "text-xs")}>{idea.trending_reason}</span>
          </div>
        )}

        {/* Spacer for bottom pinning */}
        <div className="flex-grow" />

        <div className="pt-2">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-slate-500 mb-4 font-medium">
            <span className={cn("flex items-center gap-1.5", isLarge ? "text-sm" : "text-xs")}>
              <Clock size={isLarge ? 14 : 12} />
              {idea.estimated_minutes}m
            </span>
            <span className={cn('capitalize flex items-center gap-1.5', getDifficultyColor(idea.difficulty), isLarge ? "text-sm" : "text-xs")}>
              <div className={cn("w-1.5 h-1.5 rounded-full", idea.difficulty === 'easy' ? 'bg-emerald-500' : idea.difficulty === 'medium' ? 'bg-amber-500' : 'bg-rose-500')} />
              {idea.difficulty}
            </span>
            {idea.recommended_format && (
              <span className={cn("flex items-center gap-1.5", isLarge ? "text-sm" : "text-xs")}>
                <Zap size={isLarge ? 14 : 12} />
                {getFormatLabel(idea.recommended_format)}
              </span>
            )}
            {idea.similar_views_avg && (
              <span className={cn("ml-auto text-slate-400 flex items-center gap-1", isLarge ? "text-sm" : "text-xs")}>
                <Sparkles size={isLarge ? 12 : 10} className="text-accent" />
                ~{formatNumber(idea.similar_views_avg)} avg
              </span>
            )}
          </div>

          {/* Platform pills */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <div className="flex gap-2 flex-wrap">
              {idea.platforms.map((p) => (
                <span
                  key={p}
                  className={cn('pill font-bold shadow-sm', getPlatformColor(p), isLarge ? "text-xs px-3 py-1" : "text-[10px] px-2 py-0.5")}
                >
                  {PLATFORM_ICONS[p]}
                </span>
              ))}
            </div>

            {/* CTA arrow */}
            <div className="opacity-0 translate-x-[-10px] group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1.5 font-bold text-accent">
              <span className={isLarge ? "text-sm" : "text-xs"}>Launch Studio</span>
              <ArrowRight size={isLarge ? 16 : 14} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Clock, TrendingUp, Zap } from 'lucide-react'
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
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: 'IG',
  youtube: 'YT',
  tiktok: 'TK',
  twitter: 'X',
  linkedin: 'LI',
}

export function IdeaCard({ idea, index = 0 }: IdeaCardProps) {
  const router = useRouter()

  const scoreColor =
    idea.viral_score >= 85
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
      : idea.viral_score >= 70
      ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
      : 'text-slate-400 border-slate-500/40 bg-slate-500/10'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => router.push(`/dashboard/idea/${idea.id}`)}
      className="group relative bg-surface border border-border rounded-2xl p-5 cursor-pointer
                 hover:border-white/15 hover:bg-surface-2 transition-all duration-200
                 flex flex-col gap-4"
    >
      {/* Top row: niche + viral score */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl leading-none flex-shrink-0">
            {getNicheEmoji(idea.niche)}
          </span>
          <span className="text-xs text-slate-500 capitalize truncate">
            {idea.sub_niche ?? idea.niche}
          </span>
        </div>

        {/* Viral score badge */}
        <div className={cn('score-ring flex-shrink-0', scoreColor)}>
          {idea.viral_score}
        </div>
      </div>

      {/* Title */}
      <div>
        <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-accent-2 transition-colors line-clamp-2">
          {idea.title}
        </h3>
      </div>

      {/* Hook preview */}
      {idea.hook_preview && (
        <blockquote className="text-xs text-slate-400 italic border-l-2 border-accent/40 pl-3 leading-relaxed line-clamp-2">
          {idea.hook_preview}
        </blockquote>
      )}

      {/* Trending reason */}
      {idea.trending_reason && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400/80">
          <TrendingUp size={11} className="flex-shrink-0" />
          <span className="truncate">{idea.trending_reason}</span>
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {idea.estimated_minutes}min
        </span>
        <span className={cn('capitalize', getDifficultyColor(idea.difficulty))}>
          {idea.difficulty}
        </span>
        {idea.recommended_format && (
          <span className="flex items-center gap-1 text-slate-500">
            <Zap size={11} />
            {getFormatLabel(idea.recommended_format)}
          </span>
        )}
        {idea.similar_views_avg && (
          <span className="ml-auto text-slate-600">
            ~{formatNumber(idea.similar_views_avg)} avg
          </span>
        )}
      </div>

      {/* Platform pills */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {idea.platforms.map((p) => (
            <span
              key={p}
              className={cn('pill text-[10px]', getPlatformColor(p))}
            >
              {PLATFORM_ICONS[p]}
            </span>
          ))}
        </div>

        {/* CTA arrow */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-accent">
          <span>Open</span>
          <ArrowRight size={12} />
        </div>
      </div>
    </motion.div>
  )
}

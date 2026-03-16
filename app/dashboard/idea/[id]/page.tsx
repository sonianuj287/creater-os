'use client'

import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, TrendingUp, Clock, Zap, Target,
  FileText, Film, Lightbulb, Lock, ArrowRight
} from 'lucide-react'
import { MOCK_IDEAS } from '@/lib/mock-data'
import {
  cn, formatNumber, getViralScoreColor, getPlatformColor,
  getFormatLabel, getDifficultyColor, getNicheEmoji
} from '@/lib/utils'

const PLATFORM_NAMES: Record<string, string> = {
  instagram: 'Instagram', youtube: 'YouTube',
  tiktok: 'TikTok', twitter: 'Twitter / X', linkedin: 'LinkedIn'
}

export default function IdeaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const idea = MOCK_IDEAS.find((i) => i.id === params.id)

  if (!idea) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-3">Idea not found</p>
          <button onClick={() => router.back()} className="btn-outline">Go back</button>
        </div>
      </div>
    )
  }

  const scoreColor = idea.viral_score >= 85
    ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
    : idea.viral_score >= 70
    ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
    : 'text-slate-400 border-slate-500/40 bg-slate-500/10'

  return (
    <div className="min-h-screen bg-canvas">
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back to feed
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main */}
          <div className="space-y-5">
            {/* Header card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-surface border border-border rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{getNicheEmoji(idea.niche)}</span>
                  <div>
                    <span className="text-xs text-slate-500 capitalize">{idea.sub_niche ?? idea.niche}</span>
                    {idea.recommended_format && (
                      <span className="ml-2 text-xs text-slate-600">
                        · {getFormatLabel(idea.recommended_format)}
                      </span>
                    )}
                  </div>
                </div>
                <div className={cn('score-ring flex-shrink-0', scoreColor)}>
                  {idea.viral_score}
                </div>
              </div>

              <h1 className="text-xl font-bold text-white leading-snug mb-3">
                {idea.title}
              </h1>

              {idea.description && (
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  {idea.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} /> {idea.estimated_minutes} min to make
                </span>
                <span className={cn('capitalize font-medium', getDifficultyColor(idea.difficulty))}>
                  {idea.difficulty}
                </span>
                {idea.similar_views_avg && (
                  <span className="flex items-center gap-1.5">
                    <TrendingUp size={12} /> ~{formatNumber(idea.similar_views_avg)} avg views
                  </span>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {idea.platforms.map((p) => (
                  <span key={p} className={cn('pill text-xs', getPlatformColor(p))}>
                    {PLATFORM_NAMES[p]}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Hook preview */}
            {idea.hook_preview && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="bg-surface border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} className="text-accent" />
                  <h2 className="text-sm font-semibold text-white">Sample hook</h2>
                </div>
                <blockquote className="text-sm text-slate-300 italic border-l-2 border-accent/40 pl-4 leading-relaxed">
                  {idea.hook_preview}
                </blockquote>
                <p className="text-xs text-slate-600 mt-3">
                  AI will generate 3 hook variations tailored to your style in Phase 2.
                </p>
              </motion.div>
            )}

            {/* AI Features — locked for free */}
            {[
              { icon: FileText, title: 'Full script outline', desc: 'Hook → context → main points → CTA, all written for you.' },
              { icon: Film, title: 'Shot list', desc: 'Exact sequence of what to film, B-roll suggestions included.' },
              { icon: Target, title: 'Thumbnail brief', desc: 'Text, colours, and composition brief for a scroll-stopping thumbnail.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 + i * 0.06 }}
                className="relative bg-surface border border-border rounded-2xl p-6 overflow-hidden"
              >
                {/* Locked overlay */}
                <div className="absolute inset-0 bg-canvas/60 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-2xl">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-accent/20 border border-accent/30 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Lock size={13} className="text-accent" />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Upgrade to unlock</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 opacity-30">
                  <item.icon size={14} className="text-accent" />
                  <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                </div>
                <div className="space-y-2 opacity-30">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-3 bg-white/10 rounded-md w-full" />
                  ))}
                  <div className="h-3 bg-white/10 rounded-md w-3/4" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-accent/10 border border-accent/30 rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={14} className="text-accent" />
                <span className="text-sm font-semibold text-white">Start this idea</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Create a project from this idea. We'll guide you through scripting, filming, and editing.
              </p>
              <button className="btn-primary w-full flex items-center justify-center gap-2 text-xs py-3">
                Create project
                <ArrowRight size={13} />
              </button>
              <p className="text-[10px] text-slate-600 text-center mt-2">
                Free plan: 2 projects / month
              </p>
            </motion.div>

            {/* Trending data */}
            {idea.trending_reason && (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 }}
                className="bg-surface border border-border rounded-2xl p-4"
              >
                <p className="section-label mb-3">Why it's trending</p>
                <div className="flex items-start gap-2">
                  <TrendingUp size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {idea.trending_reason}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Similar content performance */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.34 }}
              className="bg-surface border border-border rounded-2xl p-4 space-y-3"
            >
              <p className="section-label">Similar content</p>
              {[
                { label: 'Avg views', value: formatNumber(idea.similar_views_avg ?? 0) },
                { label: 'Viral score', value: `${idea.viral_score}/100` },
                { label: 'Difficulty', value: idea.difficulty },
                { label: 'Est. time', value: `${idea.estimated_minutes} min` },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{s.label}</span>
                  <span className="text-white font-medium capitalize">{s.value}</span>
                </div>
              ))}
            </motion.div>

            {/* Competitor preview placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative bg-surface border border-border rounded-2xl p-4 overflow-hidden"
            >
              <div className="absolute inset-0 bg-canvas/60 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-2xl">
                <div className="text-center">
                  <Lock size={13} className="text-accent mx-auto mb-1.5" />
                  <p className="text-xs text-slate-400">Pro feature</p>
                </div>
              </div>
              <p className="section-label mb-3 opacity-30">Competitor examples</p>
              <div className="space-y-2 opacity-20">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-12 h-8 bg-white/10 rounded flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2 bg-white/10 rounded w-full" />
                      <div className="h-2 bg-white/10 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

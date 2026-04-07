'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  ArrowLeft, TrendingUp, Clock, Zap, Target,
  FileText, Film, Lightbulb, ArrowRight, Loader2
} from 'lucide-react'
import { MOCK_IDEAS } from '@/lib/mock-data'
import { createClient } from '@/lib/supabase'
import {
  cn, formatNumber, getPlatformColor,
  getFormatLabel, getDifficultyColor, getNicheEmoji
} from '@/lib/utils'

const PLATFORM_NAMES: Record<string, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok', twitter: 'Twitter / X', linkedin: 'LinkedIn'
}

export default function IdeaDetailPage() {
  const params       = useParams()
  const router       = useRouter()
  const [idea, setIdea]     = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIdea()
  }, [params.id])

  async function loadIdea() {
    // 1. Check mock data first
    const mock = MOCK_IDEAS.find(i => i.id === params.id)
    if (mock) { setIdea(mock); setLoading(false); return }

    // 2. Try Supabase
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', params.id)
        .single()
      if (data) { setIdea(data); setLoading(false); return }
    } catch {}

    // 3. Not found
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-slate-600" />
      </div>
    )
  }

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

  const scoreColor = (idea.viral_score ?? 0) >= 85
    ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
    : (idea.viral_score ?? 0) >= 70
    ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
    : 'text-slate-400 border-slate-500/40 bg-slate-500/10'

  return (
    <div className="min-h-screen bg-canvas">
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">

        <motion.button
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={14} />Back to feed
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-border rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{getNicheEmoji(idea.niche)}</span>
                  <span className="text-xs text-slate-500 capitalize">{idea.sub_niche ?? idea.niche}</span>
                </div>
                {idea.viral_score && (
                  <div className={cn('score-ring flex-shrink-0', scoreColor)}>{idea.viral_score}</div>
                )}
              </div>
              <h1 className="text-xl font-bold text-white leading-snug mb-3">{idea.title}</h1>
              {idea.description && <p className="text-sm text-slate-400 leading-relaxed mb-4">{idea.description}</p>}
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                {idea.estimated_minutes && <span className="flex items-center gap-1.5"><Clock size={12} />{idea.estimated_minutes} min</span>}
                {idea.difficulty && <span className={cn('capitalize font-medium', getDifficultyColor(idea.difficulty as any))}>{idea.difficulty}</span>}
                {idea.similar_views_avg && <span className="flex items-center gap-1.5"><TrendingUp size={12} />~{formatNumber(idea.similar_views_avg)} avg views</span>}
              </div>
              {idea.platforms?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {idea.platforms.map((p: string) => (
                    <span key={p} className={cn('pill text-xs', getPlatformColor(p as any))}>
                      {PLATFORM_NAMES[p] ?? p}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Hook preview */}
            {idea.hook_preview && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-surface border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} className="text-accent" />
                  <h2 className="text-sm font-semibold text-white">Opening hook</h2>
                </div>
                <blockquote className="text-sm text-slate-300 italic border-l-2 border-accent/40 pl-4 leading-relaxed">
                  {idea.hook_preview}
                </blockquote>
              </motion.div>
            )}

            {/* What to do next */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="bg-surface border border-border rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-4">Your next steps</h2>
              <div className="space-y-3">
                {[
                  { step: 1, label: 'Generate a script', desc: 'Get a full script outline with shot list', href: `/dashboard/guide?title=${encodeURIComponent(idea.title)}&niche=${idea.niche}`, icon: FileText },
                  { step: 2, label: 'Record and edit', desc: 'Upload your footage to auto-edit and caption', href: '/dashboard/editor', icon: Film },
                  { step: 3, label: 'Publish it', desc: 'Generate captions and post to YouTube', href: '/dashboard/publish', icon: Lightbulb },
                ].map(item => (
                  <a
                    key={item.step}
                    href={item.href}
                    className="flex items-center gap-4 p-3.5 bg-white/[0.03] hover:bg-white/[0.06] border border-border hover:border-border-2 rounded-xl transition-all group"
                  >
                    <div className="w-8 h-8 bg-accent/15 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon size={14} className="text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <ArrowRight size={13} className="text-slate-600 group-hover:text-accent transition-colors" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-accent/10 border border-accent/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={14} className="text-accent" />
                <span className="text-sm font-semibold text-white">Start creating</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Jump straight to the production guide for this idea.
              </p>
              <a
                href={`/dashboard/guide?title=${encodeURIComponent(idea.title)}&niche=${idea.niche || ''}`}
                className="btn-primary w-full flex items-center justify-center gap-2 text-xs py-3"
              >
                Generate script + shot list
                <ArrowRight size={13} />
              </a>
            </motion.div>

            {idea.trending_reason && (
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 }} className="bg-surface border border-border rounded-2xl p-4">
                <p className="section-label mb-3">Why it's trending</p>
                <div className="flex items-start gap-2">
                  <TrendingUp size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-400 leading-relaxed">{idea.trending_reason}</p>
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.34 }} className="bg-surface border border-border rounded-2xl p-4 space-y-3">
              <p className="section-label">Stats</p>
              {[
                { label: 'Avg views', value: formatNumber(idea.similar_views_avg ?? 0) },
                { label: 'Viral score', value: `${idea.viral_score ?? 0}/100` },
                { label: 'Difficulty', value: idea.difficulty ?? '—' },
                { label: 'Est. time', value: `${idea.estimated_minutes ?? 30} min` },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{s.label}</span>
                  <span className="text-white font-medium capitalize">{s.value}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

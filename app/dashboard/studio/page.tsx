'use client'


import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, ArrowRight, Lightbulb, Zap,
  ChevronDown, ChevronUp, Clock, RefreshCw,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePlanGate, UsageBar, UpgradePrompt } from '@/components/ui/PlanGate'
import { generateIdeas, type IdeaVariant, type HookVariant } from '@/lib/api'
import { NICHES, PLATFORMS, cn, getDifficultyColor, getFormatLabel, getNicheEmoji } from '@/lib/utils'
import type { Niche, Platform } from '@/types'

const EXAMPLE_PROMPTS = [
  "How I saved money on a low salary",
  "AI tools that replaced my expensive software",
  "Morning routine that actually works",
  "How to grow on Instagram from zero",
  "Beginner workout that gets real results",
]

const HOOK_STYLE_LABELS: Record<string, string> = {
  question:   "Question",
  shock_stat: "Shock stat",
  story:      "Story",
  bold_claim: "Bold claim",
}

const HOOK_STYLE_COLORS: Record<string, string> = {
  question:   "bg-purple-500/15 text-purple-300 border-purple-500/30",
  shock_stat: "bg-red-500/15 text-red-300 border-red-500/30",
  story:      "bg-amber-500/15 text-amber-300 border-amber-500/30",
  bold_claim: "bg-teal-500/15 text-teal-300 border-teal-500/30",
}

function IdeaResultCard({ idea, index }: { idea: IdeaVariant; index: number }) {
  const router = useRouter()   // ← add this line
  const [expanded, setExpanded] = useState(index === 0)
  const [selectedHook, setSelectedHook] = useState(0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="bg-surface border border-border rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-0.5 bg-white/5 rounded-full">
              {idea.angle}
            </span>
            <span className={cn('text-[10px] font-medium capitalize', getDifficultyColor(idea.difficulty as any))}>
              {idea.difficulty}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white leading-snug">
            {idea.title}
          </h3>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 mt-0.5">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock size={11} />
            {idea.estimated_minutes}min
          </span>
          {expanded ? (
            <ChevronUp size={15} className="text-slate-500" />
          ) : (
            <ChevronDown size={15} className="text-slate-500" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
              {/* Description */}
              <p className="text-sm text-slate-400 leading-relaxed">
                {idea.description}
              </p>

              {/* Hook variants */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                  Hook variants
                </p>
                <div className="space-y-2">
                  {idea.hooks.map((hook, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedHook(i)}
                      className={cn(
                        'w-full text-left p-3.5 rounded-xl border transition-all',
                        selectedHook === i
                          ? 'border-accent/50 bg-accent/10'
                          : 'border-border hover:border-border-2 hover:bg-white/[0.03]'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <span className={cn('pill text-[10px]', HOOK_STYLE_COLORS[hook.style] ?? 'border-border text-slate-400')}>
                          {HOOK_STYLE_LABELS[hook.style] ?? hook.style}
                        </span>
                        <span className={cn(
                          'text-xs font-semibold flex-shrink-0',
                          hook.score >= 80 ? 'text-emerald-400' : hook.score >= 70 ? 'text-amber-400' : 'text-slate-500'
                        )}>
                          {hook.score}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 italic leading-relaxed">
                        "{hook.text}"
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Format + CTA */}
              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Zap size={11} />
                  Best format: {getFormatLabel(idea.recommended_format as any)}
                </span>
                <button
                  onClick={() => router.push(`/dashboard/guide?title=${encodeURIComponent(idea.title)}`)}
                  className="btn-primary text-xs flex items-center gap-1.5 py-2"
                >
                  Use this idea
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function StudioPage() {
  const router = useRouter()
  const { usage, canGenerate, userId } = usePlanGate()
  const [prompt, setPrompt]         = useState('')
  const [niche, setNiche]           = useState<Niche>('finance')
  const [platforms, setPlatforms]   = useState<Platform[]>(['instagram', 'youtube'])
  const [loading, setLoading]       = useState(false)
  const [ideas, setIdeas]           = useState<IdeaVariant[]>([])
  const [error, setError]           = useState('')

  function togglePlatform(p: Platform) {
    setPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  async function handleGenerate() {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    setIdeas([])

    try {
      const result = await generateIdeas({
        user_id: userId,
        prompt,
        niche,
        platforms,
        num_ideas: 5,
      })
      setIdeas(result.ideas)
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={14} className="text-accent" />
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Idea Studio
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            What do you want to <span className="text-gradient">create?</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Describe your topic and we'll generate 5 unique angles with viral hooks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
          {/* Main: Input + results */}
          <div className="space-y-5">
            {/* Prompt input */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface border border-border rounded-2xl p-5"
            >
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                Your topic or idea
              </label>
              <textarea
                rows={3}
                placeholder="e.g. How I saved money on a ₹25k salary, or the truth about morning routines..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="input w-full resize-none leading-relaxed"
              />

              {/* Example prompts */}
              <div className="mt-3">
                <p className="text-[10px] text-slate-600 mb-1.5">Try an example:</p>
                <div className="flex flex-wrap gap-1.5">
                  {EXAMPLE_PROMPTS.map(ex => (
                    <button
                      key={ex}
                      onClick={() => setPrompt(ex)}
                      className="text-[11px] text-slate-500 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 rounded-lg transition-all border border-border hover:border-border-2"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Generate button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading || platforms.length === 0}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2.5 text-sm font-semibold disabled:opacity-40"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Gemini is generating your ideas...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Generate 5 ideas with hooks
                </>
              )}
            </motion.button>

            {error && error.includes('Upgrade') && usage ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 mb-2">
                <UpgradePrompt feature="idea generations" used={usage.usage.ideas.used} limit={usage.usage.ideas.limit} plan={usage.plan} />
              </motion.div>
            ) : error ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3"
              >
                {error}
              </motion.p>
            ) : null}

            {/* Results */}
            {ideas.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {ideas.length} ideas generated
                  </p>
                  <button
                    onClick={handleGenerate}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors"
                  >
                    <RefreshCw size={11} />
                    Regenerate
                  </button>
                </div>
                {ideas.map((idea, i) => (
                  <IdeaResultCard key={i} idea={idea} index={i} />
                ))}
              </motion.div>
            )}

            {/* Empty state */}
            {!loading && ideas.length === 0 && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center py-16 text-slate-600"
              >
                <Sparkles size={28} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Your ideas will appear here</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar: niche + platform selector */}
          <div className="space-y-4">
            {/* Niche */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface border border-border rounded-2xl p-4"
            >
              <p className="section-label mb-3">Your niche</p>
              <div className="grid grid-cols-2 gap-1.5">
                {NICHES.map(n => (
                  <button
                    key={n.value}
                    onClick={() => setNiche(n.value)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all',
                      niche === n.value
                        ? 'bg-accent/15 border-accent/40 text-white'
                        : 'border-border text-slate-500 hover:border-border-2 hover:text-slate-300'
                    )}
                  >
                    <span>{n.emoji}</span>
                    {n.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Platforms */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.28 }}
              className="bg-surface border border-border rounded-2xl p-4"
            >
              <p className="section-label mb-3">Platforms</p>
              <div className="space-y-1.5">
                {PLATFORMS.map(p => {
                  const active = platforms.includes(p.value)
                  return (
                    <button
                      key={p.value}
                      onClick={() => togglePlatform(p.value)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-all',
                        active
                          ? 'bg-accent/15 border-accent/40 text-white'
                          : 'border-border text-slate-500 hover:border-border-2 hover:text-slate-300'
                      )}
                    >
                      {p.label}
                      <div className={cn(
                        'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                        active ? 'bg-accent border-accent' : 'border-slate-600'
                      )}>
                        {active && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>

            {/* Tip */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4"
            >
              <p className="text-xs font-semibold text-amber-400 mb-1.5">Pro tip</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Be specific in your prompt. "How I saved ₹50,000" beats "saving money". Specificity = higher viral scores.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

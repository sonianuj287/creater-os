'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Flame, CheckCircle, Zap, ArrowRight, Crown, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getMySprint, type SprintData } from '@/lib/api'
import { cn, getNicheEmoji } from '@/lib/utils'
import { LottiePlayer } from '@/components/ui/LottiePlayer'

export function SprintWidget() {
  const router = useRouter()
  const [sprint, setSprint]   = useState<SprintData | null | undefined>(undefined)
  const [plan, setPlan]       = useState<string>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
    setPlan(profile?.plan ?? 'free')
    try {
      const res = await getMySprint(user.id)
      setSprint(res.sprint)
    } catch {
      setSprint(null)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="h-40 bg-surface border border-border rounded-2xl animate-pulse" />
  }

  // ── Not enrolled — Full-width hero promo card ──────────────────
  if (!sprint) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => router.push('/dashboard/sprint')}
        className="relative cursor-pointer overflow-hidden rounded-3xl border border-accent/30 hover:border-accent/60 transition-all group"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-accent/15 to-pink-600/20" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        {/* Glow orbs */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-orange-500/20 rounded-full blur-2xl" />
        <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-pink-500/15 rounded-full blur-2xl" />

        <div className="relative z-10 p-6 flex items-center gap-5">
          {/* Lottie fire animation */}
          <div className="flex-shrink-0">
            <LottiePlayer preset="fire" size={70} />
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 rounded-full">
                NEW CHALLENGE
              </span>
              {plan === 'free' && (
                <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  7 days free
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-white leading-tight mb-1">
              30-Day Creator Sprint 🔥
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              AI generates your full 30-day content roadmap. One idea per day. Daily email nudges. Streak tracking.
            </p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 bg-white text-black text-xs font-black px-4 py-2 rounded-xl group-hover:bg-accent group-hover:text-white transition-all">
                Start Sprint <ArrowRight size={13} />
              </span>
              <div className="flex gap-3 text-xs text-slate-500">
                {['🤖 AI ideas', '📧 Daily email', '🔥 Streak'].map(t => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // ── Active sprint — enriched progress widget ──────────────────
  const todayDone = !!sprint.completed_days[String(sprint.current_day)]
  const todayIdea = sprint.ideas[sprint.current_day - 1]
  const isFreeExpired = plan === 'free' && sprint.current_day > 7

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-2xl overflow-hidden"
    >
      {/* Gradient header bar */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-accent"
        style={{ width: `${sprint.completion_pct}%`, transition: 'width 0.8s ease' }}
      />

      <div className="p-4">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LottiePlayer preset="fire" size={28} />
            <div>
              <p className="text-xs font-bold text-white leading-none">Creator Sprint</p>
              <p className="text-[10px] text-slate-500 capitalize mt-0.5">
                {getNicheEmoji(sprint.niche)} {sprint.niche}
              </p>
            </div>
          </div>
          <button onClick={() => router.push('/dashboard/sprint')}
            className="text-[11px] text-accent hover:text-white flex items-center gap-1 transition-colors"
          >
            View <ArrowRight size={11} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            [`🔥 ${sprint.streak}`, 'streak'],
            [`${sprint.current_day}/30`, 'day'],
            [`${sprint.completion_pct}%`, 'done'],
          ].map(([v, l]) => (
            <div key={l} className="bg-white/[0.03] border border-white/5 rounded-xl p-2 text-center">
              <p className="text-sm font-black text-white">{v}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{l}</p>
            </div>
          ))}
        </div>

        {/* Free plan expired gate */}
        {isFreeExpired ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
            <Lock size={14} className="text-amber-400 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-amber-300 mb-1">7-day free limit reached</p>
            <p className="text-[10px] text-slate-500 mb-2.5">Upgrade to continue your streak</p>
            <button onClick={() => router.push('/dashboard/sprint')}
              className="w-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg py-2 transition-all flex items-center justify-center gap-1.5"
            >
              <Crown size={12} /> Upgrade to keep going
            </button>
          </div>
        ) : todayIdea ? (
          <div className={cn(
            'rounded-xl p-3 border transition-all',
            todayDone ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-accent/30 bg-accent/5'
          )}>
            <div className="flex items-start gap-2.5">
              <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                todayDone ? 'bg-emerald-500/20' : 'bg-accent/20'
              )}>
                {todayDone
                  ? <CheckCircle size={13} className="text-emerald-400" />
                  : <Zap size={13} className="text-accent" />
                }
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-[10px] font-bold mb-0.5 text-slate-500 uppercase tracking-widest">
                  {todayDone ? 'Today — Done! 🎉' : `Day ${sprint.current_day} — Today`}
                </p>
                <p className={cn('text-xs font-semibold leading-snug',
                  todayDone ? 'text-emerald-300' : 'text-white'
                )}>
                  {todayIdea.title}
                </p>
              </div>
            </div>
            {!todayDone && (
              <button onClick={() => router.push('/dashboard/sprint')}
                className="w-full mt-3 text-xs font-bold bg-accent hover:bg-accent/80 text-white rounded-lg py-2 transition-all flex items-center justify-center gap-1.5"
              >
                <Flame size={12} /> Create Today's Video
              </button>
            )}
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}

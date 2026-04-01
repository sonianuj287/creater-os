'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Flame, ChevronRight, CheckCircle, Zap, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getMySprint, type SprintData } from '@/lib/api'
import { cn, getNicheEmoji } from '@/lib/utils'

export function SprintWidget() {
  const router = useRouter()
  const [sprint, setSprint]   = useState<SprintData | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    try {
      const res = await getMySprint(user.id)
      setSprint(res.sprint)
    } catch {
      setSprint(null)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="h-28 bg-surface border border-border rounded-2xl animate-pulse" />
  }

  // ── No active sprint — Promo ────────────────────────────────
  if (!sprint) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => router.push('/dashboard/sprint')}
        className="relative cursor-pointer overflow-hidden bg-gradient-to-br from-accent/15 via-purple-500/8 to-pink-500/10 border border-accent/30 hover:border-accent/60 rounded-2xl p-5 transition-all group"
      >
        {/* Background decoration */}
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/10 rounded-full blur-xl" />
        <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-pink-500/10 rounded-full blur-xl" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20">
            <Flame size={22} className="text-white" />
          </div>
          <div className="flex-grow">
            <p className="text-sm font-black text-white mb-0.5">30-Day Creator Sprint</p>
            <p className="text-xs text-slate-400 leading-tight">
              AI generates 30 niche ideas. Daily email nudges. Streak tracking.
            </p>
          </div>
          <ChevronRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>

        <div className="relative z-10 flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
          {[['🔥', 'Streak tracking'], ['📧', 'Daily reminders'], ['🤖', 'AI-crafted ideas']].map(([icon, label]) => (
            <div key={label as string} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  // ── Active sprint — Progress widget ─────────────────────────
  const todayDone = !!sprint.completed_days[String(sprint.current_day)]
  const todayIdea = sprint.ideas[sprint.current_day - 1]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-2xl overflow-hidden"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Flame size={14} className="text-accent" />
          <p className="text-xs font-bold text-white uppercase tracking-widest">Creator Sprint</p>
          <span className="text-[10px] text-slate-500 capitalize">
            {getNicheEmoji(sprint.niche)} {sprint.niche}
          </span>
        </div>
        <button
          onClick={() => router.push('/dashboard/sprint')}
          className="text-[11px] text-accent hover:text-white flex items-center gap-1 transition-colors"
        >
          View all <ArrowRight size={11} />
        </button>
      </div>

      <div className="p-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <p className="text-lg font-black text-white flex items-center justify-center gap-1">
              🔥 {sprint.streak}
            </p>
            <p className="text-[10px] text-slate-500">streak</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-white">{sprint.current_day}<span className="text-slate-600 font-normal">/30</span></p>
            <p className="text-[10px] text-slate-500">today</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-white">{sprint.days_completed}</p>
            <p className="text-[10px] text-slate-500">done</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${sprint.completion_pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-accent to-pink-500 rounded-full"
          />
        </div>

        {/* Today's idea */}
        {todayIdea && (
          <div className={cn(
            'rounded-xl p-3.5 border transition-all',
            todayDone
              ? 'border-emerald-500/30 bg-emerald-500/5'
              : 'border-accent/30 bg-accent/5'
          )}>
            <div className="flex items-start gap-2.5">
              <div className={cn(
                'w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
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
                <p className={cn(
                  'text-xs font-semibold leading-snug',
                  todayDone ? 'text-emerald-300' : 'text-white'
                )}>
                  {todayIdea.title}
                </p>
              </div>
            </div>

            {!todayDone && (
              <button
                onClick={() => router.push('/dashboard/sprint')}
                className="w-full mt-3 text-xs font-bold bg-accent hover:bg-accent/80 text-white rounded-lg py-2 transition-all flex items-center justify-center gap-1.5"
              >
                <Flame size={12} /> Create Today's Video
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

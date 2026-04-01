'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Flame, CheckCircle, Lock, Calendar, Zap, Trophy,
  ChevronRight, ArrowRight, Bell, BellOff, BarChart3,
  Target, Sparkles, Play, X, Info, Loader2, Crown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import {
  enrollSprint, getMySprint, completeSprintDay, cancelSprint,
  type SprintData, type SprintIdea
} from '@/lib/api'
import { NICHES, cn, getNicheEmoji, getDifficultyColor, getFormatLabel } from '@/lib/utils'

const FORMAT_ICONS: Record<string, string> = { reel: '📱', short: '▶️', long_form: '🎥' }

const MILESTONE_DAYS = new Set([1, 7, 14, 21, 30])

function StreakFlame({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-2xl">🔥</span>
      <div>
        <p className="text-xl font-black text-white leading-none">{count}</p>
        <p className="text-[10px] text-slate-500 font-medium">day streak</p>
      </div>
    </div>
  )
}

function DayCard({
  idea, day, status, isToday, onClick
}: {
  idea: SprintIdea
  day: number
  status: 'completed' | 'today' | 'upcoming' | 'missed'
  isToday: boolean
  onClick: () => void
}) {
  const isMilestone = MILESTONE_DAYS.has(day)

  return (
    <motion.button
      onClick={onClick}
      whileHover={status !== 'upcoming' ? { y: -2, scale: 1.02 } : {}}
      whileTap={status !== 'upcoming' ? { scale: 0.98 } : {}}
      className={cn(
        'relative w-full text-left rounded-2xl border p-4 transition-all',
        status === 'completed'
          ? 'border-emerald-500/40 bg-emerald-500/10'
          : status === 'today'
          ? 'border-accent/60 bg-accent/10 shadow-lg shadow-accent/10'
          : status === 'missed'
          ? 'border-rose-500/30 bg-rose-500/5'
          : 'border-border bg-surface/50 opacity-60 cursor-default',
      )}
    >
      {/* Milestone badge */}
      {isMilestone && status !== 'upcoming' && (
        <span className="absolute -top-2 -right-2 text-xs bg-amber-400 text-black font-black px-2 py-0.5 rounded-full shadow-lg">
          {day === 30 ? '🏆 FINAL' : `🎯 Day ${day}`}
        </span>
      )}

      {/* Today glow ring */}
      {isToday && (
        <div className="absolute inset-0 rounded-2xl border-2 border-accent/40 animate-pulse pointer-events-none" />
      )}

      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div className={cn(
          'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black mt-0.5',
          status === 'completed' ? 'bg-emerald-500/20 text-emerald-400'
          : status === 'today' ? 'bg-accent/20 text-accent'
          : status === 'missed' ? 'bg-rose-500/20 text-rose-400'
          : 'bg-white/5 text-slate-600'
        )}>
          {status === 'completed' ? <CheckCircle size={16} />
           : status === 'today' ? <Zap size={16} />
           : status === 'missed' ? '!'
           : <Lock size={14} />}
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Day {day}</span>
            {idea.format && (
              <span className="text-[10px] text-slate-600">{FORMAT_ICONS[idea.format] ?? '🎬'} {getFormatLabel(idea.format as any)}</span>
            )}
            <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md border', getDifficultyColor(idea.difficulty as any))}>
              {idea.difficulty}
            </span>
          </div>
          <p className={cn(
            'text-sm font-semibold leading-tight mb-1',
            status === 'upcoming' ? 'text-slate-600' : 'text-white'
          )}>
            {status === 'upcoming' ? '🔒 Unlocks on Day ' + day : idea.title}
          </p>
          {status !== 'upcoming' && idea.hook && (
            <p className="text-xs text-slate-500 italic line-clamp-1">"{idea.hook}"</p>
          )}
        </div>

        {status !== 'upcoming' && (
          <ChevronRight size={14} className={cn(
            'flex-shrink-0 mt-1',
            status === 'today' ? 'text-accent' : 'text-slate-600'
          )} />
        )}
      </div>
    </motion.button>
  )
}

// ── Enrollment Modal ────────────────────────────────────────────
function EnrollModal({ userId, email, name, onEnrolled, onClose }: {
  userId: string; email: string; name: string
  onEnrolled: () => void; onClose: () => void
}) {
  const [niche, setNiche]             = useState('lifestyle')
  const [emailNotif, setEmailNotif]   = useState(true)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  async function handleEnroll() {
    setLoading(true)
    setError('')
    try {
      await enrollSprint({ user_id: userId, niche, email, name, email_notifications: emailNotif })
      onEnrolled()
    } catch (e: any) {
      setError(e.message ?? 'Enrollment failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="bg-canvas border border-border rounded-3xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-accent via-purple-600 to-pink-600 p-8 text-center">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
            <X size={15} className="text-white" />
          </button>
          <div className="text-5xl mb-3">🔥</div>
          <h2 className="text-2xl font-black text-white mb-1">30-Day Creator Sprint</h2>
          <p className="text-sm text-white/80">30 AI-crafted ideas. One per day. Zero excuses.</p>
        </div>

        {/* Benefits */}
        <div className="p-6 space-y-4 border-b border-border">
          {[
            ['📅', 'AI generates your full 30-day content roadmap instantly'],
            ['📧', 'Daily email with today\'s idea, hook & format'],
            ['🔥', 'Streak tracking to keep you consistent'],
            ['🎯', 'Progressive difficulty — easy → hard over 30 days'],
            ['🚀', 'One-click "create this video" launches Guide with pre-filled content'],
          ].map(([icon, text]) => (
            <div key={text as string} className="flex items-center gap-3">
              <span className="text-lg flex-shrink-0">{icon}</span>
              <p className="text-sm text-slate-300">{text}</p>
            </div>
          ))}
        </div>

        {/* Config */}
        <div className="p-6 space-y-4">
          <div>
            <label className="section-label mb-2 block">Choose your niche</label>
            <div className="grid grid-cols-3 gap-2">
              {NICHES.map(n => (
                <button key={n.value} onClick={() => setNiche(n.value)}
                  className={cn(
                    'px-3 py-2 rounded-xl border text-xs font-semibold transition-all capitalize flex items-center gap-1.5 justify-center',
                    niche === n.value ? 'bg-accent/20 border-accent/60 text-white' : 'border-border text-slate-400 hover:border-border-2'
                  )}
                >
                  {n.emoji} {n.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-border hover:border-border-2 transition-colors">
            <div className={cn(
              'w-10 h-6 rounded-full transition-all relative flex-shrink-0',
              emailNotif ? 'bg-accent' : 'bg-white/10'
            )}
              onClick={() => setEmailNotif(!emailNotif)}
            >
              <div className={cn(
                'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all',
                emailNotif ? 'left-5' : 'left-1'
              )} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Daily email reminders</p>
              <p className="text-xs text-slate-500">Sent to {email}</p>
            </div>
          </label>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">{error}</p>
          )}

          <button onClick={handleEnroll} disabled={loading}
            className="w-full btn-primary py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" />Generating 30 ideas...</> : <><Flame size={18}/>Start My Sprint</>}
          </button>
          <p className="text-xs text-slate-600 text-center">You can cancel anytime. No payment required.</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Day Detail Drawer ───────────────────────────────────────────
function DayDrawer({ idea, day, status, sprint, userId, onComplete, onClose }: {
  idea: SprintIdea; day: number; status: string
  sprint: SprintData; userId: string
  onComplete: () => void; onClose: () => void
}) {
  const router = useRouter()
  const [completing, setCompleting] = useState(false)

  async function handleComplete() {
    setCompleting(true)
    try {
      await completeSprintDay({ user_id: userId, sprint_id: sprint.id, day_number: day })
      onComplete()
      onClose()
    } catch {}
    setCompleting(false)
  }

  function goToGuide() {
    router.push(
      `/dashboard/guide?title=${encodeURIComponent(idea.title)}&hook=${encodeURIComponent(idea.hook)}&niche=${encodeURIComponent(sprint.niche)}&format=${encodeURIComponent(idea.format)}`
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="absolute top-0 right-0 h-full w-full max-w-md bg-canvas border-l border-border overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold text-accent uppercase tracking-widest">Day {day} of 30</span>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
              <X size={15} className="text-slate-400" />
            </button>
          </div>

          {/* Status banner */}
          {status === 'completed' && (
            <div className="mb-4 flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5">
              <CheckCircle size={16} className="text-emerald-400" />
              <p className="text-sm font-semibold text-emerald-300">Day completed! 🎉</p>
            </div>
          )}
          {status === 'missed' && (
            <div className="mb-4 flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5">
              <Info size={16} className="text-amber-400" />
              <p className="text-sm text-amber-300">Missed day — but it's not too late. Create it now!</p>
            </div>
          )}

          <h2 className="text-xl font-black text-white mb-2 leading-tight">{idea.title}</h2>

          <div className="flex items-center gap-2 mb-6">
            <span className="pill bg-surface border-border text-slate-400 text-xs">
              {FORMAT_ICONS[idea.format]} {getFormatLabel(idea.format as any)}
            </span>
            <span className={cn('pill text-xs', getDifficultyColor(idea.difficulty as any))}>
              {idea.difficulty}
            </span>
            {MILESTONE_DAYS.has(day) && (
              <span className="pill bg-amber-500/15 border-amber-500/30 text-amber-300 text-xs">🎯 Milestone</span>
            )}
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
            <p className="text-xs font-bold text-accent uppercase tracking-widest mb-2">Opening Hook</p>
            <p className="text-base text-white italic leading-relaxed">"{idea.hook}"</p>
          </div>

          {idea.angle && (
            <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Content Angle</p>
              <p className="text-sm text-slate-300 leading-relaxed">{idea.angle}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button onClick={goToGuide}
              className="w-full btn-primary py-4 text-sm font-bold flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              Create This Video with AI Guide
            </button>

            {status !== 'completed' && (
              <button onClick={handleComplete} disabled={completing}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-border text-sm font-semibold text-white hover:bg-white/[0.04] transition-all disabled:opacity-50"
              >
                {completing ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} className="text-emerald-400" />}
                Mark as Done (skip guide)
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Sprint Page ────────────────────────────────────────────
export default function SprintPage() {
  const router = useRouter()
  const [sprint, setSprint]                   = useState<SprintData | null>(null)
  const [loading, setLoading]                 = useState(true)
  const [userId, setUserId]                   = useState('')
  const [userEmail, setUserEmail]             = useState('')
  const [userName, setUserName]               = useState('')
  const [showEnroll, setShowEnroll]           = useState(false)
  const [selectedDay, setSelectedDay]         = useState<number | null>(null)
  const [cancelLoading, setCancelLoading]     = useState(false)
  const [view, setView]                       = useState<'calendar' | 'list'>('list')

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setUserId(user.id)
    setUserEmail(user.email ?? '')
    // Get name from profiles
    const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    setUserName(data?.full_name ?? user.email?.split('@')[0] ?? 'Creator')
    fetchSprint(user.id)
  }

  async function fetchSprint(uid: string) {
    setLoading(true)
    try {
      const res = await getMySprint(uid)
      setSprint(res.sprint)
    } catch {}
    setLoading(false)
  }

  async function handleCancelSprint() {
    if (!confirm('Cancel your Creator Sprint? Your progress will be saved but streak resets.')) return
    setCancelLoading(true)
    await cancelSprint(userId)
    setSprint(null)
    setCancelLoading(false)
  }

  function getDayStatus(day: number): 'completed' | 'today' | 'upcoming' | 'missed' {
    if (!sprint) return 'upcoming'
    if (sprint.completed_days[String(day)]) return 'completed'
    if (day === sprint.current_day) return 'today'
    if (day < sprint.current_day) return 'missed'
    return 'upcoming'
  }

  const selectedIdea = selectedDay && sprint ? sprint.ideas[selectedDay - 1] : null

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🔥</div>
          <p className="text-slate-400 text-sm">Loading your Sprint...</p>
        </div>
      </div>
    )
  }

  // ── No Sprint — Landing ─────────────────────────────────────
  if (!sprint) {
    return (
      <>
        <div className="min-h-screen bg-canvas">
          <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">

            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
              <div className="text-7xl mb-6 animate-bounce">🔥</div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                30-Day <span className="text-gradient">Creator Sprint</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
                Commit to 30 days of consistent content creation. AI generates your full roadmap. You just show up and create.
              </p>
            </motion.div>

            {/* Stats row */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-4 mb-12"
            >
              {[
                { icon: '📅', label: '30 days', sub: 'of content' },
                { icon: '🤖', label: 'AI-crafted', sub: 'for your niche' },
                { icon: '📧', label: 'Daily email', sub: 'reminders' },
              ].map(s => (
                <div key={s.label} className="bg-surface border border-border rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <p className="text-sm font-bold text-white">{s.label}</p>
                  <p className="text-xs text-slate-500">{s.sub}</p>
                </div>
              ))}
            </motion.div>

            {/* Preview timeline */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-surface border border-border rounded-3xl p-6 mb-10"
            >
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">How it works</p>
              <div className="space-y-4">
                {[
                  { day: 'Day 1–5', icon: '🌱', title: 'Easy wins', desc: 'Personal stories & relatable moments — build confidence' },
                  { day: 'Day 6–15', icon: '⚡', title: 'Educate & inform', desc: 'How-to videos, myth-busting — build authority' },
                  { day: 'Day 16–22', icon: '🔥', title: 'Controversy & takes', desc: 'Opinion hooks — maximise engagement and saves' },
                  { day: 'Day 23–29', icon: '🚀', title: 'Collabs & trends', desc: 'Trend-jacking and duets — ride the algorithm' },
                  { day: 'Day 30', icon: '👑', title: 'Sprint finale', desc: 'Your journey video — the most viral format of all' },
                ].map((phase, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-xl flex-shrink-0">{phase.icon}</span>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-accent">{phase.day}</span>
                        <span className="text-sm font-semibold text-white">{phase.title}</span>
                      </div>
                      <p className="text-xs text-slate-500">{phase.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              onClick={() => setShowEnroll(true)}
              className="w-full btn-primary py-5 text-lg font-black flex items-center justify-center gap-3"
            >
              <Flame size={22} />
              Start My 30-Day Sprint
              <ArrowRight size={20} />
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showEnroll && (
            <EnrollModal
              userId={userId} email={userEmail} name={userName}
              onEnrolled={() => { setShowEnroll(false); fetchSprint(userId) }}
              onClose={() => setShowEnroll(false)}
            />
          )}
        </AnimatePresence>
      </>
    )
  }

  // ── Active Sprint Dashboard ──────────────────────────────────
  const todayIdea = sprint.ideas[sprint.current_day - 1]

  return (
    <>
      <div className="min-h-screen bg-canvas">
        <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={14} className="text-accent" />
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Creator Sprint</span>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Your 30-Day <span className="text-gradient">Sprint</span>
                </h1>
                <p className="text-sm text-slate-500 mt-1 capitalize">
                  {getNicheEmoji(sprint.niche)} {sprint.niche} · {sprint.start_date} → {sprint.end_date}
                </p>
              </div>
              <button onClick={handleCancelSprint} disabled={cancelLoading}
                className="text-xs text-slate-600 hover:text-rose-400 transition-colors"
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel sprint'}
              </button>
            </div>
          </motion.div>

          {/* Stats strip */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
          >
            <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3">
              <StreakFlame count={sprint.streak} />
            </div>
            <div className="bg-surface border border-border rounded-2xl p-4">
              <p className="text-xl font-black text-white">{sprint.days_completed}</p>
              <p className="text-xs text-slate-500">days done</p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-4">
              <p className="text-xl font-black text-white">{sprint.current_day}/30</p>
              <p className="text-xs text-slate-500">today</p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">Progress</p>
                <p className="text-xs font-bold text-white">{sprint.completion_pct}%</p>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${sprint.completion_pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-accent to-pink-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Today's idea CTA */}
          {getDayStatus(sprint.current_day) !== 'completed' && todayIdea && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
              className="relative overflow-hidden bg-gradient-to-r from-accent/20 via-purple-500/10 to-pink-500/15 border border-accent/40 rounded-3xl p-6 mb-8"
            >
              <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} className="text-accent" />
                  <span className="text-xs font-bold text-accent uppercase tracking-widest">Today · Day {sprint.current_day}</span>
                </div>
                <h2 className="text-lg md:text-xl font-black text-white mb-2 leading-tight">{todayIdea.title}</h2>
                <p className="text-sm text-slate-400 italic mb-4">"{todayIdea.hook}"</p>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedDay(sprint.current_day)}
                    className="btn-primary flex items-center gap-2 text-sm py-3 px-5"
                  >
                    <Play size={14} /> Create Today's Video
                  </button>
                  <button onClick={() => router.push(`/dashboard/guide?title=${encodeURIComponent(todayIdea.title)}&hook=${encodeURIComponent(todayIdea.hook)}&niche=${encodeURIComponent(sprint.niche)}`)}
                    className="flex items-center gap-2 text-sm py-3 px-5 rounded-xl border border-border text-white hover:bg-white/[0.04] transition-all"
                  >
                    <Sparkles size={14} /> Open in Guide
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 30-day list */}
          <div className="space-y-2">
            <p className="section-label px-1 mb-3">All 30 days</p>
            {sprint.ideas.map((idea, i) => {
              const day = i + 1
              const status = getDayStatus(day)
              return (
                <motion.div key={day}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.4) }}
                >
                  <DayCard
                    idea={idea} day={day} status={status}
                    isToday={day === sprint.current_day}
                    onClick={() => status !== 'upcoming' ? setSelectedDay(day) : undefined}
                  />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Day detail drawer */}
      <AnimatePresence>
        {selectedDay && selectedIdea && (
          <DayDrawer
            idea={selectedIdea} day={selectedDay}
            status={getDayStatus(selectedDay)}
            sprint={sprint} userId={userId}
            onComplete={() => fetchSprint(userId)}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

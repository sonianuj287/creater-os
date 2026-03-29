'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Check, Zap } from 'lucide-react'
import { createClient, updateProfile } from '@/lib/supabase'
import { NICHES, PLATFORMS, cn } from '@/lib/utils'
import type { Niche, Platform, MonetisationGoal } from '@/types'

const MONETISATION_TARGETS: Array<{ platform: Platform; target: number; label: string }> = [
  { platform: 'instagram', target: 10000, label: 'Instagram Bonuses (10K followers)' },
  { platform: 'youtube', target: 1000, label: 'YouTube Partner (1K subs + 4K hrs)' },
  { platform: 'tiktok', target: 10000, label: 'TikTok Creator Fund (10K followers)' },
]

type Step = 'niche' | 'platforms' | 'goal'
const STEPS: Step[] = ['niche', 'platforms', 'goal']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('niche')
  const [saving, setSaving] = useState(false)

  // Form state
  const [niches, setNiches] = useState<string[]>([])
  const [subNiche, setSubNiche] = useState('')
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [monetisationTarget, setMonetisationTarget] = useState<Platform>('instagram')
  const [currentFollowers, setCurrentFollowers] = useState('')

  const stepIndex = STEPS.indexOf(step)
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  function canAdvance() {
    if (step === 'niche') return niches.length > 0
    if (step === 'platforms') return platforms.length > 0
    return !!currentFollowers
  }

  async function handleFinish() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const target = MONETISATION_TARGETS.find((t) => t.platform === monetisationTarget)
    const goal: MonetisationGoal = {
      platform: monetisationTarget,
      target_followers: target?.target ?? 10000,
      current_followers: parseInt(currentFollowers) || 0,
    }

    try {
      await updateProfile(user.id, {
        niche: niches.join(','),
        sub_niche: subNiche || null,
        platforms,
        monetisation_goal: goal,
        onboarding_completed: true,
      })
      router.push('/dashboard')
    } catch (e) {
      console.error(e)
      setSaving(false)
    }
  }

  function next() {
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
    else handleFinish()
  }

  function back() {
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }

  const variants = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-accent/8 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-accent" />
              <span className="text-xs text-slate-500 font-medium">
                Setup {stepIndex + 1} of {STEPS.length}
              </span>
            </div>
            <span className="text-xs text-slate-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-accent to-accent-2 rounded-full"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Niche */}
          {step === 'niche' && (
            <motion.div
              key="niche"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="bg-surface border border-border rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-1">
                What's your content niche?
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                We'll personalise trending ideas for you.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-5">
                {NICHES.map((n) => {
                  const isSelected = niches.includes(n.value)
                  return (
                    <button
                      key={n.value}
                      onClick={() => setNiches(prev => prev.includes(n.value) ? prev.filter(x => x !== n.value) : [...prev, n.value])}
                      className={cn(
                        'flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium transition-all',
                        isSelected
                          ? 'bg-accent/15 border-accent/50 text-white'
                          : 'border-border text-slate-400 hover:border-border-2 hover:text-white hover:bg-white/5'
                      )}
                    >
                      <span className="text-xl leading-none">{n.emoji}</span>
                      <span>{n.label}</span>
                      {isSelected && (
                        <Check size={13} className="ml-auto text-accent" />
                      )}
                    </button>
                  )
                })}
              </div>

              {niches.length > 0 && !niches.includes('other') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4"
                >
                  <label className="text-xs text-slate-500 mb-1.5 block">
                    Any specific sub-niche? (optional)
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. ${niches.includes('finance') ? 'crypto, investing' : niches.includes('fitness') ? 'yoga, calisthenics' : 'more specific...'}`}
                    value={subNiche}
                    onChange={(e) => setSubNiche(e.target.value)}
                    className="input w-full"
                  />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 2: Platforms */}
          {step === 'platforms' && (
            <motion.div
              key="platforms"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="bg-surface border border-border rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-1">
                Where do you post?
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Select all platforms you're active on or want to grow.
              </p>

              <div className="space-y-2.5">
                {PLATFORMS.map((p) => {
                  const selected = platforms.includes(p.value)
                  return (
                    <button
                      key={p.value}
                      onClick={() => togglePlatform(p.value)}
                      className={cn(
                        'w-full flex items-center justify-between p-4 rounded-xl border text-sm font-medium transition-all',
                        selected
                          ? 'bg-accent/15 border-accent/50 text-white'
                          : 'border-border text-slate-400 hover:border-border-2 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <span>{p.label}</span>
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                        selected ? 'border-accent bg-accent' : 'border-slate-600'
                      )}>
                        {selected && <Check size={10} className="text-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Monetisation goal */}
          {step === 'goal' && (
            <motion.div
              key="goal"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="bg-surface border border-border rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-1">
                Set your monetisation goal
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                We'll track your progress and pace every day.
              </p>

              <div className="space-y-2.5 mb-5">
                {MONETISATION_TARGETS.filter((t) =>
                  platforms.includes(t.platform) || platforms.length === 0
                ).map((t) => (
                  <button
                    key={t.platform}
                    onClick={() => setMonetisationTarget(t.platform)}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border transition-all',
                      monetisationTarget === t.platform
                        ? 'bg-accent/15 border-accent/50'
                        : 'border-border hover:border-border-2 hover:bg-white/5'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        'text-sm font-medium',
                        monetisationTarget === t.platform ? 'text-white' : 'text-slate-300'
                      )}>
                        {t.label}
                      </span>
                      {monetisationTarget === t.platform && (
                        <Check size={14} className="text-accent" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">
                  How many followers do you have right now?
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1200"
                  value={currentFollowers}
                  onChange={(e) => setCurrentFollowers(e.target.value)}
                  className="input w-full"
                  min="0"
                />
                <p className="text-xs text-slate-600 mt-1.5">
                  We'll calculate your ETA to monetisation.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3 mt-4">
          {stepIndex > 0 && (
            <button onClick={back} className="btn-outline flex items-center gap-2">
              <ArrowLeft size={14} />
              Back
            </button>
          )}
          <button
            onClick={next}
            disabled={!canAdvance() || saving}
            className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-40"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : step === 'goal' ? (
              <>
                Let's go
                <Zap size={14} />
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

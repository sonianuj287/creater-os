'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Sparkles, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const TOUR_STEPS = [
  {
    title: 'Welcome to Creator OS! 👋',
    desc: "You're looking at your trending ideas feed. Every day, AI scans YouTube to find what's viral in your niche — so you never run out of content ideas.",
    target: 'feed',
    emoji: '🔥',
  },
  {
    title: 'Pick an idea or create your own',
    desc: "Click any idea card to see the full breakdown — hook, trending reason, and next steps. Or go to 'Ideas' in the sidebar to generate ideas from your own topic.",
    target: 'ideas',
    emoji: '💡',
  },
  {
    title: 'Plan your video with the Guide',
    desc: "Once you have an idea, the Guide generates a full script outline, shot list, and B-roll suggestions. You'll know exactly what to say and film before you hit record.",
    target: 'guide',
    emoji: '📝',
  },
  {
    title: 'The Scene Assembler (your superpower)',
    desc: "Film each script section as a short clip. Upload them one by one to the Assemble tab. The AI combines them, cuts silences, burns captions, and exports in 3 formats automatically.",
    target: 'assemble',
    emoji: '🎬',
  },
  {
    title: 'Or upload a full video to the Editor',
    desc: "Already have a full recording? Drop it in the Editor. It auto-transcribes, cuts silences, burns captions, extracts your best clips, and generates a tweet thread + carousel.",
    target: 'editor',
    emoji: '✂️',
  },
  {
    title: 'Publish everywhere in one click',
    desc: "Go to Publish to post your video to YouTube. Generate AI captions and hashtags, schedule for peak times, and track your results in Analytics.",
    target: 'publish',
    emoji: '🚀',
  },
  {
    title: "You're all set!",
    desc: "Start by clicking a trending idea on your feed, or open the Idea Studio and type a topic you want to make content about. Your first video is 3 minutes away.",
    target: 'done',
    emoji: '⚡',
  },
]

interface TourProps {
  onComplete: () => void
}

export function OnboardingTour({ onComplete }: TourProps) {
  const [step, setStep] = useState(0)
  const current = TOUR_STEPS[step]
  const isLast  = step === TOUR_STEPS.length - 1

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-accent" />
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                Quick tour · {step + 1}/{TOUR_STEPS.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onComplete}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded hover:bg-white/5"
              >
                Skip
              </button>
              <button
                onClick={onComplete}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-6">
            <div className="text-4xl mb-4">{current.emoji}</div>
            <h3 className="text-lg font-bold text-white mb-2">{current.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{current.desc}</p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 pb-4">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all ${
                  i === step
                    ? 'w-5 h-1.5 bg-accent'
                    : i < step
                    ? 'w-1.5 h-1.5 bg-accent/40'
                    : 'w-1.5 h-1.5 bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <button
              onClick={() => step > 0 ? setStep(s => s - 1) : onComplete()}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors"
            >
              {step > 0 ? <><ArrowLeft size={13} />Back</> : 'Skip tour'}
            </button>

            <button
              onClick={() => isLast ? onComplete() : setStep(s => s + 1)}
              className="flex items-center gap-2 btn-primary text-sm py-2.5 px-5"
            >
              {isLast ? (
                <><Sparkles size={13} />Let's create!</>
              ) : (
                <>Next<ArrowRight size={13} /></>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Hook to manage tour state
export function useTour() {
  const [showTour, setShowTour] = useState(false)
  const TOUR_KEY = 'creator_os_tour_done'

  useEffect(() => {
    // Show tour for first-time users only
    const done = localStorage.getItem(TOUR_KEY)
    if (!done) {
      // Small delay so the dashboard loads first
      setTimeout(() => setShowTour(true), 1000)
    }
  }, [])

  function completeTour() {
    localStorage.setItem(TOUR_KEY, 'true')
    setShowTour(false)
  }

  return { showTour, completeTour }
}

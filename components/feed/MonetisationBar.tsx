'use client'

import { motion } from 'framer-motion'
import { Target, TrendingUp, ChevronRight } from 'lucide-react'
import type { MonetisationGoal } from '@/types'
import { getMonetisationProgress, getMonetisationETA, formatNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'

const PLATFORM_THRESHOLDS: Record<string, { followers: number; label: string }> = {
  instagram: { followers: 10000, label: 'IG Bonuses + Subscriptions' },
  youtube: { followers: 1000, label: 'YouTube Partner Program' },
  tiktok: { followers: 10000, label: 'TikTok Creator Fund' },
  twitter: { followers: 500, label: 'X Monetisation' },
  linkedin: { followers: 1000, label: 'LinkedIn Bonuses' },
}

interface MonetisationBarProps {
  goal: MonetisationGoal
  weeklyGrowthRate?: number
  className?: string
  compact?: boolean
}

export function MonetisationBar({
  goal,
  weeklyGrowthRate = 200,
  className,
  compact = false,
}: MonetisationBarProps) {
  const progress = getMonetisationProgress(goal.current_followers, goal.target_followers)
  const eta = getMonetisationETA(goal.current_followers, goal.target_followers, weeklyGrowthRate)
  const threshold = PLATFORM_THRESHOLDS[goal.platform]
  const remaining = Math.max(0, goal.target_followers - goal.current_followers)
  const isEligible = progress >= 100

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">
              {isEligible ? 'Monetisation eligible' : `${formatNumber(remaining)} to go`}
            </span>
            <span className="text-xs font-medium text-accent">{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="h-full bg-gradient-to-r from-accent to-accent-2 rounded-full"
            />
          </div>
        </div>
        {!isEligible && (
          <span className="text-xs text-slate-500 flex-shrink-0">{eta}</span>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      'bg-surface border border-border rounded-2xl p-5',
      isEligible && 'border-emerald-500/30 bg-emerald-500/5',
      className
    )}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            isEligible ? 'bg-emerald-500/20' : 'bg-accent/20'
          )}>
            <Target size={15} className={isEligible ? 'text-emerald-400' : 'text-accent'} />
          </div>
          <div>
            <p className="text-xs text-slate-500 capitalize mb-0.5">
              {goal.platform} monetisation goal
            </p>
            <p className="text-xs text-slate-400">{threshold?.label}</p>
          </div>
        </div>

        {!isEligible && (
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-white tabular-nums">
              {formatNumber(goal.current_followers)}
            </p>
            <p className="text-xs text-slate-500">
              of {formatNumber(goal.target_followers)}
            </p>
          </div>
        )}

        {isEligible && (
          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full">
            Eligible
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative mb-3">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className={cn(
              'h-full rounded-full',
              isEligible
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : 'bg-gradient-to-r from-accent to-accent-2'
            )}
          />
        </div>
        <div
          className="absolute -top-0.5 w-3 h-3 rounded-full bg-white border-2 border-accent shadow-lg transition-all duration-1000"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      {/* Bottom row */}
      {!isEligible && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <TrendingUp size={11} />
            <span>
              At current pace: <span className="text-white font-medium">{eta}</span>
            </span>
          </div>
          <button className="flex items-center gap-1 text-accent hover:text-accent-2 transition-colors font-medium">
            <span>Post more</span>
            <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  )
}

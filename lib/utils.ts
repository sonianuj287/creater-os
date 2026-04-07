import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Platform, Niche, ContentFormat, Difficulty } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number | undefined): string {
  if (n === undefined || n === null) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

export function getViralScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-400'
  if (score >= 70) return 'text-amber-400'
  return 'text-slate-400'
}

export function getViralScoreBg(score: number): string {
  if (score >= 85) return 'bg-emerald-500/20 border-emerald-500/30'
  if (score >= 70) return 'bg-amber-500/20 border-amber-500/30'
  return 'bg-slate-500/20 border-slate-500/30'
}

export function getDifficultyColor(d: Difficulty): string {
  return { easy: 'text-emerald-400', medium: 'text-amber-400', hard: 'text-rose-400' }[d]
}

export function getPlatformColor(p: Platform): string {
  return {
    
    youtube: 'bg-red-500/20 text-red-300 border-red-500/30',
    tiktok: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    twitter: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    linkedin: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  }[p]
}

export function getFormatLabel(f: ContentFormat): string {
  return { reel: 'Reel', short: 'YT Short', carousel: 'Carousel', long_form: 'Long-form', thread: 'Thread' }[f]
}

export function getNicheEmoji(niche: Niche | string): string {
  const map: Record<string, string> = {
    finance: '💰', fitness: '💪', tech: '⚡', lifestyle: '✨',
    food: '🍜', travel: '✈️', education: '📚', gaming: '🎮', beauty: '💄', other: '🎯'
  }
  return map[niche] ?? '🎯'
}

export function getMonetisationProgress(current: number, target: number): number {
  return Math.min(Math.round((current / target) * 100), 100)
}

export function getMonetisationETA(current: number, target: number, weeklyGrowthRate: number = 200): string {
  if (current >= target) return 'Eligible now!'
  const remaining = target - current
  const weeks = Math.ceil(remaining / weeklyGrowthRate)
  if (weeks <= 4) return `~${weeks} weeks`
  const months = Math.ceil(weeks / 4)
  return `~${months} months`
}

export const NICHES: Array<{ value: Niche; label: string; emoji: string }> = [
  { value: 'finance', label: 'Finance', emoji: '💰' },
  { value: 'fitness', label: 'Fitness', emoji: '💪' },
  { value: 'tech', label: 'Tech', emoji: '⚡' },
  { value: 'lifestyle', label: 'Lifestyle', emoji: '✨' },
  { value: 'food', label: 'Food', emoji: '🍜' },
  { value: 'travel', label: 'Travel', emoji: '✈️' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'gaming', label: 'Gaming', emoji: '🎮' },
  { value: 'beauty', label: 'Beauty', emoji: '💄' },
  { value: 'other', label: 'Other', emoji: '🎯' },
]

export const PLATFORMS: Array<{ value: Platform; label: string }> = [
  
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'linkedin', label: 'LinkedIn' },
]

export const FORMATS: Array<{ value: ContentFormat; label: string; platform: string }> = [
  { value: 'reel', label: 'Reel/Short', platform: 'YouTube' },
  { value: 'short', label: 'YT Short', platform: 'YouTube' },
  { value: 'carousel', label: 'Community Post', platform: 'YouTube' },
  { value: 'long_form', label: 'Long-form', platform: 'YouTube' },
  { value: 'thread', label: 'Thread', platform: 'Twitter' },
]

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import type { FilterState, Niche, Platform, ContentFormat, Difficulty } from '@/types'
import { NICHES, PLATFORMS, FORMATS, cn } from '@/lib/utils'

interface NicheFilterProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  resultCount: number
}

const DIFFICULTIES: Array<{ value: Difficulty | 'all'; label: string }> = [
  { value: 'all', label: 'All levels' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

export function NicheFilter({ filters, onChange, resultCount }: NicheFilterProps) {
  const [open, setOpen] = useState(false)

  const hasActiveFilters =
    filters.niche !== 'all' ||
    filters.platform !== 'all' ||
    filters.format !== 'all' ||
    filters.difficulty !== 'all'

  const clearAll = () =>
    onChange({ niche: 'all', platform: 'all', format: 'all', difficulty: 'all' })

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Niche pills */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => onChange({ ...filters, niche: 'all' })}
            className={cn(
              'pill text-xs transition-all',
              filters.niche === 'all'
                ? 'bg-accent/20 border-accent/40 text-accent'
                : 'border-border text-slate-500 hover:border-border-2 hover:text-slate-300'
            )}
          >
            All niches
          </button>
          {NICHES.map((n) => (
            <button
              key={n.value}
              onClick={() =>
                onChange({
                  ...filters,
                  niche: filters.niche === n.value ? 'all' : n.value,
                })
              }
              className={cn(
                'pill text-xs transition-all',
                filters.niche === n.value
                  ? 'bg-accent/20 border-accent/40 text-accent'
                  : 'border-border text-slate-500 hover:border-border-2 hover:text-slate-300'
              )}
            >
              <span>{n.emoji}</span>
              {n.label}
            </button>
          ))}
        </div>

        {/* Advanced filter toggle */}
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'pill text-xs ml-auto flex-shrink-0 transition-all',
            open || hasActiveFilters
              ? 'bg-accent/20 border-accent/40 text-accent'
              : 'border-border text-slate-500 hover:border-border-2 hover:text-slate-300'
          )}
        >
          <SlidersHorizontal size={11} />
          Filters
          {hasActiveFilters && !open && (
            <span className="ml-1 bg-accent text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
              {[filters.platform, filters.format, filters.difficulty].filter(f => f !== 'all').length}
            </span>
          )}
        </button>
      </div>

      {/* Advanced filters panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
              {/* Platform */}
              <div>
                <p className="section-label mb-2">Platform</p>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => onChange({ ...filters, platform: 'all' })}
                    className={cn(
                      'pill text-xs transition-all',
                      filters.platform === 'all'
                        ? 'bg-accent/20 border-accent/40 text-accent'
                        : 'border-border text-slate-500 hover:border-border-2'
                    )}
                  >
                    All
                  </button>
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() =>
                        onChange({
                          ...filters,
                          platform: filters.platform === p.value ? 'all' : p.value,
                        })
                      }
                      className={cn(
                        'pill text-xs transition-all',
                        filters.platform === p.value
                          ? 'bg-accent/20 border-accent/40 text-accent'
                          : 'border-border text-slate-500 hover:border-border-2'
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div>
                <p className="section-label mb-2">Format</p>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => onChange({ ...filters, format: 'all' })}
                    className={cn(
                      'pill text-xs transition-all',
                      filters.format === 'all'
                        ? 'bg-accent/20 border-accent/40 text-accent'
                        : 'border-border text-slate-500 hover:border-border-2'
                    )}
                  >
                    All formats
                  </button>
                  {FORMATS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() =>
                        onChange({
                          ...filters,
                          format: filters.format === f.value ? 'all' : f.value,
                        })
                      }
                      className={cn(
                        'pill text-xs transition-all',
                        filters.format === f.value
                          ? 'bg-accent/20 border-accent/40 text-accent'
                          : 'border-border text-slate-500 hover:border-border-2'
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <p className="section-label mb-2">Difficulty</p>
                <div className="flex gap-1.5">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.value}
                      onClick={() =>
                        onChange({
                          ...filters,
                          difficulty: filters.difficulty === d.value ? 'all' : d.value as Difficulty | 'all',
                        })
                      }
                      className={cn(
                        'pill text-xs transition-all',
                        filters.difficulty === d.value && d.value !== 'all'
                          ? 'bg-accent/20 border-accent/40 text-accent'
                          : d.value === 'all' && filters.difficulty === 'all'
                          ? 'bg-accent/20 border-accent/40 text-accent'
                          : 'border-border text-slate-500 hover:border-border-2'
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <span className="text-xs text-slate-500">
                  {resultCount} idea{resultCount !== 1 ? 's' : ''} found
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors"
                  >
                    <X size={11} />
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

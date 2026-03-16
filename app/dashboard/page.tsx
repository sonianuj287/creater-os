'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, RefreshCw, Flame, Loader2 } from 'lucide-react'
import { IdeaCard } from '@/components/feed/IdeaCard'
import { NicheFilter } from '@/components/feed/NicheFilter'
import { MonetisationBar } from '@/components/feed/MonetisationBar'
import { getTrendingIdeas } from '@/lib/api'
import { MOCK_IDEAS, MOCK_PROFILE } from '@/lib/mock-data'
import type { FilterState, Idea } from '@/types'

const DEFAULT_FILTERS: FilterState = {
  niche: 'all', platform: 'all', format: 'all', difficulty: 'all',
}

export default function DashboardPage() {
  const [filters, setFilters]       = useState<FilterState>(DEFAULT_FILTERS)
  const [search, setSearch]         = useState('')
  const [ideas, setIdeas]           = useState<Idea[]>(MOCK_IDEAS)
  const [loading, setLoading]       = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [source, setSource]         = useState<'mock' | 'live'>('mock')

  useEffect(() => { fetchIdeas() }, [])

  async function fetchIdeas(niche = 'all') {
    setLoading(true)
    try {
      const result = await getTrendingIdeas(niche)
      if (result.ideas?.length) {
        setIdeas(result.ideas as Idea[])
        setSource('live')
      }
    } catch {
      // Backend not running yet — keep mock data silently
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    await fetchIdeas(filters.niche)
    setRefreshing(false)
  }

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      if (filters.niche !== 'all' && idea.niche !== filters.niche) return false
      if (filters.platform !== 'all' && !idea.platforms?.includes(filters.platform)) return false
      if (filters.format !== 'all' && idea.recommended_format !== filters.format) return false
      if (filters.difficulty !== 'all' && idea.difficulty !== filters.difficulty) return false
      if (search && !idea.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [ideas, filters, search])

  const topIdea = [...filteredIdeas].sort((a, b) => (b.viral_score ?? 0) - (a.viral_score ?? 0))[0]

  return (
    <div className="min-h-screen bg-canvas">
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-1">
              <Flame size={14} className="text-orange-400" />
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Trending today</span>
              {source === 'live' && (
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                  Live
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white">
              What to create <span className="text-gradient">right now</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              {' · '}{ideas.length} ideas
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            onClick={handleRefresh} disabled={refreshing}
            className="btn-outline flex items-center gap-2 flex-shrink-0"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Left: Feed */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text" placeholder="Search ideas..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="input w-full pl-9"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <NicheFilter filters={filters} onChange={setFilters} resultCount={filteredIdeas.length} />
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center py-20 text-slate-600">
                <Loader2 size={20} className="animate-spin mr-2" />
                <span className="text-sm">Fetching live trending ideas...</span>
              </div>
            ) : filteredIdeas.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-500 text-sm">No ideas match your filters.</p>
                <button onClick={() => { setFilters(DEFAULT_FILTERS); setSearch('') }} className="text-accent text-sm mt-2 hover:underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredIdeas.map((idea, i) => (
                  <IdeaCard key={idea.id ?? i} idea={idea} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
            {MOCK_PROFILE.monetisation_goal && (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                <p className="section-label mb-2 px-1">Your goal</p>
                <MonetisationBar goal={MOCK_PROFILE.monetisation_goal} />
              </motion.div>
            )}

            {topIdea && (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                <p className="section-label mb-2 px-1">Today's top pick</p>
                <div className="bg-surface border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🔥</span>
                    <span className="text-xs text-slate-400 font-medium">Score {topIdea.viral_score}/100</span>
                  </div>
                  <p className="text-sm font-semibold text-white mb-1 leading-snug">{topIdea.title}</p>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed line-clamp-2">{topIdea.description}</p>
                  <button
                    onClick={() => window.location.href = `/dashboard/idea/${topIdea.id}`}
                    className="btn-primary w-full text-center text-xs"
                  >
                    Start this idea
                  </button>
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
              <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4">
                <p className="text-sm font-semibold text-white mb-1">Generate your own idea</p>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">Describe a topic and get 5 angles with viral hooks.</p>
                <a href="/dashboard/studio" className="btn-primary w-full text-xs text-center block py-2">
                  Open Idea Studio
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

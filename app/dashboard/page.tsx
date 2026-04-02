'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, RefreshCw, Flame, Loader2, Sparkles, Combine } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { IdeaCard } from '@/components/feed/IdeaCard'
import { NicheFilter } from '@/components/feed/NicheFilter'
import { MonetisationBar } from '@/components/feed/MonetisationBar'
import { getTrendingIdeas, generateIdeas } from '@/lib/api'
import { MOCK_IDEAS } from '@/lib/mock-data'
import { createClient } from '@/lib/supabase'
import type { FilterState, Idea, MonetisationGoal } from '@/types'
import { cn, getNicheEmoji } from '@/lib/utils'
import { OnboardingTour, useTour } from '@/components/ui/OnboardingTour'
import { HeroCarousel } from '@/components/feed/HeroCarousel'
import { LottiePlayer } from '@/components/ui/LottiePlayer'
import { SprintWidget } from '@/components/dashboard/SprintWidget'

const DEFAULT_FILTERS: FilterState = {
  niche: 'all', platform: 'all', format: 'all', difficulty: 'all',
}

export default function DashboardPage() {
  const router = useRouter()
  const { showTour, completeTour } = useTour()
  const [filters, setFilters]         = useState<FilterState>(DEFAULT_FILTERS)
  const [search, setSearch]           = useState('')
  const [ideas, setIdeas]             = useState<Idea[]>(MOCK_IDEAS)
  const [loading, setLoading]         = useState(false)
  const [refreshing, setRefreshing]   = useState(false)
  const [source, setSource]           = useState<'mock' | 'live'>('mock')
  const [profile, setProfile]         = useState<any>(null)
  const [monetGoal, setMonetGoal]     = useState<MonetisationGoal | null>(null)
  const [combineLoading, setCombineLoading] = useState(false)
  const [combinedIdea, setCombinedIdea]     = useState<any>(null)

  useEffect(() => {
    loadProfile()
    fetchIdeas()
  }, [])

  async function loadProfile() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setProfile(data)
      if (data.monetisation_goal) setMonetGoal(data.monetisation_goal)
      // Set niche filter if user has a niche set
      if (data.niche) setFilters(f => ({ ...f, niche: data.niche }))
    }
  }

  async function fetchIdeas(niche = 'all') {
    setLoading(true)
    try {
      const result = await getTrendingIdeas(niche)
      if (result.ideas?.length) {
        setIdeas(result.ideas as Idea[])
        setSource('live')
      }
    } catch {
      // keep mock data
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    await fetchIdeas(filters.niche)
    setRefreshing(false)
  }

  // "Combine ideas" — takes last 2 ideas user viewed and creates a mashup
  async function handleCombineIdeas() {
    if (!profile) return
    setCombineLoading(true)
    setCombinedIdea(null)
    try {
      const topTwo = filteredIdeas.slice(0, 2)
      if (topTwo.length < 2) return
      const prompt = `Combine these two ideas into one unique video concept: "${topTwo[0].title}" and "${topTwo[1].title}"`
      const result = await generateIdeas({
        user_id: profile.id,
        prompt,
        niche: profile.niche ?? 'lifestyle',
        platforms: profile.platforms ?? ['instagram'],
        num_ideas: 1,
      })
      if (result.ideas?.[0]) setCombinedIdea(result.ideas[0])
    } catch (e) {
      console.error(e)
    } finally {
      setCombineLoading(false)
    }
  }

  // Carousel: always shows ALL ideas sorted by viral score — never goes blank when a niche has no ideas
  const carouselIdeas = useMemo(() => {
    return [...ideas]
      .sort((a, b) => (b.viral_score ?? 0) - (a.viral_score ?? 0))
      .slice(0, 6)
  }, [ideas])

  // Filtered stream: respects every active filter for the idea list below the carousel
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
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">Live</span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white">
              {profile?.niche
                ? <>What's trending in <span className="text-gradient capitalize">{profile.niche} {getNicheEmoji(profile.niche)}</span></>
                : <>What to create <span className="text-gradient">right now</span></>
              }
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              {' · '}{filteredIdeas.length} ideas
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

        {/* 3D HERO CAROUSEL — always shows top ideas across ALL niches */}
        {!loading && carouselIdeas.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <HeroCarousel ideas={carouselIdeas} />
            <p className="text-center text-[11px] text-slate-600 -mt-4 mb-2 tracking-wide">
              ✦ Showing top trending ideas across <span className="text-slate-500 font-semibold">all niches</span> — use the filters below to see your niche
            </p>
          </motion.div>
        )}


        {/* Main Feed + Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 lg:mt-8">
          {/* Feed */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search ideas..." value={search} onChange={e => setSearch(e.target.value)} className="input w-full pl-9" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <NicheFilter filters={filters} onChange={setFilters} resultCount={filteredIdeas.length} />
            </motion.div>

            {/* Combine ideas button */}
            {filteredIdeas.length >= 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <button
                  onClick={handleCombineIdeas}
                  disabled={combineLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-accent/30 bg-accent/5 hover:bg-accent/10 text-accent text-xs font-medium transition-all disabled:opacity-50"
                >
                  {combineLoading
                    ? <><Loader2 size={13} className="animate-spin" />Generating mashup idea...</>
                    : <><Combine size={13} />Combine top 2 ideas into something new</>
                  }
                </button>

                {/* Combined idea result */}
                {combinedIdea && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-4 bg-accent/10 border border-accent/30 rounded-xl"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={12} className="text-accent" />
                      <p className="text-xs font-semibold text-accent">AI mashup idea</p>
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">{combinedIdea.title}</p>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">{combinedIdea.description}</p>
                    {combinedIdea.hooks?.[0] && (
                      <p className="text-xs text-slate-300 italic border-l-2 border-accent/40 pl-3">
                        "{combinedIdea.hooks[0].text}"
                      </p>
                    )}
                    <button
                      onClick={() => router.push(`/dashboard/guide?title=${encodeURIComponent(combinedIdea.title)}`)}
                      className="mt-3 btn-primary text-xs py-2"
                    >
                      Use this idea →
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                <LottiePlayer preset="loading-ai" size={100} className="mb-3" />
                <span className="text-sm text-slate-500 font-medium">Fetching trending ideas...</span>
              </div>
            ) : filteredIdeas.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-3xl mb-3">
                  {filters.niche !== 'all' ? getNicheEmoji(filters.niche) : '🔍'}
                </p>
                <p className="text-white font-semibold text-sm mb-1">
                  {filters.niche !== 'all'
                    ? `No ideas yet for "${filters.niche}"`
                    : 'No ideas match your filters'}
                </p>
                <p className="text-slate-500 text-xs mb-5 max-w-xs mx-auto leading-relaxed">
                  {filters.niche !== 'all'
                    ? 'The carousel above still shows ideas from all niches. Clear the filter to browse everything.'
                    : 'Try adjusting your search or removing a filter.'}
                </p>
                <button
                  onClick={() => { setFilters(DEFAULT_FILTERS); setSearch('') }}
                  className="text-accent text-sm font-medium hover:underline"
                >
                  Clear all filters →
                </button>
              </div>

            ) : (
              <div className="mt-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px bg-white/10 flex-grow" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest text-shadow-sm">The Idea Stream</span>
                  <div className="h-px bg-white/10 flex-grow" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 auto-rows-max">
                  {filteredIdeas.slice(Math.min(5, filteredIdeas.length)).map((idea, i) => {
                    // Bento Asymmetry pattern calculation
                    const mod = i % 5
                    let size: 'standard' | 'wide' | 'tall' | 'featured' = 'standard'
                    if (mod === 0) size = 'wide'         // Stretch across both columns
                    if (mod === 3) size = 'featured'     // Massive 2x2 focus block
                    
                    return <IdeaCard key={idea.id ?? i} idea={idea} index={i} size={size} />
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Monetisation goal — real data */}
            {monetGoal ? (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                <p className="section-label mb-2 px-1">Your goal</p>
                <MonetisationBar goal={monetGoal} />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
                className="bg-surface border border-border rounded-2xl p-4"
              >
                <p className="text-sm font-medium text-white mb-1">Set your goal</p>
                <p className="text-xs text-slate-500 mb-3">Track your path to monetisation.</p>
                <a href="/auth/onboarding" className="btn-primary text-xs py-2 block text-center">Set goal →</a>
              </motion.div>
            )}

            {/* Sprint Widget */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <SprintWidget />
            </motion.div>

            {/* Top pick */}
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
                    onClick={() => router.push(`/dashboard/idea/${topIdea.id}`)}
                    className="btn-primary w-full text-center text-xs py-2"
                  >
                    Start this idea
                  </button>
                </div>
              </motion.div>
            )}

            {/* Niche personalisation nudge */}
            {!profile?.niche && (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-amber-400 mb-1">Personalise your feed</p>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    Set your niche to get ideas tailored to your content style.
                  </p>
                  <a href="/auth/onboarding" className="btn-outline text-xs py-2 block text-center">
                    Set your niche →
                  </a>
                </div>
              </motion.div>
            )}

            {/* Studio CTA */}
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
      {/* First-time tour */}
      {showTour && <OnboardingTour onComplete={completeTour} />}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, Eye, Heart, Bookmark, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { MonetisationBar } from '@/components/feed/MonetisationBar'
import { cn, formatNumber } from '@/lib/utils'
import type { MonetisationGoal } from '@/types'

interface AnalyticsSnapshot {
  id: string
  post_id: string
  platform: string
  views: number
  likes: number
  saves: number
  shares: number
  followers_gained: number
  total_followers: number
  snapshot_at: string
}

interface ScheduledPost {
  id: string
  platform: string
  caption: string
  scheduled_for: string
  status: string
  posted_at: string | null
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  youtube:   'bg-red-500/20 text-red-300 border-red-500/30',
  tiktok:    'bg-slate-500/20 text-slate-300 border-slate-500/30',
  twitter:   'bg-sky-500/20 text-sky-300 border-sky-500/30',
  linkedin:  'bg-blue-500/20 text-blue-300 border-blue-500/30',
}

function StatCard({ label, value, icon: Icon, trend }: {
  label: string; value: string | number; icon: any; trend?: number
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500">{label}</p>
        <Icon size={13} className="text-slate-600" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {trend !== undefined && (
        <p className={cn('text-xs mt-1', trend >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
          {trend >= 0 ? '+' : ''}{trend}% this week
        </p>
      )}
    </div>
  )
}

export default function AnalyticsPage() {
  const [snapshots, setSnapshots]   = useState<AnalyticsSnapshot[]>([])
  const [posts, setPosts]           = useState<ScheduledPost[]>([])
  const [profile, setProfile]       = useState<any>(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [snapshotRes, postRes, profileRes] = await Promise.all([
      supabase.from('analytics_snapshots').select('*').eq('user_id', user.id).order('snapshot_at', { ascending: false }).limit(50),
      supabase.from('scheduled_posts').select('*').eq('user_id', user.id).order('scheduled_for', { ascending: false }).limit(20),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])

    setSnapshots(snapshotRes.data ?? [])
    setPosts(postRes.data ?? [])
    setProfile(profileRes.data)
    setLoading(false)
  }

  // Aggregate totals
  const totals = snapshots.reduce((acc, s) => ({
    views:            acc.views + (s.views ?? 0),
    likes:            acc.likes + (s.likes ?? 0),
    saves:            acc.saves + (s.saves ?? 0),
    followers_gained: acc.followers_gained + (s.followers_gained ?? 0),
  }), { views: 0, likes: 0, saves: 0, followers_gained: 0 })

  const monetisationGoal: MonetisationGoal | null = profile?.monetisation_goal ?? null

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-slate-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={14} className="text-accent" />
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Your <span className="text-gradient">growth</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track how your content is performing across platforms.
          </p>
        </motion.div>

        {/* Monetisation goal */}
        {monetisationGoal && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <p className="section-label mb-2">Monetisation progress</p>
            <MonetisationBar goal={monetisationGoal} />
          </motion.div>
        )}

        {snapshots.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Stat placeholders */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total views',      icon: Eye,     value: '—' },
                { label: 'Total likes',      icon: Heart,   value: '—' },
                { label: 'Total saves',      icon: Bookmark,value: '—' },
                { label: 'Followers gained', icon: Users,   value: '—' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  <StatCard label={s.label} value={s.value} icon={s.icon} />
                </motion.div>
              ))}
            </div>

            <div className="bg-surface border border-border rounded-2xl p-8 text-center">
              <BarChart3 size={28} className="text-slate-600 mx-auto mb-3" />
              <p className="text-white font-semibold mb-1">No data yet</p>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                Analytics will appear here after you connect your accounts and start posting.
                Data is pulled 48 hours after each post.
              </p>
              <div className="flex gap-3 justify-center">
                <a href="/dashboard/publish" className="btn-primary text-xs py-2 px-4">
                  Go to Publish
                </a>
                <a href="/dashboard/editor" className="btn-outline text-xs py-2 px-4">
                  Process a video
                </a>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Total views"      value={formatNumber(totals.views)}            icon={Eye} />
              <StatCard label="Total likes"      value={formatNumber(totals.likes)}            icon={Heart} />
              <StatCard label="Total saves"      value={formatNumber(totals.saves)}            icon={Bookmark} />
              <StatCard label="Followers gained" value={`+${totals.followers_gained}`}         icon={Users} />
            </div>

            {/* Recent posts */}
            <div>
              <p className="section-label mb-3">Posted content</p>
              <div className="space-y-3">
                {posts.filter(p => p.status === 'posted').map((post, i) => {
                  const snap = snapshots.find(s => s.post_id === post.id)
                  return (
                    <div key={post.id} className="bg-surface border border-border rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{post.caption?.slice(0, 60)}...</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(post.posted_at ?? post.scheduled_for).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className={cn('pill text-[10px] flex-shrink-0', PLATFORM_COLORS[post.platform])}>
                          {post.platform}
                        </span>
                      </div>
                      {snap ? (
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: 'Views',   value: formatNumber(snap.views) },
                            { label: 'Likes',   value: formatNumber(snap.likes) },
                            { label: 'Saves',   value: formatNumber(snap.saves) },
                            { label: 'Follows', value: `+${snap.followers_gained}` },
                          ].map(s => (
                            <div key={s.label} className="text-center">
                              <p className="text-sm font-bold text-white">{s.value}</p>
                              <p className="text-[10px] text-slate-600">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600">Analytics pending (48h after post)</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Scheduled posts */}
            {posts.filter(p => p.status === 'scheduled').length > 0 && (
              <div>
                <p className="section-label mb-3">Upcoming posts</p>
                <div className="space-y-2.5">
                  {posts.filter(p => p.status === 'scheduled').map(post => (
                    <div key={post.id} className="flex items-center justify-between p-3.5 bg-surface border border-border rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className={cn('pill text-[10px]', PLATFORM_COLORS[post.platform])}>
                          {post.platform}
                        </span>
                        <p className="text-sm text-slate-300 truncate max-w-xs">
                          {post.caption?.slice(0, 50)}...
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 flex-shrink-0">
                        {new Date(post.scheduled_for).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, Users, Eye, Heart,
  Bookmark, Loader2, ArrowUp, ArrowDown,
  Film, Calendar, Zap, Target,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { MonetisationBar } from '@/components/feed/MonetisationBar'
import { cn, formatNumber } from '@/lib/utils'
import type { MonetisationGoal } from '@/types'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  youtube:   'bg-red-500/20 text-red-300 border-red-500/30',
  tiktok:    'bg-slate-500/20 text-slate-300 border-slate-500/30',
  twitter:   'bg-sky-500/20 text-sky-300 border-sky-500/30',
}

function StatCard({ label, value, icon: Icon, sub, trend, color }: {
  label: string; value: string | number; icon: any; sub?: string; trend?: number; color?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500">{label}</p>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', color ?? 'bg-accent/15')}>
          <Icon size={14} className={color ? 'text-white' : 'text-accent'} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
      {trend !== undefined && (
        <div className={cn('flex items-center gap-1 text-xs mt-1', trend >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
          {trend >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
          {Math.abs(trend)}% vs last week
        </div>
      )}
    </motion.div>
  )
}

function BarChart({ data, label }: { data: number[]; label: string }) {
  const max = Math.max(...data, 1)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return (
    <div>
      <p className="text-xs text-slate-500 mb-3">{label}</p>
      <div className="flex items-end gap-1.5 h-20">
        {data.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-accent/30 rounded-sm transition-all"
              style={{ height: `${(v / max) * 64}px`, minHeight: v > 0 ? '4px' : '0' }}
            />
            <span className="text-[9px] text-slate-600">{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [snapshots, setSnapshots]   = useState<any[]>([])
  const [posts, setPosts]           = useState<any[]>([])
  const [profile, setProfile]       = useState<any>(null)
  const [connected, setConnected]   = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [pulling, setPulling]       = useState(false)
  const [pullMessage, setPullMessage] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [snapRes, postRes, profileRes, connRes] = await Promise.all([
      supabase.from('analytics_snapshots').select('*').eq('user_id', user.id).order('snapshot_at', { ascending: false }).limit(100),
      supabase.from('scheduled_posts').select('*').eq('user_id', user.id).order('scheduled_for', { ascending: false }).limit(30),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('connected_accounts').select('*').eq('user_id', user.id).eq('is_active', true),
    ])

    setSnapshots(snapRes.data ?? [])
    setPosts(postRes.data ?? [])
    setProfile(profileRes.data)
    setConnected(connRes.data ?? [])
    setLoading(false)
  }

  async function pullAnalytics() {
    setPulling(true); setPullMessage('Pulling analytics from platforms...')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const resp = await fetch(`${BACKEND}/publish/analytics/pull`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      })
      const data = await resp.json()
      setPullMessage(data.message ?? 'Done!')
      await loadData()
    } catch {
      setPullMessage('Could not pull analytics. Try again later.')
    } finally {
      setPulling(false)
    }
  }

  // Aggregate totals
  const totals = snapshots.reduce((acc, s) => ({
    views:            acc.views + (s.views ?? 0),
    likes:            acc.likes + (s.likes ?? 0),
    saves:            acc.saves + (s.saves ?? 0),
    followers_gained: acc.followers_gained + (s.followers_gained ?? 0),
  }), { views: 0, likes: 0, saves: 0, followers_gained: 0 })

  // Posts per day last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    return snapshots.filter(s => s.snapshot_at?.startsWith(dateStr)).reduce((a, s) => a + (s.views ?? 0), 0)
  })

  const monetisationGoal: MonetisationGoal | null = profile?.monetisation_goal ?? null
  const postedCount = posts.filter(p => p.status === 'posted').length
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length

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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={14} className="text-accent" />
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Analytics</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Your <span className="text-gradient">growth</span></h1>
              <p className="text-sm text-slate-500 mt-1">Track performance across all platforms.</p>
            </div>
            <button
              onClick={pullAnalytics} disabled={pulling}
              className="btn-outline flex items-center gap-2 text-xs"
            >
              {pulling ? <Loader2 size={12} className="animate-spin" /> : <TrendingUp size={12} />}
              {pulling ? 'Pulling...' : 'Refresh data'}
            </button>
          </div>
          {pullMessage && <p className="text-xs text-slate-500 mt-2">{pullMessage}</p>}
        </motion.div>

        {/* Monetisation progress */}
        {monetisationGoal && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
            <p className="section-label mb-2">Monetisation progress</p>
            <MonetisationBar goal={monetisationGoal} />
          </motion.div>
        )}

        {/* Connected accounts follower counts */}
        {connected.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
            <p className="section-label mb-3">Connected accounts</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {connected.map((acc, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-4 text-center">
                  <span className={cn('pill text-[10px] mb-2 inline-block', PLATFORM_COLORS[acc.platform] ?? 'bg-slate-500/20 text-slate-300')}>
                    {acc.platform}
                  </span>
                  <p className="text-lg font-bold text-white">{formatNumber(acc.follower_count ?? 0)}</p>
                  <p className="text-[10px] text-slate-500">@{acc.platform_username}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {snapshots.length === 0 ? (
          /* Empty state */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard label="Total views"      value="—" icon={Eye}      color="bg-blue-500/20" />
              <StatCard label="Total likes"      value="—" icon={Heart}    color="bg-pink-500/20" />
              <StatCard label="Total saves"      value="—" icon={Bookmark} color="bg-purple-500/20" />
              <StatCard label="Posts published"  value={postedCount} icon={Film} sub={`${scheduledCount} scheduled`} />
            </div>

            <div className="bg-surface border border-border rounded-2xl p-8 text-center">
              <BarChart3 size={28} className="text-slate-600 mx-auto mb-3" />
              <p className="text-white font-semibold mb-1">No analytics data yet</p>
              <p className="text-sm text-slate-500 mb-2 leading-relaxed">
                Analytics are pulled 48 hours after you post. Start by posting content from the Publish page.
              </p>
              {connected.length === 0 && (
                <p className="text-xs text-amber-400 mb-4">Connect your Instagram or YouTube account first.</p>
              )}
              <div className="flex gap-3 justify-center">
                <a href="/dashboard/publish" className="btn-primary text-xs py-2 px-4">Go to Publish</a>
                {connected.length === 0 && (
                  <a href="/dashboard/publish" className="btn-outline text-xs py-2 px-4">Connect accounts</a>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Total views"      value={formatNumber(totals.views)}            icon={Eye}      color="bg-blue-500/20" />
              <StatCard label="Total likes"      value={formatNumber(totals.likes)}            icon={Heart}    color="bg-pink-500/20" />
              <StatCard label="Total saves"      value={formatNumber(totals.saves)}            icon={Bookmark} color="bg-purple-500/20" />
              <StatCard label="Followers gained" value={`+${totals.followers_gained}`}         icon={Users}    color="bg-emerald-500/20" />
            </div>

            {/* Views chart */}
            <div className="bg-surface border border-border rounded-2xl p-5">
              <BarChart data={last7} label="Views — last 7 days" />
            </div>

            {/* Post performance */}
            <div>
              <p className="section-label mb-3">Post performance</p>
              <div className="space-y-3">
                {posts.filter(p => p.status === 'posted').map((post, i) => {
                  const snap = snapshots.find(s => s.post_id === post.id)
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-surface border border-border rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{post.caption?.slice(0, 50)}...</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(post.posted_at ?? post.scheduled_for).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className={cn('pill text-[10px] flex-shrink-0', PLATFORM_COLORS[post.platform] ?? '')}>
                          {post.platform}
                        </span>
                      </div>
                      {snap ? (
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: 'Views',   value: formatNumber(snap.views),   color: 'text-blue-400' },
                            { label: 'Likes',   value: formatNumber(snap.likes),   color: 'text-pink-400' },
                            { label: 'Saves',   value: formatNumber(snap.saves),   color: 'text-purple-400' },
                            { label: 'Follows', value: `+${snap.followers_gained}`, color: 'text-emerald-400' },
                          ].map(s => (
                            <div key={s.label} className="text-center bg-white/[0.03] rounded-lg py-2">
                              <p className={cn('text-sm font-bold', s.color)}>{s.value}</p>
                              <p className="text-[10px] text-slate-600">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600 bg-white/[0.03] rounded-lg py-2 px-3">
                          Analytics pending — data available 48h after posting
                        </p>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Scheduled upcoming */}
            {posts.filter(p => p.status === 'scheduled').length > 0 && (
              <div>
                <p className="section-label mb-3">Upcoming ({scheduledCount})</p>
                <div className="space-y-2">
                  {posts.filter(p => p.status === 'scheduled').map(post => (
                    <div key={post.id} className="flex items-center justify-between p-3.5 bg-surface border border-border rounded-xl">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={cn('pill text-[10px] flex-shrink-0', PLATFORM_COLORS[post.platform] ?? '')}>{post.platform}</span>
                        <p className="text-xs text-slate-300 truncate">{post.caption?.slice(0, 50)}...</p>
                      </div>
                      <p className="text-xs text-slate-500 flex-shrink-0 flex items-center gap-1 ml-3">
                        <Calendar size={10} />
                        {new Date(post.scheduled_for).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
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

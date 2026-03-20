'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', desc: 'Reels, carousels, feed posts', comingSoon: false },
  { id: 'youtube',   label: 'YouTube',   desc: 'Shorts and long-form videos',  comingSoon: false },
  { id: 'twitter',   label: 'Twitter / X', desc: 'Tweets and video posts',     comingSoon: true  },
  { id: 'tiktok',    label: 'TikTok',    desc: 'Short video posts',             comingSoon: true  },
  { id: 'linkedin',  label: 'LinkedIn',  desc: 'Professional content',          comingSoon: true  },
]

const COLORS: Record<string, string> = {
  instagram: 'bg-pink-500/15 border-pink-500/30 text-pink-300',
  youtube:   'bg-red-500/15 border-red-500/30 text-red-300',
  twitter:   'bg-sky-500/15 border-sky-500/30 text-sky-300',
  tiktok:    'bg-slate-500/15 border-slate-500/30 text-slate-300',
  linkedin:  'bg-blue-500/15 border-blue-500/30 text-blue-300',
}

const ACTIVE_COLORS: Record<string, string> = {
  instagram: 'bg-pink-500/20 border-pink-500/50',
  youtube:   'bg-red-500/20 border-red-500/50',
  twitter:   'bg-sky-500/20 border-sky-500/50',
  tiktok:    'bg-slate-500/20 border-slate-500/50',
  linkedin:  'bg-blue-500/20 border-blue-500/50',
}

export function PlatformConnections() {
  const [connected, setConnected] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [userId, setUserId]       = useState('')
  const searchParams              = useSearchParams()

  useEffect(() => {
    loadConnections()
    // Show success toast if redirected back from OAuth
    const connectedPlatform = searchParams.get('connected')
    if (connectedPlatform) {
      loadConnections()
    }
  }, [])

  async function loadConnections() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const { data } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    setConnected(data ?? [])
    setLoading(false)
  }

  function getConnection(platformId: string) {
    return connected.find(c => c.platform === platformId)
  }

  function handleConnect(platformId: string) {
    if (!userId) return
    // Redirect to backend OAuth flow
    window.location.href = `${BACKEND}/publish/${platformId}/connect?user_id=${userId}`
  }

  async function handleDisconnect(platformId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('connected_accounts')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('platform', platformId)
    loadConnections()
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {PLATFORMS.map((platform, i) => {
        const connection = getConnection(platform.id)
        const isConnected = !!connection
        return (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={cn(
              'flex items-center justify-between p-4 rounded-xl border transition-all',
              isConnected ? ACTIVE_COLORS[platform.id] : 'border-border bg-surface'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border', COLORS[platform.id])}>
                {platform.label.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{platform.label}</p>
                  {platform.comingSoon && (
                    <span className="text-[10px] bg-white/10 text-slate-500 px-2 py-0.5 rounded-full">Soon</span>
                  )}
                </div>
                {isConnected ? (
                  <p className="text-xs text-slate-400">
                    @{connection.platform_username}
                    {connection.follower_count > 0 && (
                      <span className="ml-1.5 text-slate-500">· {connection.follower_count.toLocaleString()} followers</span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">{platform.desc}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <CheckCircle size={14} className="text-emerald-400" />
                  <button onClick={() => handleDisconnect(platform.id)} className="text-xs text-slate-500 hover:text-rose-400 transition-colors">
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={() => !platform.comingSoon && handleConnect(platform.id)}
                  disabled={platform.comingSoon}
                  className={cn(
                    'text-xs font-medium px-3 py-1.5 rounded-lg border transition-all',
                    platform.comingSoon
                      ? 'border-border text-slate-600 cursor-not-allowed'
                      : 'border-border-2 text-slate-300 hover:text-white hover:border-white/30 hover:bg-white/5'
                  )}
                >
                  {platform.comingSoon ? 'Coming soon' : 'Connect'}
                </button>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

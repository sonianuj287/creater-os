'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const PLATFORMS = [
  {
    id: 'instagram',
    label: 'Instagram',
    color: 'bg-pink-500/15 border-pink-500/30 text-pink-300',
    activeColor: 'bg-pink-500/20 border-pink-500/50',
    description: 'Reels, carousels, feed posts',
    comingSoon: false,
  },
  {
    id: 'youtube',
    label: 'YouTube',
    color: 'bg-red-500/15 border-red-500/30 text-red-300',
    activeColor: 'bg-red-500/20 border-red-500/50',
    description: 'Shorts and long-form videos',
    comingSoon: false,
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    color: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
    activeColor: 'bg-sky-500/20 border-sky-500/50',
    description: 'Tweets and video posts',
    comingSoon: true,
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    color: 'bg-slate-500/15 border-slate-500/30 text-slate-300',
    activeColor: 'bg-slate-500/20 border-slate-500/50',
    description: 'Short video posts',
    comingSoon: true,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    color: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
    activeColor: 'bg-blue-500/20 border-blue-500/50',
    description: 'Professional content',
    comingSoon: true,
  },
]

interface ConnectedAccount {
  platform: string
  platform_username: string
  follower_count: number
  is_active: boolean
}

export function PlatformConnections() {
  const [connected, setConnected] = useState<ConnectedAccount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConnections()
  }, [])

  async function loadConnections() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

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

  async function handleConnect(platformId: string) {
    // OAuth flow will be implemented when API keys are ready
    // For now show a placeholder
    alert(`${platformId} OAuth coming soon. Setting up Facebook Developer access first.`)
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
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
        ))}
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
              isConnected ? platform.activeColor : 'border-border bg-surface'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border', platform.color)}>
                {platform.label.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{platform.label}</p>
                  {platform.comingSoon && (
                    <span className="text-[10px] bg-white/10 text-slate-500 px-2 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                </div>
                {isConnected ? (
                  <p className="text-xs text-slate-400">
                    @{connection.platform_username}
                    {connection.follower_count > 0 && (
                      <span className="ml-1.5 text-slate-500">
                        · {connection.follower_count.toLocaleString()} followers
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">{platform.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <CheckCircle size={14} className="text-emerald-400" />
                  <button
                    onClick={() => handleDisconnect(platform.id)}
                    className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
                  >
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

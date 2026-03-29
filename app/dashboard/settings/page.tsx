'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Zap, CheckCircle, Loader2, ExternalLink, Gift, Layers } from 'lucide-react'
import { GiftCardInput } from '@/components/ui/GiftCard'
import { PlatformConnections } from '@/components/publish/PlatformConnections'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'
const APP_URL  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://creater-os-sonianuj287s-projects.vercel.app'

const PLANS = [
  {
    id:    'free',
    name:  'Free',
    price: '₹0',
    period: '',
    color: 'border-border',
    features: [
      '2 idea generations / month',
      '2 video uploads / month',
      '1 format export per video',
      'Watermark on exports',
      'No scheduling',
    ],
    cta: 'Current plan',
    disabled: true,
  },
  {
    id:    'creator',
    name:  'Creator',
    price: '₹100',
    period: '/month',
    color: 'border-accent/50',
    badge: 'Most popular',
    features: [
      '50 idea generations / month',
      '20 video uploads / month',
      '3 format exports per video',
      'No watermark',
      'Scheduling enabled',
      'All AI features',
    ],
    cta: 'Upgrade to Creator',
    disabled: false,
  },
  {
    id:    'pro',
    name:  'Pro',
    price: '₹350',
    period: '/month',
    color: 'border-purple-500/40',
    features: [
      'Unlimited ideas + uploads',
      'Unlimited exports',
      'No watermark',
      'Priority processing',
      'Analytics dashboard',
      'White-label exports',
    ],
    cta: 'Upgrade to Pro',
    disabled: false,
  },
]

export default function SettingsPage() {
  const [profile, setProfile]   = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile({ ...data, email: user.email })
    setLoading(false)
  }

  async function handleUpgrade(planId: string) {
    if (!profile) return
    setUpgrading(planId)

    try {
      const resp = await fetch(`${BACKEND}/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:     profile.id,
          user_email:  profile.email,
          plan:        planId,
          success_url: `${APP_URL}/dashboard/settings?upgraded=true`,
          cancel_url:  `${APP_URL}/dashboard/settings`,
        }),
      })

      if (!resp.ok) throw new Error('Failed to create checkout')
      const data = await resp.json()
      window.location.href = data.checkout_url

    } catch (e: any) {
      alert(e.message ?? 'Upgrade failed')
      setUpgrading(null)
    }
  }

  async function handleManageBilling() {
    if (!profile) return

    try {
      const resp = await fetch(`${BACKEND}/billing/portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:    profile.id,
          return_url: `${APP_URL}/dashboard/settings`,
        }),
      })
      const data = await resp.json()
      window.location.href = data.portal_url
    } catch (e) {
      alert('Could not open billing portal')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-slate-600" />
      </div>
    )
  }

  const currentPlan = profile?.plan ?? 'free'

  return (
    <div className="min-h-screen bg-canvas">
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Settings size={14} className="text-accent" />
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Settings</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Account settings</h1>
        </motion.div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-border rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-sm font-semibold text-accent">
                {profile?.full_name?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{profile?.full_name ?? 'Creator'}</p>
                <p className="text-xs text-slate-500">{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-xs font-semibold px-3 py-1 rounded-full border capitalize',
                currentPlan === 'pro'     ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' :
                currentPlan === 'creator' ? 'bg-accent/20 border-accent/40 text-accent' :
                'bg-white/5 border-border text-slate-400'
              )}>
                {currentPlan} plan
              </span>
              {currentPlan !== 'free' && (
                <button
                  onClick={handleManageBilling}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors"
                >
                  <ExternalLink size={11} />
                  Manage billing
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Pricing plans */}
        <div>
          <p className="section-label mb-4">Choose your plan</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan, i) => {
              const isCurrent = currentPlan === plan.id
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={cn(
                    'relative bg-surface rounded-2xl p-5 border-2 transition-all',
                    isCurrent ? 'border-emerald-500/40 bg-emerald-500/5' : plan.color
                  )}
                >
                  {plan.badge && !isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-accent text-white px-3 py-1 rounded-full whitespace-nowrap">
                      {plan.badge}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-emerald-500 text-white px-3 py-1 rounded-full whitespace-nowrap">
                      Current plan
                    </span>
                  )}

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-white mb-1">{plan.name}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">{plan.price}</span>
                      <span className="text-xs text-slate-500">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-5">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-slate-400">
                        <CheckCircle size={12} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => !isCurrent && !plan.disabled && handleUpgrade(plan.id)}
                    disabled={isCurrent || plan.disabled || upgrading === plan.id}
                    className={cn(
                      'w-full py-2.5 rounded-xl text-xs font-semibold transition-all',
                      isCurrent
                        ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                        : plan.disabled
                        ? 'bg-white/5 text-slate-600 cursor-default'
                        : 'btn-primary'
                    )}
                  >
                    {upgrading === plan.id ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Loader2 size={12} className="animate-spin" />
                        Redirecting...
                      </span>
                    ) : isCurrent ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <CheckCircle size={12} />
                        Active
                      </span>
                    ) : (
                      plan.cta
                    )}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Gift card redemption */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <p className="section-label mb-4 flex items-center gap-2">
            <Gift size={12} className="text-accent" />
            Have a gift card?
          </p>
          <GiftCardInput onSuccess={(plan) => {
            window.location.reload()
          }} />
        </motion.div>

        {/* Connected Accounts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          className="mt-8 bg-surface border border-border rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Layers size={14} className="text-accent" />
            <p className="text-sm font-semibold text-white">Connected accounts</p>
          </div>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">Connect your YouTube and Instagram accounts to post directly from the dashboard and pull analytics.</p>
          <PlatformConnections />
        </motion.div>

        {/* Profile settings */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-surface border border-border rounded-2xl p-5"
        >
          <p className="text-sm font-semibold text-white mb-4">Content preferences</p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-500 mb-1">Niche</p>
              <p className="text-white capitalize">{profile?.niche?.split(',').join(', ') ?? '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Platforms</p>
              <p className="text-white capitalize">{profile?.platforms?.join(', ') ?? '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Monetisation goal</p>
              <p className="text-white capitalize">
                {profile?.monetisation_goal
                  ? `${profile.monetisation_goal.platform} · ${profile.monetisation_goal.target_followers?.toLocaleString()} followers`
                  : '—'}
              </p>
            </div>
          </div>
          <a href="/auth/onboarding" className="mt-4 text-xs text-accent hover:underline block">
            Update preferences →
          </a>
        </motion.div>
      </div>
    </div>
  )
}

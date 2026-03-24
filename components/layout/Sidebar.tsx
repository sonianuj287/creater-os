'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Lightbulb, Film, SendHorizonal,
  BarChart3, Settings, LogOut, Zap, FileText,
  Crown, X, Check, ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut, createClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

const NAV_ITEMS = [
  { label: 'Feed',      href: '/dashboard',            icon: Sparkles },
  { label: 'Ideas',     href: '/dashboard/studio',     icon: Lightbulb },
  { label: 'Guide',     href: '/dashboard/guide',      icon: FileText },
  { label: 'Editor',    href: '/dashboard/editor',     icon: Film },
  { label: 'Publish',   href: '/dashboard/publish',    icon: SendHorizonal },
  { label: 'Analytics', href: '/dashboard/analytics',  icon: BarChart3 },
]

const PLAN_COLORS: Record<string, string> = {
  free:    'text-slate-400 bg-white/5 border-white/10',
  creator: 'text-accent bg-accent/15 border-accent/30',
  pro:     'text-purple-300 bg-purple-500/15 border-purple-500/30',
}

const UPI_ID = 'your-upi-id@upi' // Replace with your UPI ID

function UpgradeModal({ onClose, userId }: { onClose: () => void; userId: string }) {
  const [selectedPlan, setSelectedPlan] = useState<'creator' | 'pro'>('creator')
  const [adminKey, setAdminKey]         = useState('')
  const [upgrading, setUpgrading]       = useState(false)
  const [done, setDone]                 = useState(false)
  const [error, setError]               = useState('')

  const PLANS = [
    {
      id: 'creator' as const,
      name: 'Creator',
      price: '₹100',
      period: '/month',
      features: ['50 ideas/month', '20 uploads/month', 'No watermark', 'Scheduling'],
    },
    {
      id: 'pro' as const,
      name: 'Pro',
      price: '₹350',
      period: '/month',
      features: ['Unlimited everything', 'Priority processing', 'Analytics', 'White-label'],
    },
  ]

  async function handleUpgrade() {
    setUpgrading(true)
    setError('')
    try {
      const resp = await fetch(
        `${BACKEND}/billing/admin/set-plan?user_id=${userId}&plan=${selectedPlan}&admin_key=${adminKey}`,
        { method: 'POST' }
      )
      if (!resp.ok) throw new Error('Invalid admin key or request failed')
      setDone(true)
      setTimeout(() => { onClose(); window.location.reload() }, 2000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.25 }}
        onClick={e => e.stopPropagation()}
        className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-amber-400" />
            <p className="text-sm font-semibold text-white">Upgrade your plan</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {done ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={20} className="text-emerald-400" />
              </div>
              <p className="text-white font-semibold">Upgraded successfully!</p>
              <p className="text-xs text-slate-500 mt-1">Refreshing your account...</p>
            </div>
          ) : (
            <>
              {/* Plan selector */}
              <div className="grid grid-cols-2 gap-3">
                {PLANS.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={cn(
                      'p-4 rounded-xl border text-left transition-all',
                      selectedPlan === plan.id
                        ? 'border-accent/50 bg-accent/10'
                        : 'border-border hover:border-border-2'
                    )}
                  >
                    <p className="text-sm font-semibold text-white mb-0.5">{plan.name}</p>
                    <div className="flex items-baseline gap-0.5 mb-3">
                      <span className="text-lg font-bold text-white">{plan.price}</span>
                      <span className="text-xs text-slate-500">{plan.period}</span>
                    </div>
                    <ul className="space-y-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <Check size={9} className="text-emerald-400 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              {/* UPI Payment */}
              <div className="bg-white/5 border border-border rounded-xl p-4">
                <p className="text-xs font-semibold text-white mb-2">Pay via UPI</p>
                <div className="flex items-center gap-3">
                  {/* QR placeholder */}
                  <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 100 100" width="64" height="64">
                      <rect x="10" y="10" width="30" height="30" rx="2" fill="#000"/>
                      <rect x="15" y="15" width="20" height="20" rx="1" fill="#fff"/>
                      <rect x="18" y="18" width="14" height="14" rx="1" fill="#000"/>
                      <rect x="60" y="10" width="30" height="30" rx="2" fill="#000"/>
                      <rect x="65" y="15" width="20" height="20" rx="1" fill="#fff"/>
                      <rect x="68" y="18" width="14" height="14" rx="1" fill="#000"/>
                      <rect x="10" y="60" width="30" height="30" rx="2" fill="#000"/>
                      <rect x="15" y="65" width="20" height="20" rx="1" fill="#fff"/>
                      <rect x="18" y="68" width="14" height="14" rx="1" fill="#000"/>
                      <rect x="50" y="50" width="8" height="8" fill="#000"/>
                      <rect x="62" y="50" width="8" height="8" fill="#000"/>
                      <rect x="74" y="50" width="8" height="8" fill="#000"/>
                      <rect x="86" y="50" width="8" height="8" fill="#000"/>
                      <rect x="50" y="62" width="8" height="8" fill="#000"/>
                      <rect x="74" y="62" width="8" height="8" fill="#000"/>
                      <rect x="50" y="74" width="8" height="8" fill="#000"/>
                      <rect x="62" y="74" width="8" height="8" fill="#000"/>
                      <rect x="86" y="74" width="8" height="8" fill="#000"/>
                      <rect x="50" y="86" width="8" height="8" fill="#000"/>
                      <rect x="74" y="86" width="8" height="8" fill="#000"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">UPI ID</p>
                    <p className="text-sm font-mono text-white">{UPI_ID}</p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Pay {selectedPlan === 'creator' ? '₹1,599' : '₹3,999'} then enter the admin key below
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin key input */}
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">
                  Payment confirmation key <span className="text-slate-600">(provided after payment)</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter key received after payment"
                  value={adminKey}
                  onChange={e => setAdminKey(e.target.value)}
                  className="input w-full"
                />
              </div>

              {error && <p className="text-xs text-rose-400">{error}</p>}

              <button
                onClick={handleUpgrade}
                disabled={!adminKey || upgrading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {upgrading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Activating...</>
                ) : (
                  <><Crown size={14} />Activate {selectedPlan} plan</>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export function Sidebar() {
  const pathname              = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile({ ...data, email: user.email })
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? 'U'

  const planColor = PLAN_COLORS[profile?.plan ?? 'free']

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-56 bg-surface border-r border-border flex flex-col z-40">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-accent/20 border border-accent/40 rounded-lg flex items-center justify-center group-hover:bg-accent/30 transition-colors">
              <Zap size={14} className="text-accent" />
            </div>
            <span className="font-semibold text-sm text-white">Creator OS</span>
          </Link>
        </div>

        {/* User profile strip */}
        {profile && (
          <div className="px-3 py-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {profile.full_name ?? profile.email?.split('@')[0]}
                </p>
                <button
                  onClick={() => setShowUpgrade(true)}
                  className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded border capitalize transition-all hover:opacity-80', planColor)}
                >
                  {profile.plan ?? 'free'} plan
                  {profile.plan === 'free' && ' · upgrade'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="section-label px-3 py-2">Workspace</p>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                  isActive ? 'bg-accent/15 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-accent/15 rounded-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon size={15} className="relative z-10 flex-shrink-0" />
                <span className="relative z-10 font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-accent rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-border space-y-0.5">
          {profile?.plan === 'free' && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-amber-400 hover:bg-amber-500/10 transition-all mb-1"
            >
              <Crown size={15} />
              <span className="font-medium">Upgrade plan</span>
            </button>
          )}
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Settings size={15} />
            <span className="font-medium">Settings</span>
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <LogOut size={15} />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Upgrade modal */}
      <AnimatePresence>
        {showUpgrade && profile && (
          <UpgradeModal
            onClose={() => setShowUpgrade(false)}
            userId={profile.id}
          />
        )}
      </AnimatePresence>
    </>
  )
}

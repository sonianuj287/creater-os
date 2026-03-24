'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Crown, X, Check, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

interface UsageData {
  plan: string
  usage: {
    ideas:   { used: number; limit: number }
    uploads: { used: number; limit: number }
  }
}

// Hook: fetch usage on mount, expose check functions
export function usePlanGate() {
  const [usage, setUsage]     = useState<UsageData | null>(null)
  const [userId, setUserId]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setUserId(user.id)

    try {
      const resp = await fetch(`${BACKEND}/billing/usage/${user.id}`)
      if (resp.ok) setUsage(await resp.json())
    } catch {}
    setLoading(false)
  }

  function canUpload()   { if (!usage) return true; const { used, limit } = usage.usage.uploads; return limit === -1 || used < limit }
  function canGenerate() { if (!usage) return true; const { used, limit } = usage.usage.ideas;   return limit === -1 || used < limit }

  return { usage, userId, loading, canUpload, canGenerate, reload: load }
}

// Visual usage bar
export function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  if (limit === -1) return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="text-emerald-400 font-medium">Unlimited</span>
    </div>
  )

  const pct  = Math.min(100, (used / limit) * 100)
  const over = used >= limit
  const warn = pct >= 80

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className={cn('font-semibold', over ? 'text-rose-400' : warn ? 'text-amber-400' : 'text-slate-400')}>
          {used}/{limit}
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={cn('h-full rounded-full', over ? 'bg-rose-500' : warn ? 'bg-amber-400' : 'bg-accent')}
        />
      </div>
    </div>
  )
}

// Full-screen paywall gate (wraps locked content)
interface PlanGateProps {
  feature:    string     // human label e.g. "video uploads"
  used:       number
  limit:      number
  plan:       string
  children:   React.ReactNode
  locked?:    boolean    // override: force locked
}

export function PlanGate({ feature, used, limit, plan, children, locked }: PlanGateProps) {
  const isLocked = locked ?? used >= limit

  if (!isLocked) return <>{children}</>

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="pointer-events-none select-none" style={{ filter: 'blur(4px)', opacity: 0.4 }}>
        {children}
      </div>
      {/* Paywall overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-canvas/60 backdrop-blur-sm rounded-2xl">
        <UpgradePrompt feature={feature} used={used} limit={limit} plan={plan} />
      </div>
    </div>
  )
}

// Inline upgrade prompt card
export function UpgradePrompt({ feature, used, limit, plan }: {
  feature: string; used: number; limit: number; plan: string
}) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface border border-amber-500/30 rounded-2xl p-6 text-center max-w-xs mx-auto"
        style={{ background: 'linear-gradient(135deg, rgba(124,106,245,0.1), rgba(236,72,153,0.06))' }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #7c6af5, #ec4899)' }}
        >
          <Lock size={20} className="text-white" />
        </div>
        <p className="text-sm font-bold text-white mb-1">
          {limit} {feature} limit reached
        </p>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          You've used {used}/{limit} {feature} this month on the free plan.
        </p>
        <div className="space-y-2 text-left mb-4">
          {[
            `${feature === 'video uploads' ? '20' : '50'} ${feature} / month`,
            'No watermark on exports',
            'Scheduling enabled',
          ].map(f => (
            <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
              <Check size={11} className="text-emerald-400 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #7c6af5, #ec4899)' }}
        >
          <Crown size={14} />
          Upgrade to Creator · ₹100/mo
        </button>
        <p className="text-[10px] text-slate-600 mt-2">Pay via UPI · Instant activation</p>
      </motion.div>

      <AnimatePresence>
        {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  )
}

// Full upgrade modal with UPI QR
function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected]   = useState<'creator' | 'pro'>('creator')
  const [adminKey, setAdminKey]   = useState('')
  const [upgrading, setUpgrading] = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState('')

  async function upgrade() {
    setUpgrading(true); setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not logged in'); setUpgrading(false); return }

    try {
      const resp = await fetch(
        `${BACKEND}/billing/admin/set-plan?user_id=${user.id}&plan=${selected}&admin_key=${adminKey}`,
        { method: 'POST' }
      )
      if (!resp.ok) throw new Error('Invalid key')
      setDone(true)
      setTimeout(() => { onClose(); window.location.reload() }, 1800)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        onClick={e => e.stopPropagation()}
        className="bg-surface border border-border rounded-2xl w-full max-w-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Crown size={15} className="text-amber-400" />
            <p className="text-sm font-bold text-white">Upgrade plan</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={15} /></button>
        </div>

        <div className="p-5 space-y-4">
          {done ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={20} className="text-emerald-400" />
              </div>
              <p className="text-white font-bold">Upgraded! Refreshing...</p>
            </div>
          ) : (
            <>
              {/* Plan toggle */}
              <div className="grid grid-cols-2 gap-2">
                {([['creator', '₹100/mo', '50 uploads, no watermark'],
                   ['pro',     '₹350/mo', 'Unlimited everything']] as const).map(([id, price, desc]) => (
                  <button key={id} onClick={() => setSelected(id)}
                    className={cn('p-3 rounded-xl border text-left transition-all',
                      selected === id ? 'border-accent/50 bg-accent/10' : 'border-border hover:border-border-2'
                    )}>
                    <p className="text-xs font-bold text-white capitalize">{id}</p>
                    <p className="text-sm font-black text-white">{price}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>

              {/* UPI */}
              <div className="bg-white/[0.03] border border-border rounded-xl p-4">
                <p className="text-xs font-semibold text-white mb-3">Pay via UPI</p>
                <div className="flex items-center gap-3">
                  {/* QR code placeholder */}
                  <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="64" height="64" viewBox="0 0 100 100">
                      <rect x="8" y="8" width="35" height="35" rx="3" fill="#000"/>
                      <rect x="13" y="13" width="25" height="25" rx="2" fill="#fff"/>
                      <rect x="17" y="17" width="17" height="17" rx="1" fill="#000"/>
                      <rect x="57" y="8" width="35" height="35" rx="3" fill="#000"/>
                      <rect x="62" y="13" width="25" height="25" rx="2" fill="#fff"/>
                      <rect x="66" y="17" width="17" height="17" rx="1" fill="#000"/>
                      <rect x="8" y="57" width="35" height="35" rx="3" fill="#000"/>
                      <rect x="13" y="62" width="25" height="25" rx="2" fill="#fff"/>
                      <rect x="17" y="66" width="17" height="17" rx="1" fill="#000"/>
                      {[57,68,79,90].map(x => <rect key={x} x={x} y="57" width="8" height="8" fill="#000"/>)}
                      {[57,68,79,90].map(x => <rect key={x} x={x} y="68" width="8" height="8" fill={[57,79].includes(x)?'#000':'none'}/>)}
                      {[57,68,79,90].map(x => <rect key={x} x={x} y="79" width="8" height="8" fill={[57,90].includes(x)?'#000':'none'}/>)}
                      {[57,68,79,90].map(x => <rect key={x} x={x} y="90" width="8" height="8" fill={[68,79].includes(x)?'#000':'none'}/>)}
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">UPI ID</p>
                    <p className="text-sm font-mono font-bold text-white">your-upi@upi</p>
                    <p className="text-[10px] text-slate-500 mt-2">
                      Pay {selected === 'creator' ? '₹100' : '₹350'} then paste the key below
                    </p>
                  </div>
                </div>
              </div>

              <input
                type="password"
                placeholder="Activation key (sent after payment)"
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                className="input w-full text-sm"
              />

              {error && <p className="text-xs text-rose-400">{error}</p>}

              <button
                onClick={upgrade}
                disabled={!adminKey || upgrading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #7c6af5, #ec4899)' }}
              >
                {upgrading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Activating...</>
                  : <><Zap size={14}/>Activate {selected} plan</>
                }
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

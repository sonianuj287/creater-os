'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Sparkles, Crown, Check, X, AlertCircle, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

const PLAN_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  creator: { bg: 'rgba(124,106,245,0.15)', text: '#a89ef8', border: 'rgba(124,106,245,0.4)', icon: '⚡' },
  pro:     { bg: 'rgba(236,72,153,0.15)',  text: '#f472b6', border: 'rgba(236,72,153,0.4)',  icon: '👑' },
}

// Confetti particle
function Particle({ color, x, delay }: { color: string; x: number; delay: number }) {
  const size = 6 + Math.random() * 8
  const rotation = Math.random() * 360
  const duration = 1.5 + Math.random()

  return (
    <motion.div
      style={{
        position: 'absolute', left: `${x}%`, top: 0,
        width: size, height: size,
        background: color, borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        rotate: rotation,
      }}
      initial={{ y: -20, opacity: 1, scale: 1 }}
      animate={{
        y: 420,
        opacity: [1, 1, 0],
        scale: [1, 1.2, 0.8],
        rotate: rotation + (Math.random() > 0.5 ? 360 : -360),
        x: (Math.random() - 0.5) * 120,
      }}
      transition={{ duration, delay, ease: 'easeIn' }}
    />
  )
}

function Confetti({ active }: { active: boolean }) {
  if (!active) return null
  const colors = ['#7c6af5', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#ff4d4d', '#a855f7']
  const particles = Array.from({ length: 60 }, (_, i) => ({
    color: colors[i % colors.length],
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
  }))

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 50 }}>
      {particles.map((p, i) => <Particle key={i} {...p} />)}
    </div>
  )
}

// Success screen shown after redemption
function SuccessScreen({ plan, expiresAt, onClose }: {
  plan: string; expiresAt: string; onClose: () => void
}) {
  const [showConfetti, setShowConfetti] = useState(true)
  const colors = PLAN_COLORS[plan] ?? PLAN_COLORS.creator
  const expiry = new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 2500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => { onClose(); window.location.reload() }, 5000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ position: 'relative', textAlign: 'center', padding: '32px 24px' }}>
      <Confetti active={showConfetti} />

      {/* Animated badge */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        style={{
          width: 80, height: 80, borderRadius: '50%',
          background: `linear-gradient(135deg, ${colors.text}, #ec4899)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: 36,
          boxShadow: `0 0 40px ${colors.border}, 0 8px 32px rgba(0,0,0,0.3)`,
        }}
      >
        {colors.icon}
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.text, marginBottom: 8 }}>
          Gift card activated
        </p>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8 }}>
          Welcome to {plan.charAt(0).toUpperCase() + plan.slice(1)}!
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
          Your plan is active until <span style={{ color: '#fff', fontWeight: 600 }}>{expiry}</span>
        </p>
      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 }}
      >
        {(plan === 'pro'
          ? ['Unlimited uploads', 'Priority processing', 'Analytics dashboard', 'No watermark']
          : ['50 ideas/month', '20 uploads/month', 'No watermark', 'Scheduling']
        ).map(f => (
          <span key={f} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 600, color: colors.text,
            background: colors.bg, border: `1px solid ${colors.border}`,
            padding: '4px 10px', borderRadius: 20,
          }}>
            <Check size={10} /> {f}
          </span>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}
      >
        Refreshing in a moment...
      </motion.p>
    </div>
  )
}

// Main gift card input
interface GiftCardInputProps {
  onSuccess?: (plan: string) => void
  compact?: boolean  // smaller inline version
}

export function GiftCardInput({ onSuccess, compact = false }: GiftCardInputProps) {
  const [code, setCode]       = useState('')
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult]   = useState<any>(null)
  const [error, setError]     = useState('')
  const inputRef              = useRef<HTMLInputElement>(null)

  // Auto-format to uppercase with hyphens
  function handleChange(val: string) {
    setCode(val.toUpperCase().replace(/[^A-Z0-9-]/g, ''))
    if (status === 'error') { setStatus('idle'); setError('') }
  }

  async function handleRedeem() {
    const trimmed = code.trim()
    if (!trimmed) return
    setStatus('loading')
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const resp = await fetch(`${BACKEND}/gift/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, code: trimmed }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        throw new Error(data.detail?.message ?? 'Invalid code')
      }

      setResult(data)
      setStatus('success')
      onSuccess?.(data.plan)

    } catch (e: any) {
      setError(e.message)
      setStatus('error')
      inputRef.current?.focus()
    }
  }

  if (status === 'success' && result) {
    return (
      <div style={{ position: 'relative', overflow: 'hidden', background: '#0e0e18', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
        <SuccessScreen
          plan={result.plan}
          expiresAt={result.expires_at}
          onClose={() => { setStatus('idle'); setCode(''); setResult(null) }}
        />
      </div>
    )
  }

  if (compact) {
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          ref={inputRef}
          value={code}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleRedeem()}
          placeholder="CREATOR-XXXXXX"
          style={{
            flex: 1, background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${status === 'error' ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 10, padding: '8px 12px',
            fontSize: 12, fontWeight: 700, color: '#fff',
            fontFamily: 'monospace', letterSpacing: '0.05em',
            outline: 'none',
          }}
        />
        <button
          onClick={handleRedeem}
          disabled={!code || status === 'loading'}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10,
            background: 'linear-gradient(135deg, #7c6af5, #ec4899)',
            border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
            cursor: code && status !== 'loading' ? 'pointer' : 'not-allowed',
            opacity: !code || status === 'loading' ? 0.5 : 1,
          }}
        >
          {status === 'loading'
            ? <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            : <><Gift size={12} />Redeem</>
          }
        </button>
        {error && <p style={{ fontSize: 11, color: '#f87171', marginTop: 4, position: 'absolute', bottom: -18 }}>{error}</p>}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  // Full card version
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(124,106,245,0.08), rgba(236,72,153,0.05))',
      border: '1px solid rgba(124,106,245,0.25)',
      borderRadius: 20, padding: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'linear-gradient(135deg, #7c6af5, #ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Gift size={20} color="#fff" />
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 2 }}>Redeem gift card</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Enter your code to activate Creator or Pro plan</p>
        </div>
      </div>

      {/* Code input */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <input
          ref={inputRef}
          value={code}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleRedeem()}
          placeholder="CREATOR-XXXXXX"
          maxLength={20}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.06)',
            border: `1.5px solid ${status === 'error' ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 12, padding: '14px 16px',
            fontSize: 18, fontWeight: 900, color: '#fff',
            fontFamily: 'monospace', letterSpacing: '0.08em',
            outline: 'none', textTransform: 'uppercase',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(124,106,245,0.6)'}
          onBlur={e => e.target.style.borderColor = status === 'error' ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.12)'}
        />
        {status === 'loading' && (
          <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
            <div style={{ width: 18, height: 18, border: '2px solid rgba(124,106,245,0.3)', borderTopColor: '#7c6af5', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          </div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10, padding: '10px 12px', marginBottom: 12,
            }}
          >
            <AlertCircle size={14} color="#f87171" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: '#f87171' }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Redeem button */}
      <button
        onClick={handleRedeem}
        disabled={!code.trim() || status === 'loading'}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: '14px', borderRadius: 12, border: 'none',
          background: code.trim() ? 'linear-gradient(135deg, #7c6af5, #ec4899)' : 'rgba(255,255,255,0.06)',
          color: code.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
          fontSize: 15, fontWeight: 800, cursor: code.trim() ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          boxShadow: code.trim() ? '0 0 30px rgba(124,106,245,0.3)' : 'none',
        }}
      >
        <Sparkles size={16} />
        Activate gift card
        <ChevronRight size={16} />
      </button>

      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 12 }}>
        Codes are one-time use · Plan activates instantly
      </p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

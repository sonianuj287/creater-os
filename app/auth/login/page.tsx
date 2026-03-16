'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, ArrowRight, Mail, Chrome } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleGoogleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
    else { setSent(true); setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/20 border border-accent/40 rounded-2xl mb-4">
            <Zap size={20} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Creator OS</h1>
          <p className="text-sm text-slate-500">
            From trending idea to published post.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail size={20} className="text-emerald-400" />
              </div>
              <p className="text-white font-semibold mb-1">Check your inbox</p>
              <p className="text-sm text-slate-500">
                Magic link sent to{' '}
                <span className="text-white">{email}</span>
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-4 text-xs text-slate-500 hover:text-white transition-colors"
              >
                Use a different email
              </button>
            </motion.div>
          ) : (
            <>
              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10
                           border border-border hover:border-border-2 rounded-xl py-3 px-4
                           text-sm font-medium text-white transition-all disabled:opacity-50"
              >
                <Chrome size={16} />
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-slate-600">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Email magic link */}
              <form onSubmit={handleMagicLink} className="space-y-3">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full"
                  required
                />
                {error && (
                  <p className="text-xs text-rose-400">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send magic link
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          By signing in you agree to our{' '}
          <a href="#" className="text-slate-500 hover:text-white transition-colors">
            Terms
          </a>{' '}
          and{' '}
          <a href="#" className="text-slate-500 hover:text-white transition-colors">
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  )
}

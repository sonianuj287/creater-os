'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle, Loader2, AlertCircle, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

interface PostToInstagramProps {
  projectId: string
  outputId: string
  videoUrl: string       // R2 presigned URL of the 9:16 video
  caption: string        // Caption from CaptionGenerator
  hashtags?: string      // Hashtag string to append
}

type PostStatus = 'idle' | 'posting' | 'success' | 'error'

export function PostToInstagram({
  projectId, outputId, videoUrl, caption, hashtags
}: PostToInstagramProps) {
  const [status, setStatus]   = useState<PostStatus>('idle')
  const [mediaId, setMediaId] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError]     = useState('')
  const [step, setStep]       = useState('')

  async function handlePost() {
    if (!videoUrl) {
      setError('No video URL — process a video first in the Editor')
      return
    }

    setStatus('posting')
    setError('')
    setStep('Connecting to Instagram...')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fullCaption = hashtags
        ? `${caption}\n\n${hashtags}`
        : caption

      setStep('Uploading to Instagram (takes 1–3 min)...')

      const resp = await fetch(`${BACKEND}/post/instagram/reel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:    user.id,
          project_id: projectId,
          output_id:  outputId,
          video_url:  videoUrl,
          caption:    fullCaption,
        }),
      })

      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.detail ?? 'Post failed')
      }

      const data = await resp.json()
      setMediaId(data.media_id)
      setUsername(data.profile?.split('/').pop() ?? '')
      setStatus('success')

    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center"
      >
        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle size={20} className="text-emerald-400" />
        </div>
        <p className="text-white font-semibold mb-1">Posted to Instagram!</p>
        <p className="text-xs text-slate-400 mb-4">
          Your Reel is live. It may take a few minutes to appear.
        </p>
        {username && (
          <a
            href={`https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-2 transition-colors"
          >
            <ExternalLink size={12} />
            View on Instagram
          </a>
        )}
        <button
          onClick={() => { setStatus('idle'); setMediaId(''); }}
          className="block mx-auto mt-3 text-xs text-slate-500 hover:text-white transition-colors"
        >
          Post another
        </button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Video preview info */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <p className="text-xs text-slate-500 mb-1">Posting as</p>
        <p className="text-sm font-medium text-white">Your Instagram account</p>
        <p className="text-xs text-slate-500 mt-0.5">via saved access token</p>
      </div>

      {/* Caption preview */}
      {caption && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-2">Caption preview</p>
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
            {caption}
            {hashtags && <span className="text-slate-500"> {hashtags}</span>}
          </p>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4"
          >
            <AlertCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post button */}
      <button
        onClick={handlePost}
        disabled={status === 'posting' || !videoUrl}
        className={cn(
          'w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-semibold text-sm transition-all',
          status === 'posting'
            ? 'bg-accent/30 text-white/50 cursor-wait'
            : !videoUrl
            ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-border'
            : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-lg'
        )}
      >
        {status === 'posting' ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {step}
          </>
        ) : (
          <>
            <Send size={15} />
            Post to Instagram
          </>
        )}
      </button>

      {status === 'posting' && (
        <p className="text-center text-xs text-slate-500">
          Instagram processes videos server-side — this takes 1–3 minutes. Don't close the page.
        </p>
      )}

      {!videoUrl && (
        <p className="text-center text-xs text-slate-500">
          Process a video in the Editor first to get a video URL.
        </p>
      )}
    </div>
  )
}

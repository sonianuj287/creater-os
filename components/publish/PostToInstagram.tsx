'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, CheckCircle, Loader2, AlertCircle, ExternalLink,
  AtSign, Music2, X, Plus, Info, ChevronDown, ChevronUp,
  TrendingUp, RefreshCw, Play, Pause,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getTrendingAudio, type TrendingTrack } from '@/lib/api'
import { cn } from '@/lib/utils'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

const SOURCE_LABELS: Record<string, string> = {
  apple_india:    '🍎 Apple Music India',
  deezer_global:  '🌍 Deezer Global',
  itunes_curated: '⚡ Curated Viral',
}

const GENRE_FILTERS = ['All', 'Pop', 'Bollywood', 'Desi Pop', 'R&B', 'Lo-fi', 'Global Pop'] as const
type GenreFilter = typeof GENRE_FILTERS[number]

interface PostToInstagramProps {
  projectId: string
  outputId: string
  videoUrl: string
  caption: string
  hashtags?: string
}

type PostStatus = 'idle' | 'posting' | 'success' | 'error'

export function PostToInstagram({
  projectId, outputId, videoUrl, caption, hashtags
}: PostToInstagramProps) {
  const [status, setStatus]     = useState<PostStatus>('idle')
  const [mediaId, setMediaId]   = useState('')
  const [username, setUsername] = useState('')
  const [error, setError]       = useState('')
  const [step, setStep]         = useState('')

  // ── Collaborators ────────────────────────────────────────────
  const [collabSection, setCollabSection] = useState(false)
  const [collabInput, setCollabInput]     = useState('')
  const [collaborators, setCollaborators] = useState<string[]>([])

  // ── Trending Audio ────────────────────────────────────────────
  const [audioSection, setAudioSection]       = useState(false)
  const [selectedAudio, setSelectedAudio]     = useState<TrendingTrack | null>(null)
  const [tracks, setTracks]                   = useState<TrendingTrack[]>([])
  const [audioLoading, setAudioLoading]       = useState(false)
  const [audioError, setAudioError]           = useState('')
  const [audioSource, setAudioSource]         = useState<'cache' | 'live' | ''>('')
  const [genreFilter, setGenreFilter]         = useState<GenreFilter>('All')
  const [previewPlaying, setPreviewPlaying]   = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Fetch tracks when audio section is opened for the first time
  useEffect(() => {
    if (audioSection && tracks.length === 0 && !audioLoading) {
      fetchTracks()
    }
  }, [audioSection])

  async function fetchTracks(forceRefresh = false) {
    setAudioLoading(true)
    setAudioError('')
    try {
      const result = await getTrendingAudio(40, forceRefresh)
      setTracks(result.tracks)
      setAudioSource(result.source)
    } catch (e: any) {
      setAudioError('Could not load tracks. Check your connection.')
    } finally {
      setAudioLoading(false)
    }
  }

  function togglePreview(track: TrendingTrack) {
    if (!track.preview_url) return

    if (previewPlaying === track.id) {
      audioRef.current?.pause()
      setPreviewPlaying(null)
      return
    }

    if (audioRef.current) audioRef.current.pause()
    const audio = new Audio(track.preview_url)
    audio.onended = () => setPreviewPlaying(null)
    audio.play().catch(() => {})
    audioRef.current = audio
    setPreviewPlaying(track.id)
  }

  // Stop preview when audio section closes
  useEffect(() => {
    if (!audioSection) {
      audioRef.current?.pause()
      setPreviewPlaying(null)
    }
  }, [audioSection])

  const filteredTracks = genreFilter === 'All'
    ? tracks
    : tracks.filter(t => t.genre.toLowerCase().includes(genreFilter.toLowerCase()))

  function addCollaborator() {
    const handle = collabInput.trim().replace(/^@/, '')
    if (!handle || collaborators.includes(handle) || collaborators.length >= 3) return
    setCollaborators(prev => [...prev, handle])
    setCollabInput('')
  }

  function removeCollaborator(h: string) {
    setCollaborators(prev => prev.filter(x => x !== h))
  }

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

      let finalCaption = caption
      if (collaborators.length > 0) {
        finalCaption += '\n\n' + collaborators.map(h => `@${h}`).join(' ')
      }
      if (hashtags) finalCaption += '\n\n' + hashtags
      if (selectedAudio) {
        finalCaption += `\n\n🎵 ${selectedAudio.title} — ${selectedAudio.artist}`
      }

      setStep('Uploading to Instagram (takes 1–3 min)...')

      const resp = await fetch(`${BACKEND}/post/instagram/reel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id, project_id: projectId,
          output_id: outputId, video_url: videoUrl,
          caption: finalCaption, collaborators,
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

  // ── Success ───────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center"
      >
        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle size={20} className="text-emerald-400" />
        </div>
        <p className="text-white font-semibold mb-1">Posted to Instagram!</p>
        <p className="text-xs text-slate-400 mb-4">Your Reel is live — may take a few minutes to appear.</p>

        {collaborators.length > 0 && (
          <div className="mb-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-left">
            <p className="text-xs font-semibold text-amber-400 mb-1 flex items-center gap-1.5"><AtSign size={11}/>Send Collab invites</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instagram API doesn't support collab invites. Open IG app → find this Reel → <strong className="text-white">··· → Edit → Add Collaborator</strong> → tag:{' '}
              {collaborators.map(h => <span key={h} className="text-pink-300 font-mono">@{h} </span>)}
            </p>
          </div>
        )}
        {selectedAudio && (
          <div className="mb-3 bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 text-left">
            <p className="text-xs font-semibold text-purple-400 mb-1 flex items-center gap-1.5"><Music2 size={11}/>Add your audio</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open Reel on IG app → <strong className="text-white">··· → Edit → Add music</strong> → search <strong className="text-white">"{selectedAudio.title}"</strong> by <strong className="text-white">{selectedAudio.artist}</strong>
            </p>
          </div>
        )}
        {username && (
          <a href={`https://instagram.com/${username}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-2 transition-colors"
          >
            <ExternalLink size={12} /> View on Instagram
          </a>
        )}
        <button onClick={() => { setStatus('idle'); setMediaId('') }}
          className="block mx-auto mt-3 text-xs text-slate-500 hover:text-white transition-colors"
        >Post another</button>
      </motion.div>
    )
  }

  // ── Main UI ───────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Account */}
      <div className="bg-surface border border-border rounded-xl p-3.5 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-white">IG</span>
        </div>
        <div>
          <p className="text-sm font-medium text-white leading-none">Your Instagram account</p>
          <p className="text-xs text-slate-500 mt-0.5">via saved access token</p>
        </div>
      </div>

      {/* Caption preview */}
      {caption && (
        <div className="bg-surface border border-border rounded-xl p-3.5">
          <p className="text-xs text-slate-500 mb-1.5">Caption preview</p>
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
            {caption}
            {collaborators.length > 0 && <span className="text-pink-300"> {collaborators.map(h => `@${h}`).join(' ')}</span>}
            {hashtags && <span className="text-slate-500"> {hashtags}</span>}
          </p>
        </div>
      )}

      {/* ── Collaborators ──────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <button onClick={() => setCollabSection(!collabSection)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-pink-500/15 flex items-center justify-center">
              <AtSign size={13} className="text-pink-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white leading-none">Tag & Mention</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {collaborators.length > 0 ? `${collaborators.length} tagged` : 'Tag creators or brands'}
              </p>
            </div>
          </div>
          {collabSection ? <ChevronUp size={15} className="text-slate-500"/> : <ChevronDown size={15} className="text-slate-500"/>}
        </button>

        <AnimatePresence>
          {collabSection && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="p-3.5 space-y-3">
                <div className="flex items-start gap-2 bg-blue-500/8 border border-blue-500/20 rounded-lg p-3">
                  <Info size={12} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-blue-300">Caption tags</strong> append @mention to your post automatically.{' '}
                    <strong className="text-amber-300">Collab invite</strong> must be done in the IG app — we'll remind you after posting.
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
                    <input type="text" value={collabInput}
                      onChange={e => setCollabInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addCollaborator()}
                      placeholder="username" className="input w-full pl-7 py-2 text-sm"
                    />
                  </div>
                  <button onClick={addCollaborator}
                    disabled={!collabInput.trim() || collaborators.length >= 3}
                    className="px-3 py-2 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 text-xs font-semibold transition-all disabled:opacity-40"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {collaborators.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {collaborators.map(h => (
                      <span key={h} className="flex items-center gap-1.5 bg-pink-500/15 text-pink-300 border border-pink-500/30 px-2.5 py-1 rounded-lg text-xs font-medium">
                        @{h}
                        <button onClick={() => removeCollaborator(h)} className="hover:text-white transition-colors"><X size={11}/></button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-slate-600">Max 3 tags · Collab invite must be sent in-app after posting</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Trending Audio ─────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <button onClick={() => setAudioSection(!audioSection)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <Music2 size={13} className="text-purple-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white leading-none">Trending Audio</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedAudio
                  ? <span className="text-purple-300">{selectedAudio.title} · {selectedAudio.artist}</span>
                  : 'Live charts from Apple Music & Deezer'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedAudio && (
              <button onClick={e => { e.stopPropagation(); setSelectedAudio(null) }}
                className="text-slate-500 hover:text-white transition-colors"><X size={13}/></button>
            )}
            {audioSection ? <ChevronUp size={15} className="text-slate-500"/> : <ChevronDown size={15} className="text-slate-500"/>}
          </div>
        </button>

        <AnimatePresence>
          {audioSection && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="p-3.5 space-y-3">
                {/* API disclaimer */}
                <div className="flex items-start gap-2 bg-amber-500/8 border border-amber-500/20 rounded-lg p-3">
                  <Info size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Instagram's API <strong className="text-amber-300">blocks audio selection</strong>. Pick a track here — we'll add it to your caption and remind you to add it in the IG app.
                  </p>
                </div>

                {/* Source badge + refresh */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {audioSource && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                        {audioSource === 'cache' ? '⚡ Cached' : '🔴 Live'}
                      </span>
                    )}
                    {tracks.length > 0 && (
                      <span className="text-[10px] text-slate-600">{tracks.length} tracks</span>
                    )}
                  </div>
                  <button onClick={() => fetchTracks(true)} disabled={audioLoading}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-white transition-colors disabled:opacity-40"
                  >
                    <RefreshCw size={11} className={audioLoading ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                </div>

                {/* Genre filter pills */}
                {tracks.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {GENRE_FILTERS.map(g => (
                      <button key={g} onClick={() => setGenreFilter(g)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all',
                          genreFilter === g
                            ? 'bg-accent/20 border-accent/40 text-white'
                            : 'border-border text-slate-500 hover:border-border-2 hover:text-slate-300'
                        )}
                      >{g}</button>
                    ))}
                  </div>
                )}

                {/* Loading skeleton */}
                {audioLoading && (
                  <div className="space-y-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                  </div>
                )}

                {/* Error */}
                {audioError && !audioLoading && (
                  <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
                    <AlertCircle size={13} />
                    {audioError}
                    <button onClick={() => fetchTracks()} className="ml-auto underline">Retry</button>
                  </div>
                )}

                {/* Track list */}
                {!audioLoading && filteredTracks.length > 0 && (
                  <div className="space-y-1 max-h-56 overflow-y-auto pr-0.5 thin-scrollbar">
                    {filteredTracks.map(track => (
                      <div key={track.id}
                        className={cn(
                          'group flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer',
                          selectedAudio?.id === track.id
                            ? 'border-purple-500/60 bg-purple-500/15'
                            : 'border-border hover:border-border-2 hover:bg-white/[0.03]'
                        )}
                        onClick={() => { setSelectedAudio(track); setAudioSection(false) }}
                      >
                        {/* Artwork */}
                        {track.artwork ? (
                          <img src={track.artwork} alt={track.title}
                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-white/10"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-sm">🎵</div>
                        )}

                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                            {track.hot && (
                              <span className="flex-shrink-0 flex items-center gap-0.5 text-[9px] font-bold text-orange-300 bg-orange-500/15 border border-orange-500/30 px-1.5 py-0.5 rounded-md">
                                <TrendingUp size={8}/> HOT
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                            <span className="text-[9px] text-slate-600">·</span>
                            <p className="text-[9px] text-slate-600 flex-shrink-0">{SOURCE_LABELS[track.source] ?? track.source}</p>
                          </div>
                        </div>

                        {/* Preview play button */}
                        {track.preview_url && (
                          <button
                            onClick={e => { e.stopPropagation(); togglePreview(track) }}
                            className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center hidden group-hover:flex transition-all"
                          >
                            {previewPlaying === track.id
                              ? <Pause size={11} className="text-white"/>
                              : <Play size={11} className="text-white ml-0.5"/>
                            }
                          </button>
                        )}

                        {selectedAudio?.id === track.id && (
                          <CheckCircle size={14} className="text-purple-400 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!audioLoading && !audioError && filteredTracks.length === 0 && tracks.length > 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">No tracks match this genre filter.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      <AnimatePresence>
        {status === 'error' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5"
          >
            <AlertCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post button */}
      <button onClick={handlePost} disabled={status === 'posting' || !videoUrl}
        className={cn(
          'w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-semibold text-sm transition-all',
          status === 'posting'
            ? 'bg-accent/30 text-white/50 cursor-wait'
            : !videoUrl
            ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-border'
            : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-lg shadow-pink-500/20'
        )}
      >
        {status === 'posting' ? (
          <><Loader2 size={16} className="animate-spin"/>{step}</>
        ) : (
          <>
            <Send size={15}/>
            Post to Instagram
            {(collaborators.length > 0 || selectedAudio) && (
              <span className="text-xs font-normal opacity-75 ml-1">
                {[
                  collaborators.length > 0 && `+${collaborators.length} tags`,
                  selectedAudio && '· audio queued',
                ].filter(Boolean).join(' ')}
              </span>
            )}
          </>
        )}
      </button>

      {status === 'posting' && (
        <p className="text-center text-xs text-slate-500">
          Instagram processes server-side — takes 1–3 min. Don't close the page.
        </p>
      )}
      {!videoUrl && (
        <p className="text-center text-xs text-slate-500">Process a video in the Editor first.</p>
      )}
    </div>
  )
}

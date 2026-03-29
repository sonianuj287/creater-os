'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SendHorizonal, Film, Download, Layers, Scissors,
  Image, Twitter, Mail, Loader2, AlertCircle,
  Calendar, CheckCircle, Clock, ArrowRight, Sparkles,
  Instagram, Youtube, Share2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { CaptionGenerator } from '@/components/publish/CaptionGenerator'
import { Scheduler } from '@/components/publish/Scheduler'
import { PlatformConnections } from '@/components/publish/PlatformConnections'
import { PostToInstagram } from '@/components/publish/PostToInstagram'
import { cn, formatNumber } from '@/lib/utils'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

type Tab = 'post' | 'captions' | 'schedule' | 'downloads' | 'connections'

const FORMAT_LABELS: Record<string, { label: string; desc: string }> = {
  '9x16': { label: '9:16 Vertical', desc: 'Reels · Shorts · TikTok' },
  '1x1':  { label: '1:1 Square',    desc: 'Instagram feed' },
  '16x9': { label: '16:9 Wide',     desc: 'YouTube' },
}

function PlatformBadge({ platform }: { platform: string }) {
  const colors: Record<string, string> = {
    instagram: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    youtube:   'bg-red-500/20 text-red-300 border-red-500/30',
    twitter:   'bg-sky-500/20 text-sky-300 border-sky-500/30',
  }
  return <span className={cn('pill text-[10px]', colors[platform] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30')}>{platform}</span>
}

export default function PublishPage() {
  const [projects, setProjects]         = useState<any[]>([])
  const [selected, setSelected]         = useState<any>(null)
  const [output, setOutput]             = useState<any>(null)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingOutput, setLoadingOutput]     = useState(false)
  const [tab, setTab]                   = useState<Tab>('post')
  const [userId, setUserId]             = useState('')
  const [caption, setCaption]           = useState('')
  const [postedPlatforms, setPostedPlatforms] = useState<string[]>([])

  useEffect(() => { loadProjects() }, [])
  useEffect(() => { if (selected) loadOutput(selected.id) }, [selected])

  async function loadProjects() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data } = await supabase
      .from('projects').select('*').eq('user_id', user.id)
      .order('updated_at', { ascending: false }).limit(20)
    setProjects(data ?? [])
    if (data?.length) setSelected(data[0])
    setLoadingProjects(false)
  }

  async function loadOutput(projectId: string) {
    setLoadingOutput(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('generated_outputs').select('*')
      .eq('project_id', projectId).eq('status', 'completed')
      .order('created_at', { ascending: false }).limit(1).single()
    if (data) {
      const parsed = { ...data }
      for (const f of ['format_urls','clips','carousel_slides','tweet_thread','newsletter','metadata']) {
        if (parsed[f] && typeof parsed[f] === 'string') {
          try { parsed[f] = JSON.parse(parsed[f]) } catch {}
        }
      }
      setOutput(parsed)
      setCaption(selected?.title ?? '')
    } else {
      setOutput(null)
    }
    setLoadingOutput(false)
  }

  const TABS: Array<{ id: Tab; label: string; icon: any }> = [
    { id: 'post',        label: 'Post now',   icon: SendHorizonal },
    { id: 'captions',    label: 'Captions',   icon: Sparkles },
    { id: 'schedule',    label: 'Schedule',   icon: Calendar },
    { id: 'downloads',   label: 'Downloads',  icon: Download },
    { id: 'connections', label: 'Accounts',   icon: Layers },
  ]

  return (
    <div className="min-h-screen bg-canvas">
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <SendHorizonal size={14} className="text-accent" />
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Publish</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Post, schedule, <span className="text-gradient">grow</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">One place to publish across all platforms.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* Project list */}
          <div className="space-y-2">
            <p className="section-label px-1">Your projects</p>
            {loadingProjects ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-10">
                <Film size={24} className="text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No projects yet.</p>
                <a href="/dashboard/editor" className="text-xs text-accent mt-1 block hover:underline">Go to Editor →</a>
              </div>
            ) : (
              projects.map((project, i) => (
                <motion.button
                  key={project.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(project)}
                  className={cn('w-full text-left p-3.5 rounded-xl border transition-all',
                    selected?.id === project.id ? 'bg-accent/15 border-accent/40' : 'border-border hover:border-border-2 hover:bg-white/[0.03]'
                  )}
                >
                  <p className={cn('text-sm font-medium truncate', selected?.id === project.id ? 'text-white' : 'text-slate-300')}>
                    {project.title}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 capitalize">
                    {new Date(project.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    {project.niche && ` · ${project.niche}`}
                    {project.status === 'published' && <span className="ml-1 text-emerald-500">· posted</span>}
                  </p>
                </motion.button>
              ))
            )}
          </div>

          {/* Content area */}
          <div>
            {!selected ? (
              <div className="flex items-center justify-center h-64 text-slate-600"><p className="text-sm">Select a project to publish</p></div>
            ) : loadingOutput ? (
              <div className="flex items-center justify-center h-64"><Loader2 size={20} className="animate-spin text-slate-600" /></div>
            ) : !output ? (
              <div className="text-center py-20">
                <AlertCircle size={24} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-2">No processed output found.</p>
                <a href="/dashboard/editor" className="text-xs text-accent hover:underline">Process a video first →</a>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white truncate">{selected.title}</h2>
                  {postedPlatforms.length > 0 && (
                    <div className="flex gap-1.5">
                      {postedPlatforms.map(p => <PlatformBadge key={p} platform={p} />)}
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
                  {TABS.map(t => {
                    const Icon = t.icon
                    return (
                      <button key={t.id} onClick={() => setTab(t.id)}
                        className={cn('flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all',
                          tab === t.id ? 'bg-accent/20 text-accent' : 'text-slate-500 hover:text-slate-300'
                        )}
                      >
                        <Icon size={11} />{t.label}
                      </button>
                    )
                  })}
                </div>

                {/* POST NOW tab */}
                {tab === 'post' && (
                  <div className="space-y-4">
                    {/* Caption editor */}
                    <div className="bg-surface border border-border rounded-2xl p-5">
                      <p className="text-sm font-semibold text-white mb-3">Your caption</p>
                      <textarea
                        value={caption} onChange={e => setCaption(e.target.value)}
                        rows={4} placeholder="Write your caption here, or generate one in the Captions tab..."
                        className="input w-full resize-none text-sm leading-relaxed mb-2"
                      />
                      <button onClick={() => setTab('captions')} className="text-xs text-accent hover:underline">
                        Generate AI caption →
                      </button>
                    </div>

                    {/* Platform post buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Instagram */}
                      <div className="bg-surface border border-border rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center text-xs font-bold text-pink-300 border border-pink-500/30">IG</div>
                          <div>
                            <p className="text-sm font-semibold text-white">Instagram Reel</p>
                            <p className="text-xs text-slate-500">9:16 vertical format</p>
                          </div>
                        </div>
                        <PostToInstagram
                          projectId={selected.id}
                          outputId={output.id}
                          videoUrl={output.format_urls?.['9x16'] ?? ''}
                          caption={caption}
                        />
                      </div>

                      {/* YouTube */}
                      <div className="bg-surface border border-border rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center text-xs font-bold text-red-300 border border-red-500/30">YT</div>
                          <div>
                            <p className="text-sm font-semibold text-white">YouTube Short</p>
                            <p className="text-xs text-slate-500">9:16 vertical format</p>
                          </div>
                        </div>
                        <YouTubePostButton
                          userId={userId}
                          projectId={selected.id}
                          outputId={output.id}
                          videoUrl={output.format_urls?.['9x16'] ?? ''}
                          title={selected.title}
                          description={caption}
                          onPosted={() => setPostedPlatforms(p => [...p, 'youtube'])}
                        />
                      </div>
                    </div>

                    {/* One-click all platforms */}
                    {output.format_urls?.['9x16'] && caption && (
                      <div className="bg-gradient-to-r from-pink-500/10 to-red-500/10 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white mb-0.5">Post to all platforms</p>
                          <p className="text-xs text-slate-400">Instagram + YouTube at the same time</p>
                        </div>
                        <span className="text-xs text-slate-500 bg-white/5 px-3 py-1.5 rounded-lg border border-border">Coming soon</span>
                      </div>
                    )}
                  </div>
                )}

                {/* CAPTIONS tab */}
                {tab === 'captions' && (
                  <div className="bg-surface border border-border rounded-2xl p-5">
                    <p className="text-sm font-semibold text-white mb-1">Generate captions</p>
                    <p className="text-xs text-slate-500 mb-4">Pick your platform and get 3 caption styles with hashtags.</p>
                    <CaptionGenerator
                      title={selected.title}
                      description={selected.title}
                      niche={selected.niche ?? 'lifestyle'}
                      hook={output.clips?.[0]?.hook}
                      onApply={(text) => {
                        setCaption(text)
                        setTab('post')
                      }}
                    />
                  </div>
                )}

                {/* SCHEDULE tab */}
                {tab === 'schedule' && (
                  <div className="space-y-4">
                    <div className="bg-surface border border-border rounded-2xl p-5">
                      <p className="text-sm font-semibold text-white mb-1">Schedule for later</p>
                      <p className="text-xs text-slate-500 mb-4">Pick a date and time — we'll remind you to post.</p>
                      <Scheduler
                        projectId={selected.id}
                        outputId={output.id}
                        platform="instagram"
                        caption={caption}
                        hashtags=""
                      />
                    </div>

                    {/* Scheduled posts list */}
                    <ScheduledPostsList userId={userId} />
                  </div>
                )}

                {/* DOWNLOADS tab */}
                {tab === 'downloads' && (
                  <div className="space-y-4">
                    {output.format_urls && Object.keys(output.format_urls).length > 0 && (
                      <div>
                        <p className="section-label mb-3">Exported formats</p>
                        <div className="space-y-2.5">
                          {Object.entries(output.format_urls as Record<string, string>).map(([fmt, url]) => (
                            <div key={fmt} className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
                              <div>
                                <p className="text-sm font-medium text-white">{FORMAT_LABELS[fmt]?.label ?? fmt}</p>
                                <p className="text-xs text-slate-500">{FORMAT_LABELS[fmt]?.desc}</p>
                              </div>
                              <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 btn-outline text-xs py-1.5 px-3">
                                <Download size={12} />Download
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {output.clips?.length > 0 && (
                      <div>
                        <p className="section-label mb-3">Short clips ({output.clips.length})</p>
                        <div className="space-y-2.5">
                          {output.clips.map((clip: any, i: number) => (
                            <div key={i} className="p-4 bg-surface border border-border rounded-xl">
                              <div className="flex items-start justify-between gap-3 mb-1.5">
                                <p className="text-sm font-medium text-white">{clip.title}</p>
                                <span className={cn('text-xs font-semibold', clip.engagement_score >= 80 ? 'text-emerald-400' : 'text-amber-400')}>{clip.engagement_score}</span>
                              </div>
                              <p className="text-xs text-slate-400 italic mb-3">"{clip.hook}"</p>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600">{clip.start_seconds?.toFixed(0)}s – {clip.end_seconds?.toFixed(0)}s</span>
                                <a href={clip.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-accent font-medium">
                                  <Download size={11} />Download
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {output.tweet_thread?.length > 0 && (
                      <div>
                        <p className="section-label mb-3">Tweet thread</p>
                        <div className="space-y-2">
                          {output.tweet_thread.map((tweet: string, i: number) => (
                            <div key={i} className="p-3.5 bg-surface border border-border rounded-xl">
                              <div className="flex items-start gap-2.5">
                                <span className="text-[10px] font-bold text-slate-600 bg-white/5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">{i+1}</span>
                                <p className="text-sm text-slate-300 leading-relaxed">{tweet}</p>
                              </div>
                              <div className="flex justify-between mt-2">
                                <span className={cn('text-[10px]', tweet.length > 260 ? 'text-rose-400' : 'text-slate-600')}>{tweet.length}/280</span>
                                <button onClick={() => navigator.clipboard.writeText(tweet)} className="text-[10px] text-slate-600 hover:text-accent">Copy</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CONNECTIONS tab */}
                {tab === 'connections' && (
                  <div className="bg-surface border border-border rounded-2xl p-5">
                    <p className="text-sm font-semibold text-white mb-1">Connected accounts</p>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">Connect your accounts to post and pull analytics automatically.</p>
                    <PlatformConnections />
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// YouTube post button component
function YouTubePostButton({ userId, projectId, outputId, videoUrl, title, description, onPosted }: any) {
  const [status, setStatus] = useState<'idle' | 'posting' | 'done' | 'error'>('idle')
  const [error, setError]   = useState('')

  async function post() {
    if (!videoUrl) return
    setStatus('posting')
    try {
      const resp = await fetch(`${BACKEND}/publish/youtube/post`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, output_id: outputId, project_id: projectId, video_url: videoUrl, title, description, is_short: true, privacy: 'public' }),
      })
      if (!resp.ok) { const d = await resp.json(); throw new Error(d.detail) }
      setStatus('done')
      onPosted?.()
    } catch (e: any) {
      setError(e.message); setStatus('error')
    }
  }

  if (status === 'done') return (
    <div className="text-center py-4">
      <CheckCircle size={20} className="text-emerald-400 mx-auto mb-2" />
      <p className="text-sm font-medium text-white">Posted to YouTube!</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {status === 'error' && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">{error}</p>}
      <button
        onClick={post} disabled={status === 'posting' || !videoUrl}
        className={cn('w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all',
          !videoUrl ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-border' :
          status === 'posting' ? 'bg-red-500/30 text-white/50 cursor-wait' :
          'bg-red-500 hover:bg-red-400 text-white'
        )}
      >
        {status === 'posting'
          ? <><Loader2 size={14} className="animate-spin" />Uploading to YouTube...</>
          : <><ArrowRight size={14} />Post as YouTube Short</>
        }
      </button>
      {!videoUrl && <p className="text-[10px] text-slate-600 text-center">Process a video in the Editor first</p>}
    </div>
  )
}

// Scheduled posts mini list
function ScheduledPostsList({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    supabase.from('scheduled_posts').select('*').eq('user_id', userId)
      .eq('status', 'scheduled').order('scheduled_for').limit(5)
      .then(({ data }) => setPosts(data ?? []))
  }, [userId])

  if (!posts.length) return null

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <p className="text-sm font-semibold text-white mb-3">Upcoming schedule</p>
      <div className="space-y-2.5">
        {posts.map(post => (
          <div key={post.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <PlatformBadge platform={post.platform} />
              <span className="text-slate-400 truncate max-w-[140px]">{post.caption?.slice(0, 40)}...</span>
            </div>
            <span className="text-slate-500 flex-shrink-0 flex items-center gap-1">
              <Clock size={10} />
              {new Date(post.scheduled_for).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

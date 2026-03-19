'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  SendHorizonal, Film, Download, ChevronRight,
  Layers, Scissors, Image, Twitter, Mail,
  Loader2, AlertCircle, Calendar,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { CaptionGenerator, Scheduler, PlatformConnections } from '@/components/publish'
import { cn, formatNumber } from '@/lib/utils'

const FORMAT_LABELS: Record<string, { label: string; desc: string }> = {
  '9x16': { label: '9:16 Vertical', desc: 'Reels · Shorts · TikTok' },
  '1x1':  { label: '1:1 Square',    desc: 'Instagram feed' },
  '16x9': { label: '16:9 Wide',     desc: 'YouTube' },
}

type Tab = 'outputs' | 'captions' | 'schedule' | 'connections'

export default function PublishPage() {
  const [projects, setProjects]     = useState<any[]>([])
  const [selected, setSelected]     = useState<any>(null)
  const [output, setOutput]         = useState<any>(null)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingOutput, setLoadingOutput]     = useState(false)
  const [tab, setTab]               = useState<Tab>('outputs')

  useEffect(() => { loadProjects() }, [])
  useEffect(() => { if (selected) loadOutput(selected.id) }, [selected])

  async function loadProjects() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'editing')
      .order('updated_at', { ascending: false })
      .limit(20)

    setProjects(data ?? [])
    if (data?.length) setSelected(data[0])
    setLoadingProjects(false)
  }

  async function loadOutput(projectId: string) {
    setLoadingOutput(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('generated_outputs')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'completed')
      .eq('output_type', 'processed_video')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (data) {
      const parsed = { ...data }
      for (const field of ['format_urls', 'clips', 'carousel_slides', 'tweet_thread', 'newsletter', 'metadata']) {
        if (parsed[field] && typeof parsed[field] === 'string') {
          try { parsed[field] = JSON.parse(parsed[field]) } catch {}
        }
      }
      setOutput(parsed)
    } else {
      setOutput(null)
    }
    setLoadingOutput(false)
  }

  const TABS: Array<{ id: Tab; label: string; icon: any }> = [
    { id: 'outputs',     label: 'Downloads',    icon: Download },
    { id: 'captions',    label: 'Captions',     icon: SendHorizonal },
    { id: 'schedule',    label: 'Schedule',     icon: Calendar },
    { id: 'connections', label: 'Accounts',     icon: Layers },
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
            Download, caption, <span className="text-gradient">schedule</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pick your processed video and get it ready to post.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Left: Project list */}
          <div className="space-y-2">
            <p className="section-label px-1">Your projects</p>
            {loadingProjects ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-10">
                <Film size={24} className="text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No processed videos yet.</p>
                <a href="/dashboard/editor" className="text-xs text-accent mt-1 block hover:underline">
                  Go to Editor →
                </a>
              </div>
            ) : (
              projects.map((project, i) => (
                <motion.button
                  key={project.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(project)}
                  className={cn(
                    'w-full text-left p-3.5 rounded-xl border transition-all',
                    selected?.id === project.id
                      ? 'bg-accent/15 border-accent/40'
                      : 'border-border hover:border-border-2 hover:bg-white/[0.03]'
                  )}
                >
                  <p className={cn(
                    'text-sm font-medium truncate',
                    selected?.id === project.id ? 'text-white' : 'text-slate-300'
                  )}>
                    {project.title}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 capitalize">
                    {new Date(project.updated_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short'
                    })}
                    {project.niche && ` · ${project.niche}`}
                  </p>
                </motion.button>
              ))
            )}
          </div>

          {/* Right: Content area */}
          <div>
            {!selected ? (
              <div className="flex items-center justify-center h-64 text-slate-600">
                <p className="text-sm">Select a project to publish</p>
              </div>
            ) : loadingOutput ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 size={20} className="animate-spin text-slate-600" />
              </div>
            ) : !output ? (
              <div className="text-center py-20">
                <AlertCircle size={24} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-2">No processed output found for this project.</p>
                <a href="/dashboard/editor" className="text-xs text-accent hover:underline">
                  Process a video first →
                </a>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                {/* Project title */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">{selected.title}</h2>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
                  {TABS.map(t => {
                    const Icon = t.icon
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all',
                          tab === t.id
                            ? 'bg-accent/20 text-accent'
                            : 'text-slate-500 hover:text-slate-300'
                        )}
                      >
                        <Icon size={12} />
                        {t.label}
                      </button>
                    )
                  })}
                </div>

                {/* Downloads tab */}
                {tab === 'outputs' && (
                  <div className="space-y-4">
                    {/* Format exports */}
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
                              <a
                                href={url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 btn-outline text-xs py-1.5 px-3"
                              >
                                <Download size={12} />
                                Download
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Short clips */}
                    {output.clips?.length > 0 && (
                      <div>
                        <p className="section-label mb-3">Short clips ({output.clips.length})</p>
                        <div className="space-y-2.5">
                          {output.clips.map((clip: any, i: number) => (
                            <div key={i} className="p-4 bg-surface border border-border rounded-xl">
                              <div className="flex items-start justify-between gap-3 mb-1.5">
                                <p className="text-sm font-medium text-white">{clip.title}</p>
                                <span className={cn(
                                  'text-xs font-semibold flex-shrink-0',
                                  clip.engagement_score >= 80 ? 'text-emerald-400' : 'text-amber-400'
                                )}>
                                  {clip.engagement_score}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 italic mb-3">"{clip.hook}"</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-600">
                                  {clip.start_seconds?.toFixed(0)}s – {clip.end_seconds?.toFixed(0)}s
                                </span>
                                <a
                                  href={clip.url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-2 font-medium"
                                >
                                  <Download size={11} /> Download
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Carousel */}
                    {output.carousel_slides?.length > 0 && (
                      <div>
                        <p className="section-label mb-3">Carousel slides ({output.carousel_slides.length})</p>
                        <div className="space-y-2">
                          {output.carousel_slides.map((slide: any, i: number) => (
                            <div key={i} className="p-3.5 bg-surface border border-border rounded-xl">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-bold text-slate-600 bg-white/5 w-5 h-5 rounded-full flex items-center justify-center">
                                  {slide.slide_number}
                                </span>
                                <p className="text-sm font-semibold text-white">{slide.headline}</p>
                              </div>
                              <ul className="space-y-1">
                                {slide.body?.map((b: string, j: number) => (
                                  <li key={j} className="text-xs text-slate-400 flex gap-2">
                                    <span className="text-accent mt-0.5">·</span>{b}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tweet thread */}
                    {output.tweet_thread?.length > 0 && (
                      <div>
                        <p className="section-label mb-3">Tweet thread</p>
                        <div className="space-y-2">
                          {output.tweet_thread.map((tweet: string, i: number) => (
                            <div key={i} className="p-3.5 bg-surface border border-border rounded-xl">
                              <div className="flex items-start gap-2.5">
                                <span className="text-[10px] font-bold text-slate-600 bg-white/5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <p className="text-sm text-slate-300 leading-relaxed">{tweet}</p>
                              </div>
                              <div className="flex justify-between mt-2">
                                <span className={cn('text-[10px]', tweet.length > 260 ? 'text-rose-400' : 'text-slate-600')}>
                                  {tweet.length}/280
                                </span>
                                <button
                                  onClick={() => navigator.clipboard.writeText(tweet)}
                                  className="text-[10px] text-slate-600 hover:text-accent transition-colors"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Newsletter */}
                    {output.newsletter?.subject_line && (
                      <div>
                        <p className="section-label mb-3">Newsletter</p>
                        <div className="space-y-2.5">
                          <div className="p-3.5 bg-surface border border-border rounded-xl">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Subject</p>
                            <p className="text-sm font-semibold text-white">{output.newsletter.subject_line}</p>
                          </div>
                          {output.newsletter.intro && (
                            <div className="p-3.5 bg-surface border border-border rounded-xl">
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Intro</p>
                              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                                {output.newsletter.intro}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Captions tab */}
                {tab === 'captions' && (
                  <CaptionGenerator
                    title={selected.title}
                    description={selected.title}
                    niche={selected.niche ?? 'lifestyle'}
                    hook={output.clips?.[0]?.hook}
                  />
                )}

                {/* Schedule tab */}
                {tab === 'schedule' && (
                  <div className="space-y-4">
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                      <p className="text-xs font-semibold text-amber-400 mb-1">Connect your accounts first</p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Auto-posting requires connecting your Instagram and YouTube accounts.
                        Switch to the Accounts tab to connect them.
                      </p>
                    </div>
                    <Scheduler
                      projectId={selected.id}
                      outputId={output.id}
                      platform="instagram"
                      caption={selected.title}
                      hashtags=""
                    />
                  </div>
                )}

                {/* Connections tab */}
                {tab === 'connections' && (
                  <div className="space-y-4">
                    <div className="bg-surface border border-border rounded-2xl p-5">
                      <p className="text-sm font-semibold text-white mb-1">Connect your accounts</p>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        Connect your social accounts to enable one-click scheduling and live analytics.
                      </p>
                      <PlatformConnections />
                    </div>
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

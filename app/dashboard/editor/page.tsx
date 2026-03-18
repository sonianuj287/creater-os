'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Film, Scissors, Captions, Layers,
  Download, Sparkles, CheckCircle, Loader2,
  AlertCircle, ChevronDown, ChevronUp, ExternalLink,
  Twitter, Image, Mail, Play,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

type JobStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed'

interface ProcessingOptions {
  cut_silences: boolean
  burn_captions: boolean
  caption_style: 'minimal' | 'bold' | 'colour_pop'
  extract_clips: boolean
  generate_carousel: boolean
  generate_thread: boolean
}

interface JobResult {
  format_urls: Record<string, string>
  clips: Array<{ title: string; url: string; hook: string; engagement_score: number; start_seconds: number; end_seconds: number }>
  carousel_slides: Array<{ slide_number: number; headline: string; body: string[]; type: string }>
  tweet_thread: string[]
  newsletter: { subject_line: string; intro: string; key_takeaways: string[] }
}

const FORMAT_LABELS: Record<string, { label: string; desc: string }> = {
  '9x16': { label: '9:16 Vertical', desc: 'Reels · Shorts · TikTok' },
  '1x1':  { label: '1:1 Square',    desc: 'Instagram feed' },
  '16x9': { label: '16:9 Wide',     desc: 'YouTube' },
}

function OptionToggle({
  label, desc, checked, onChange,
}: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-start justify-between gap-3 p-3.5 rounded-xl border text-left transition-all w-full',
        checked ? 'bg-accent/10 border-accent/40' : 'border-border hover:border-border-2'
      )}
    >
      <div>
        <p className={cn('text-sm font-medium', checked ? 'text-white' : 'text-slate-300')}>{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
      <div className={cn(
        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
        checked ? 'border-accent bg-accent' : 'border-slate-600'
      )}>
        {checked && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
    </button>
  )
}

function ResultSection({ title, icon: Icon, children, defaultOpen = false }: any) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon size={15} className="text-accent" />
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        {open ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function EditorPage() {
  const [file, setFile]             = useState<File | null>(null)
  const [dragOver, setDragOver]     = useState(false)
  const [status, setStatus]         = useState<JobStatus>('idle')
  const [progress, setProgress]     = useState(0)
  const [progressText, setProgressText] = useState('')
  const [outputId, setOutputId]     = useState('')
  const [result, setResult]         = useState<JobResult | null>(null)
  const [error, setError]           = useState('')
  const fileRef                     = useRef<HTMLInputElement>(null)

  const [options, setOptions] = useState<ProcessingOptions>({
    cut_silences:      true,
    burn_captions:     true,
    caption_style:     'bold',
    extract_clips:     true,
    generate_carousel: true,
    generate_thread:   true,
  })

  const setOption = (key: keyof ProcessingOptions, val: any) =>
    setOptions(prev => ({ ...prev, [key]: val }))

  // ── Drag and drop ──────────────────────────────────────────
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.type.startsWith('video/') || f.type.startsWith('audio/'))) setFile(f)
  }, [])

  // ── Main upload + process flow ─────────────────────────────
  async function handleProcess() {
    if (!file) return
    setError('')
    setStatus('uploading')
    setProgress(5)
    setProgressText('Getting upload URL...')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create a project
      const { data: project } = await supabase.from('projects').insert({
        user_id: user.id,
        title: file.name.replace(/\.[^.]+$/, ''),
        status: 'editing',
      }).select().single()
      if (!project) throw new Error('Could not create project')

      // Get presigned upload URL
      setProgressText('Preparing upload...')
      const urlRes = await fetch(`${BACKEND}/media/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename:     file.name,
          content_type: file.type,
          user_id:      user.id,
          project_id:   project.id,
        }),
      })
      if (!urlRes.ok) throw new Error('Failed to get upload URL')
      const { upload_url, key } = await urlRes.json()

      // Upload directly to R2
      setProgressText('Uploading to cloud...')
      setProgress(15)
      const uploadRes = await fetch(upload_url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!uploadRes.ok) throw new Error('Upload failed')

      setProgress(30)
      setProgressText('Starting AI processing...')
      setStatus('processing')

      // Start processing job
      const processRes = await fetch(`${BACKEND}/media/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.id,
          user_id:    user.id,
          s3_key:     key,
          title:      file.name.replace(/\.[^.]+$/, ''),
          options,
        }),
      })
      if (!processRes.ok) throw new Error('Failed to start processing')
      const { output_id } = await processRes.json()
      setOutputId(output_id)

      // Poll for completion
      await pollStatus(output_id)

    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
      setStatus('failed')
    }
  }

  async function pollStatus(id: string) {
    const POLL_INTERVAL = 3000
    const MAX_POLLS = 120 // 6 minutes max

    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise(r => setTimeout(r, POLL_INTERVAL))

      const res = await fetch(`${BACKEND}/media/status/${id}`)
      if (!res.ok) continue
      const data = await res.json()

      if (data.status === 'completed') {
        setResult(data as JobResult)
        setStatus('completed')
        setProgress(100)
        setProgressText('Done!')
        return
      }

      if (data.status === 'failed') {
        setError(data.error ?? 'Processing failed')
        setStatus('failed')
        return
      }

      // Update progress bar from task state
      const p = 30 + Math.min(65, (i / MAX_POLLS) * 65)
      setProgress(Math.round(p))

      const stepMessages: Record<number, string> = {
        1: 'Transcribing audio...', 3: 'Cutting silences...', 5: 'Burning captions...',
        7: 'Exporting formats...', 10: 'Detecting best clips...', 14: 'Generating carousel...',
        17: 'Writing tweet thread...', 19: 'Saving results...',
      }
      const msg = stepMessages[i] ?? progressText
      if (msg) setProgressText(msg)
    }

    setError('Processing timed out. Please try again.')
    setStatus('failed')
  }

  function reset() {
    setFile(null); setStatus('idle'); setProgress(0)
    setProgressText(''); setOutputId(''); setResult(null); setError('')
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-canvas">
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Film size={14} className="text-accent" />
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Editor</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Upload once, get <span className="text-gradient">everything</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Captions · silence cut · 3 formats · clips · carousel · tweet thread — all automated.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main */}
          <div className="space-y-5">

            {/* Upload zone */}
            {status === 'idle' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div
                  onDrop={onDrop}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all',
                    dragOver || file
                      ? 'border-accent/60 bg-accent/5'
                      : 'border-border hover:border-border-2 hover:bg-white/[0.02]'
                  )}
                >
                  <input
                    ref={fileRef} type="file"
                    accept="video/*,audio/*"
                    className="hidden"
                    onChange={e => setFile(e.target.files?.[0] ?? null)}
                  />
                  {file ? (
                    <div>
                      <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Film size={20} className="text-accent" />
                      </div>
                      <p className="text-white font-semibold text-sm mb-0.5">{file.name}</p>
                      <p className="text-xs text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(1)} MB · {file.type}
                      </p>
                      <button
                        onClick={e => { e.stopPropagation(); setFile(null) }}
                        className="mt-3 text-xs text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Upload size={20} className="text-slate-400" />
                      </div>
                      <p className="text-white font-semibold text-sm mb-1">Drop your video here</p>
                      <p className="text-xs text-slate-500">MP4, MOV, AVI, MP3, WAV · up to 2GB</p>
                    </div>
                  )}
                </div>

                {file && (
                  <motion.button
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleProcess}
                    className="w-full btn-primary py-4 mt-4 flex items-center justify-center gap-2.5 text-sm font-semibold"
                  >
                    <Sparkles size={15} />
                    Process video — generate everything
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Processing state */}
            {(status === 'uploading' || status === 'processing') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-surface border border-border rounded-2xl p-8 text-center"
              >
                <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Loader2 size={24} className="text-accent animate-spin" />
                </div>
                <p className="text-white font-semibold mb-1">{progressText}</p>
                <p className="text-xs text-slate-500 mb-6">This takes 2–5 minutes depending on video length</p>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-accent to-accent-2 rounded-full"
                  />
                </div>
                <p className="text-xs text-slate-600">{progress}%</p>
              </motion.div>
            )}

            {/* Error state */}
            {status === 'failed' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center"
              >
                <AlertCircle size={24} className="text-rose-400 mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">Processing failed</p>
                <p className="text-xs text-rose-300 mb-4">{error}</p>
                <button onClick={reset} className="btn-outline text-xs">Try again</button>
              </motion.div>
            )}

            {/* Results */}
            {status === 'completed' && result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Success banner */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">All done!</p>
                    <p className="text-xs text-slate-400">
                      {Object.keys(result.format_urls ?? {}).length} formats ·{' '}
                      {result.clips?.length ?? 0} clips ·{' '}
                      {result.carousel_slides?.length ?? 0} carousel slides ·{' '}
                      {result.tweet_thread?.length ?? 0} tweets
                    </p>
                  </div>
                  <button onClick={reset} className="ml-auto btn-outline text-xs flex-shrink-0">
                    New video
                  </button>
                </div>

                {/* Format downloads */}
                {result.format_urls && Object.keys(result.format_urls).length > 0 && (
                  <ResultSection title="Exported formats" icon={Layers} defaultOpen>
                    <div className="space-y-2.5">
                      {Object.entries(result.format_urls).map(([fmt, url]) => (
                        <div key={fmt} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-border">
                          <div>
                            <p className="text-sm font-medium text-white">{FORMAT_LABELS[fmt]?.label ?? fmt}</p>
                            <p className="text-xs text-slate-500">{FORMAT_LABELS[fmt]?.desc}</p>
                          </div>
                          <a
                            href={url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-2 transition-colors font-medium"
                          >
                            <Download size={13} />
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </ResultSection>
                )}

                {/* Short clips */}
                {result.clips?.length > 0 && (
                  <ResultSection title={`${result.clips.length} short clips`} icon={Scissors}>
                    <div className="space-y-3">
                      {result.clips.map((clip, i) => (
                        <div key={i} className="p-3.5 bg-white/[0.03] rounded-xl border border-border">
                          <div className="flex items-start justify-between gap-3 mb-2">
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
                              <Play size={11} />
                              Download clip
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ResultSection>
                )}

                {/* Carousel */}
                {result.carousel_slides?.length > 0 && (
                  <ResultSection title="Carousel slides" icon={Image}>
                    <div className="space-y-2.5">
                      {result.carousel_slides.map((slide, i) => (
                        <div key={i} className="p-3.5 bg-white/[0.03] rounded-xl border border-border">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-semibold text-slate-600 bg-white/5 w-5 h-5 rounded-full flex items-center justify-center">
                              {slide.slide_number}
                            </span>
                            <p className="text-sm font-semibold text-white">{slide.headline}</p>
                          </div>
                          <ul className="space-y-1">
                            {slide.body?.map((b, j) => (
                              <li key={j} className="text-xs text-slate-400 flex gap-2">
                                <span className="text-accent mt-0.5">·</span>{b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </ResultSection>
                )}

                {/* Tweet thread */}
                {result.tweet_thread?.length > 0 && (
                  <ResultSection title="Tweet thread" icon={Twitter}>
                    <div className="space-y-2.5">
                      {result.tweet_thread.map((tweet, i) => (
                        <div key={i} className="p-3.5 bg-white/[0.03] rounded-xl border border-border">
                          <div className="flex items-start gap-2.5">
                            <span className="text-[10px] font-semibold text-slate-600 bg-white/5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-sm text-slate-300 leading-relaxed">{tweet}</p>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className={cn(
                              'text-[10px]',
                              tweet.length > 260 ? 'text-rose-400' : 'text-slate-600'
                            )}>
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
                  </ResultSection>
                )}

                {/* Newsletter */}
                {result.newsletter?.subject_line && (
                  <ResultSection title="Newsletter intro" icon={Mail}>
                    <div className="space-y-3">
                      <div className="p-3.5 bg-white/[0.03] rounded-xl border border-border">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Subject line</p>
                        <p className="text-sm font-semibold text-white">{result.newsletter.subject_line}</p>
                      </div>
                      {result.newsletter.intro && (
                        <div className="p-3.5 bg-white/[0.03] rounded-xl border border-border">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Intro</p>
                          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                            {result.newsletter.intro}
                          </p>
                        </div>
                      )}
                      {result.newsletter.key_takeaways?.length > 0 && (
                        <div className="p-3.5 bg-white/[0.03] rounded-xl border border-border">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Key takeaways</p>
                          <ul className="space-y-1.5">
                            {result.newsletter.key_takeaways.map((t, i) => (
                              <li key={i} className="text-sm text-slate-300 flex gap-2">
                                <span className="text-accent mt-0.5 flex-shrink-0">·</span>{t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </ResultSection>
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar: options */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-surface border border-border rounded-2xl p-4"
            >
              <p className="section-label mb-3">Processing options</p>
              <div className="space-y-2">
                <OptionToggle
                  label="Cut silences" desc="Remove pauses over 0.8s"
                  checked={options.cut_silences} onChange={v => setOption('cut_silences', v)}
                />
                <OptionToggle
                  label="Burn captions" desc="Auto-transcribe + overlay text"
                  checked={options.burn_captions} onChange={v => setOption('burn_captions', v)}
                />
                <OptionToggle
                  label="Extract clips" desc="Find top 3–5 short moments"
                  checked={options.extract_clips} onChange={v => setOption('extract_clips', v)}
                />
                <OptionToggle
                  label="Carousel slides" desc="5-slide image set from key quotes"
                  checked={options.generate_carousel} onChange={v => setOption('generate_carousel', v)}
                />
                <OptionToggle
                  label="Tweet thread" desc="5-tweet thread + newsletter draft"
                  checked={options.generate_thread} onChange={v => setOption('generate_thread', v)}
                />
              </div>
            </motion.div>

            {/* Caption style */}
            {options.burn_captions && (
              <motion.div
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 }}
                className="bg-surface border border-border rounded-2xl p-4"
              >
                <p className="section-label mb-3">Caption style</p>
                <div className="space-y-2">
                  {(['minimal', 'bold', 'colour_pop'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setOption('caption_style', s)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-medium transition-all',
                        options.caption_style === s
                          ? 'bg-accent/15 border-accent/40 text-white'
                          : 'border-border text-slate-400 hover:border-border-2'
                      )}
                    >
                      <span className="capitalize">{s.replace('_', ' ')}</span>
                      {options.caption_style === s && (
                        <CheckCircle size={13} className="text-accent" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
              className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4"
            >
              <p className="text-xs font-semibold text-amber-400 mb-1.5">Processing time</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                A 10-minute video takes ~3 minutes to fully process. Audio-only is faster (~1 min).
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

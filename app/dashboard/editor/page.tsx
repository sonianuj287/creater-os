'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Film, Scissors, Layers, Download, Sparkles,
  CheckCircle, Loader2, AlertCircle, ChevronDown, ChevronUp,
  Twitter, Image, Mail, Play, Music, Smile, Mic,
  Eye, ArrowRight, RefreshCw,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

type JobStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed'

interface ProcessingOptions {
  cut_silences:      boolean
  burn_captions:     boolean
  caption_style:     'minimal' | 'bold' | 'colour_pop'
  extract_clips:     boolean
  generate_carousel: boolean
  generate_thread:   boolean
  add_intro:         boolean
  intro_text:        string
  add_music:         boolean
  music_style:       string
  blur_faces:        boolean
}

interface JobResult {
  format_urls:     Record<string, string>
  clips:           Array<{ title: string; url: string; hook: string; engagement_score: number; start_seconds: number; end_seconds: number }>
  carousel_slides: Array<{ slide_number: number; headline: string; body: string[]; type: string }>
  tweet_thread:    string[]
  newsletter:      { subject_line: string; intro: string; key_takeaways: string[] }
}

const FORMAT_LABELS: Record<string, { label: string; desc: string; icon: string }> = {
  '9x16': { label: '9:16 Vertical', desc: 'Reels · Shorts · TikTok', icon: '📱' },
  '1x1':  { label: '1:1 Square',    desc: 'Instagram feed',           icon: '⬜' },
  '16x9': { label: '16:9 Wide',     desc: 'YouTube',                  icon: '🖥️' },
}

const MUSIC_STYLES = [
  { id: 'upbeat',    label: 'Upbeat',     desc: 'Energetic, motivational' },
  { id: 'calm',      label: 'Calm',       desc: 'Soft background, focus' },
  { id: 'cinematic', label: 'Cinematic',  desc: 'Epic, storytelling' },
  { id: 'lofi',      label: 'Lo-fi',      desc: 'Chill, casual' },
]

const STEP_MESSAGES = [
  'Downloading your video...',
  'Transcribing audio with AI...',
  'Cutting silences...',
  'Burning captions...',
  'Exporting 3 formats...',
  'Detecting best clips...',
  'Generating carousel slides...',
  'Writing tweet thread...',
  'Saving everything...',
]

function Toggle({ label, desc, checked, onChange }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-start justify-between gap-3 p-3.5 rounded-xl border text-left transition-all w-full',
        checked ? 'bg-accent/10 border-accent/40' : 'border-border hover:border-border-2'
      )}
    >
      <div className="flex-1">
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

function ResultSection({ title, icon: Icon, children, defaultOpen = false, count }: any) {
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
          {count > 0 && (
            <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full">{count}</span>
          )}
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
            className="overflow-hidden border-t border-border"
          >
            <div className="px-5 pb-5 pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Video preview component
function VideoPreview({ url, label }: { url: string; label: string }) {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  function toggle() {
    if (!videoRef.current) return
    if (playing) { videoRef.current.pause(); setPlaying(false) }
    else { videoRef.current.play(); setPlaying(true) }
  }

  return (
    <div className="relative bg-black rounded-xl overflow-hidden aspect-video group cursor-pointer" onClick={toggle}>
      <video ref={videoRef} src={url} className="w-full h-full object-contain" onEnded={() => setPlaying(false)} />
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
            <Play size={18} className="text-black ml-0.5" />
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
        <span className="text-[10px] font-medium text-white bg-black/60 px-2 py-0.5 rounded-full">{label}</span>
        <a
          href={url} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-[10px] font-medium text-white bg-black/60 px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-black/80"
        >
          <Download size={9} /> Download
        </a>
      </div>
    </div>
  )
}

export default function EditorPage() {
  const [file, setFile]               = useState<File | null>(null)
  const [dragOver, setDragOver]       = useState(false)
  const [status, setStatus]           = useState<JobStatus>('idle')
  const [progress, setProgress]       = useState(0)
  const [progressText, setProgressText] = useState('')
  const [stepIdx, setStepIdx]         = useState(0)
  const [result, setResult]           = useState<JobResult | null>(null)
  const [error, setError]             = useState('')
  const [previewFormat, setPreviewFormat] = useState<string | null>(null)
  const fileRef                       = useRef<HTMLInputElement>(null)

  const [options, setOptions] = useState<ProcessingOptions>({
    cut_silences:      true,
    burn_captions:     true,
    caption_style:     'bold',
    extract_clips:     true,
    generate_carousel: true,
    generate_thread:   true,
    add_intro:         false,
    intro_text:        '',
    add_music:         false,
    music_style:       'upbeat',
    blur_faces:        false,
  })

  const setOpt = (k: keyof ProcessingOptions, v: any) =>
    setOptions(p => ({ ...p, [k]: v }))

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.type.startsWith('video/') || f.type.startsWith('audio/'))) setFile(f)
  }, [])

  async function handleProcess() {
    if (!file) return
    setError(''); setStatus('uploading'); setProgress(5); setProgressText('Getting upload URL...')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: project } = await supabase.from('projects').insert({
        user_id: user.id,
        title: file.name.replace(/\.[^.]+$/, ''),
        status: 'editing',
      }).select().single()
      if (!project) throw new Error('Could not create project')

      setProgressText('Preparing upload...')
      const urlRes = await fetch(`${BACKEND}/media/upload-url`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, content_type: file.type, user_id: user.id, project_id: project.id }),
      })
      if (!urlRes.ok) throw new Error('Failed to get upload URL')
      const { upload_url, key } = await urlRes.json()

      setProgressText('Uploading to cloud...'); setProgress(15)
      const uploadRes = await fetch(upload_url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      if (!uploadRes.ok) throw new Error('Upload failed')

      setProgress(30); setProgressText('Starting AI processing...'); setStatus('processing')

      const processRes = await fetch(`${BACKEND}/media/process`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.id, user_id: user.id, s3_key: key,
          title: file.name.replace(/\.[^.]+$/, ''), options,
        }),
      })
      if (!processRes.ok) throw new Error('Failed to start processing')
      const { output_id } = await processRes.json()
      await pollStatus(output_id)
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong'); setStatus('failed')
    }
  }

  async function pollStatus(id: string) {
    const MAX = 120
    for (let i = 0; i < MAX; i++) {
      await new Promise(r => setTimeout(r, 3000))
      const res = await fetch(`${BACKEND}/media/status/${id}`)
      if (!res.ok) continue
      const data = await res.json()
      if (data.status === 'completed') {
        setResult(data as JobResult); setStatus('completed'); setProgress(100); setProgressText('Done!')
        return
      }
      if (data.status === 'failed') { setError(data.error ?? 'Processing failed'); setStatus('failed'); return }
      const p = 30 + Math.min(65, (i / MAX) * 65)
      setProgress(Math.round(p))
      const idx = Math.min(Math.floor(i / 13), STEP_MESSAGES.length - 1)
      setStepIdx(idx); setProgressText(STEP_MESSAGES[idx])
    }
    setError('Processing timed out'); setStatus('failed')
  }

  function reset() {
    setFile(null); setStatus('idle'); setProgress(0)
    setProgressText(''); setResult(null); setError(''); setPreviewFormat(null)
  }

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
            Auto captions · silence cut · 3 formats · clips · carousel · tweet thread
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-6">
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
                    dragOver || file ? 'border-accent/60 bg-accent/5' : 'border-border hover:border-border-2 hover:bg-white/[0.02]'
                  )}
                >
                  <input ref={fileRef} type="file" accept="video/*,audio/*" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                  {file ? (
                    <div>
                      <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-3"><Film size={20} className="text-accent" /></div>
                      <p className="text-white font-semibold text-sm mb-0.5">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB · {file.type}</p>
                      <button onClick={e => { e.stopPropagation(); setFile(null) }} className="mt-3 text-xs text-slate-500 hover:text-rose-400 transition-colors">Remove</button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3"><Upload size={20} className="text-slate-400" /></div>
                      <p className="text-white font-semibold text-sm mb-1">Drop your video here</p>
                      <p className="text-xs text-slate-500">MP4, MOV, AVI, MP3, WAV · up to 2GB</p>
                    </div>
                  )}
                </div>

                {file && (
                  <motion.button
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    onClick={handleProcess}
                    className="w-full btn-primary py-4 mt-4 flex items-center justify-center gap-2.5 text-sm font-semibold"
                  >
                    <Sparkles size={15} />Process video — generate everything
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Processing */}
            {(status === 'uploading' || status === 'processing') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-border rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center">
                    <Loader2 size={24} className="text-accent animate-spin" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{progressText}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Step {stepIdx + 1} of {STEP_MESSAGES.length}</p>
                  </div>
                </div>

                {/* Step progress */}
                <div className="flex gap-1 mb-4">
                  {STEP_MESSAGES.map((_, i) => (
                    <div key={i} className={cn(
                      'flex-1 h-1 rounded-full transition-all duration-500',
                      i < stepIdx ? 'bg-accent' : i === stepIdx ? 'bg-accent/60' : 'bg-white/10'
                    )} />
                  ))}
                </div>

                <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                  <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} className="h-full bg-gradient-to-r from-accent to-accent-2 rounded-full" />
                </div>
                <p className="text-xs text-slate-600 text-right">{progress}%</p>
                <p className="text-xs text-slate-600 text-center mt-3">2–5 minutes depending on video length. Don't close this tab.</p>
              </motion.div>
            )}

            {/* Error */}
            {status === 'failed' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center">
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
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">All done!</p>
                    <p className="text-xs text-slate-400">
                      {Object.keys(result.format_urls ?? {}).length} formats ·{' '}
                      {result.clips?.length ?? 0} clips ·{' '}
                      {result.carousel_slides?.length ?? 0} carousel slides ·{' '}
                      {result.tweet_thread?.length ?? 0} tweets
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a href="/dashboard/publish" className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5">
                      Publish <ArrowRight size={12} />
                    </a>
                    <button onClick={reset} className="btn-outline text-xs py-2 px-3">New video</button>
                  </div>
                </div>

                {/* Video previews */}
                {result.format_urls && Object.keys(result.format_urls).length > 0 && (
                  <ResultSection title="Exported formats" icon={Layers} defaultOpen count={Object.keys(result.format_urls).length}>
                    <div className="space-y-4">
                      {/* Format tabs */}
                      <div className="flex gap-2">
                        {Object.keys(result.format_urls).map(fmt => (
                          <button
                            key={fmt}
                            onClick={() => setPreviewFormat(previewFormat === fmt ? null : fmt)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all',
                              previewFormat === fmt ? 'bg-accent/20 border-accent/40 text-accent' : 'border-border text-slate-400 hover:border-border-2'
                            )}
                          >
                            <Eye size={11} />
                            {FORMAT_LABELS[fmt]?.icon} {FORMAT_LABELS[fmt]?.label ?? fmt}
                          </button>
                        ))}
                      </div>

                      {/* Video preview */}
                      <AnimatePresence>
                        {previewFormat && result.format_urls[previewFormat] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <VideoPreview url={result.format_urls[previewFormat]} label={FORMAT_LABELS[previewFormat]?.label ?? previewFormat} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Download buttons */}
                      <div className="space-y-2">
                        {Object.entries(result.format_urls).map(([fmt, url]) => (
                          <div key={fmt} className="flex items-center justify-between p-3.5 bg-white/[0.03] border border-border rounded-xl">
                            <div>
                              <p className="text-sm font-medium text-white">{FORMAT_LABELS[fmt]?.label ?? fmt}</p>
                              <p className="text-xs text-slate-500">{FORMAT_LABELS[fmt]?.desc}</p>
                            </div>
                            <a href={url as string} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 btn-outline text-xs py-1.5 px-3">
                              <Download size={12} />Download
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ResultSection>
                )}

                {/* Short clips with preview */}
                {result.clips?.length > 0 && (
                  <ResultSection title="Short clips" icon={Scissors} count={result.clips.length}>
                    <div className="space-y-3">
                      {result.clips.map((clip: any, i: number) => (
                        <div key={i} className="p-3.5 bg-white/[0.03] border border-border rounded-xl">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-sm font-medium text-white">{clip.title}</p>
                            <span className={cn('text-xs font-semibold flex-shrink-0', clip.engagement_score >= 80 ? 'text-emerald-400' : 'text-amber-400')}>
                              {clip.engagement_score}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 italic mb-3">"{clip.hook}"</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600">{clip.start_seconds?.toFixed(0)}s – {clip.end_seconds?.toFixed(0)}s</span>
                            <div className="flex gap-2">
                              <a href={clip.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-slate-400 hover:text-white">
                                <Play size={11} />Preview
                              </a>
                              <a href={clip.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-accent hover:text-accent-2 font-medium">
                                <Download size={11} />Download
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ResultSection>
                )}

                {/* Carousel */}
                {result.carousel_slides?.length > 0 && (
                  <ResultSection title="Carousel slides" icon={Image} count={result.carousel_slides.length}>
                    <div className="grid grid-cols-2 gap-2.5">
                      {result.carousel_slides.map((slide: any, i: number) => (
                        <div key={i} className={cn(
                          'p-3.5 rounded-xl border',
                          slide.type === 'hook' ? 'border-accent/40 bg-accent/5' :
                          slide.type === 'cta'  ? 'border-emerald-500/30 bg-emerald-500/5' :
                          'border-border bg-white/[0.02]'
                        )}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold text-slate-600 bg-white/5 w-5 h-5 rounded-full flex items-center justify-center">{slide.slide_number}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{slide.type}</span>
                          </div>
                          <p className="text-xs font-semibold text-white mb-1.5 leading-snug">{slide.headline}</p>
                          <ul className="space-y-0.5">
                            {slide.body?.map((b: string, j: number) => (
                              <li key={j} className="text-[10px] text-slate-400 flex gap-1.5"><span className="text-accent mt-0.5">·</span>{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </ResultSection>
                )}

                {/* Tweet thread */}
                {result.tweet_thread?.length > 0 && (
                  <ResultSection title="Tweet thread" icon={Twitter} count={result.tweet_thread.length}>
                    <div className="space-y-2.5">
                      {result.tweet_thread.map((tweet: string, i: number) => (
                        <div key={i} className="p-3.5 bg-white/[0.03] border border-border rounded-xl">
                          <div className="flex items-start gap-2.5">
                            <span className="text-[10px] font-bold text-slate-600 bg-white/5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                            <p className="text-sm text-slate-300 leading-relaxed flex-1">{tweet}</p>
                          </div>
                          <div className="flex justify-between mt-2">
                            <span className={cn('text-[10px]', tweet.length > 260 ? 'text-rose-400' : 'text-slate-600')}>{tweet.length}/280</span>
                            <button onClick={() => navigator.clipboard.writeText(tweet)} className="text-[10px] text-slate-600 hover:text-accent transition-colors">Copy</button>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => navigator.clipboard.writeText(result.tweet_thread.join('\n\n'))} className="w-full text-xs text-slate-500 hover:text-accent transition-colors py-2 border border-border rounded-lg">
                        Copy full thread
                      </button>
                    </div>
                  </ResultSection>
                )}

                {/* Newsletter */}
                {result.newsletter?.subject_line && (
                  <ResultSection title="Newsletter draft" icon={Mail}>
                    <div className="space-y-3">
                      <div className="p-3.5 bg-white/[0.03] border border-border rounded-xl">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Subject line</p>
                        <p className="text-sm font-semibold text-white">{result.newsletter.subject_line}</p>
                      </div>
                      {result.newsletter.intro && (
                        <div className="p-3.5 bg-white/[0.03] border border-border rounded-xl">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Intro</p>
                          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{result.newsletter.intro}</p>
                        </div>
                      )}
                      {result.newsletter.key_takeaways?.length > 0 && (
                        <div className="p-3.5 bg-white/[0.03] border border-border rounded-xl">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Key takeaways</p>
                          <ul className="space-y-1.5">
                            {result.newsletter.key_takeaways.map((t: string, i: number) => (
                              <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-accent mt-0.5 flex-shrink-0">·</span>{t}</li>
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
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-surface border border-border rounded-2xl p-4">
              <p className="section-label mb-3">Core options</p>
              <div className="space-y-2">
                <Toggle label="Cut silences"    desc="Remove pauses over 0.8s"              checked={options.cut_silences}      onChange={v => setOpt('cut_silences', v)} />
                <Toggle label="Burn captions"   desc="Auto-transcribe + overlay text"        checked={options.burn_captions}     onChange={v => setOpt('burn_captions', v)} />
                <Toggle label="Extract clips"   desc="Find top 3–5 golden moments"           checked={options.extract_clips}     onChange={v => setOpt('extract_clips', v)} />
                <Toggle label="Carousel slides" desc="5-slide image set from key quotes"     checked={options.generate_carousel} onChange={v => setOpt('generate_carousel', v)} />
                <Toggle label="Tweet thread"    desc="5-tweet thread + newsletter draft"     checked={options.generate_thread}   onChange={v => setOpt('generate_thread', v)} />
              </div>
            </motion.div>

            {/* Caption style */}
            {options.burn_captions && (
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="bg-surface border border-border rounded-2xl p-4">
                <p className="section-label mb-3">Caption style</p>
                <div className="space-y-2">
                  {(['minimal', 'bold', 'colour_pop'] as const).map(s => (
                    <button key={s} onClick={() => setOpt('caption_style', s)}
                      className={cn('w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-medium transition-all',
                        options.caption_style === s ? 'bg-accent/15 border-accent/40 text-white' : 'border-border text-slate-400 hover:border-border-2'
                      )}>
                      <span className="capitalize">{s.replace('_', ' ')}</span>
                      {options.caption_style === s && <CheckCircle size={13} className="text-accent" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Intro card option */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="bg-surface border border-border rounded-2xl p-4">
              <p className="section-label mb-3">Intro card</p>
              <Toggle label="Add intro card" desc="Text overlay at the start" checked={options.add_intro} onChange={v => setOpt('add_intro', v)} />
              {options.add_intro && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 overflow-hidden">
                  <input
                    type="text" placeholder="e.g. Your channel name or tagline"
                    value={options.intro_text} onChange={e => setOpt('intro_text', e.target.value)}
                    className="input w-full text-sm"
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Music */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-surface border border-border rounded-2xl p-4">
              <p className="section-label mb-3">Background music</p>
              <Toggle label="Add background music" desc="Royalty-free music suggestion" checked={options.add_music} onChange={v => setOpt('add_music', v)} />
              {options.add_music && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 overflow-hidden">
                  <div className="grid grid-cols-2 gap-1.5">
                    {MUSIC_STYLES.map(m => (
                      <button key={m.id} onClick={() => setOpt('music_style', m.id)}
                        className={cn('p-2.5 rounded-lg border text-left transition-all',
                          options.music_style === m.id ? 'bg-accent/15 border-accent/40' : 'border-border hover:border-border-2'
                        )}>
                        <p className={cn('text-xs font-medium', options.music_style === m.id ? 'text-white' : 'text-slate-300')}>{m.label}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-600 mt-2">Music suggestion added to output notes. Add manually in your editor.</p>
                </motion.div>
              )}
            </motion.div>

            {/* Face blur */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="bg-surface border border-border rounded-2xl p-4">
              <p className="section-label mb-3">Privacy</p>
              <Toggle label="Blur faces" desc="Auto-detect and blur all faces" checked={options.blur_faces} onChange={v => setOpt('blur_faces', v)} />
              {options.blur_faces && (
                <p className="text-[10px] text-amber-400 mt-2">Note: face blur adds 2–3 min processing time</p>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
              <p className="text-xs font-semibold text-amber-400 mb-1.5">Processing time</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                A 10-min video takes ~3 min. Keep this tab open.
                <br />720p output (upgrade Railway for 1080p).
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

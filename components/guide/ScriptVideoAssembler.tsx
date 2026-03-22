'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Film, CheckCircle, Loader2, Play,
  Combine, Music, Scissors, ArrowRight, X,
  AlertCircle, Download,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

interface ScriptSection {
  section: string
  content: string
  tips: string
}

interface SceneClip {
  sectionKey: string
  file: File | null
  uploadKey: string | null
  status: 'idle' | 'uploading' | 'done' | 'error'
  progress: number
  previewUrl: string | null
}

const SECTION_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  hook:         { label: 'Hook',          color: '#7c6af5', icon: '🎣' },
  context:      { label: 'Context',       color: '#3b82f6', icon: '📖' },
  main_point_1: { label: 'Main Point 1',  color: '#06b6d4', icon: '1️⃣' },
  main_point_2: { label: 'Main Point 2',  color: '#10b981', icon: '2️⃣' },
  main_point_3: { label: 'Main Point 3',  color: '#10b981', icon: '3️⃣' },
  cta:          { label: 'Call to Action', color: '#f59e0b', icon: '🎯' },
}

interface Props {
  sections: ScriptSection[]
  projectTitle: string
  projectId?: string
}

export function ScriptVideoAssembler({ sections, projectTitle, projectId }: Props) {
  const [scenes, setScenes] = useState<Record<string, SceneClip>>(() =>
    Object.fromEntries(sections.map(s => [s.section, {
      sectionKey: s.section, file: null, uploadKey: null,
      status: 'idle', progress: 0, previewUrl: null,
    }]))
  )
  const [assembling, setAssembling] = useState(false)
  const [assembleProgress, setAssembleProgress] = useState(0)
  const [assembleStep, setAssembleStep] = useState('')
  const [resultOutputId, setResultOutputId] = useState('')
  const [resultUrls, setResultUrls] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [musicStyle, setMusicStyle] = useState('upbeat')
  const [addCaptions, setAddCaptions] = useState(true)

  const uploadedCount = Object.values(scenes).filter(s => s.status === 'done').length
  const allUploaded   = uploadedCount === sections.length
  const anyUploaded   = uploadedCount > 0

  function handleFileSelect(sectionKey: string, file: File) {
    const previewUrl = URL.createObjectURL(file)
    setScenes(prev => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], file, previewUrl, status: 'idle' },
    }))
  }

  async function uploadScene(sectionKey: string) {
    const scene = scenes[sectionKey]
    if (!scene.file) return

    setScenes(prev => ({ ...prev, [sectionKey]: { ...prev[sectionKey], status: 'uploading', progress: 0 } }))

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get upload URL
      const urlRes = await fetch(`${BACKEND}/media/upload-url`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `${sectionKey}_${scene.file.name}`,
          content_type: scene.file.type,
          user_id: user.id,
          project_id: projectId ?? 'assembler',
        }),
      })
      if (!urlRes.ok) throw new Error('Failed to get upload URL')
      const { upload_url, key } = await urlRes.json()

      // Upload with progress tracking using XMLHttpRequest
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100)
            setScenes(prev => ({ ...prev, [sectionKey]: { ...prev[sectionKey], progress: pct } }))
          }
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(`Upload failed: ${xhr.status}`))
        }
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.open('PUT', upload_url)
        xhr.setRequestHeader('Content-Type', scene.file!.type)
        xhr.send(scene.file)
      })

      setScenes(prev => ({ ...prev, [sectionKey]: { ...prev[sectionKey], status: 'done', progress: 100, uploadKey: key } }))
    } catch (e: any) {
      setScenes(prev => ({ ...prev, [sectionKey]: { ...prev[sectionKey], status: 'error', progress: 0 } }))
    }
  }

  async function handleAssemble() {
    if (!anyUploaded) return
    setAssembling(true)
    setError('')
    setAssembleProgress(5)
    setAssembleStep('Starting assembly...')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get the ordered list of uploaded S3 keys
      const orderedKeys = sections
        .map(s => scenes[s.section])
        .filter(sc => sc.status === 'done' && sc.uploadKey)
        .map(sc => sc.uploadKey!)

      if (orderedKeys.length === 0) throw new Error('No scenes uploaded')

      setAssembleStep('Sending to AI editor...')
      setAssembleProgress(15)

      const resp = await fetch(`${BACKEND}/media/assemble`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:      user.id,
          project_id:   projectId ?? `assembler_${Date.now()}`,
          title:        projectTitle,
          scene_keys:   orderedKeys,
          options: {
            burn_captions:     addCaptions,
            caption_style:     'bold',
            add_music:         true,
            music_style:       musicStyle,
            cut_silences:      true,
            extract_clips:     false,
            generate_carousel: false,
            generate_thread:   false,
          },
        }),
      })

      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.detail ?? 'Assembly failed')
      }

      const { output_id } = await resp.json()
      setResultOutputId(output_id)

      // Poll for completion
      await pollAssembly(output_id)

    } catch (e: any) {
      setError(e.message ?? 'Assembly failed')
      setAssembling(false)
    }
  }

  async function pollAssembly(outputId: string) {
    const steps = [
      'Combining scenes in order...',
      'Cutting silences between clips...',
      'Burning captions on video...',
      'Adding background music...',
      'Exporting in 3 formats...',
      'Finishing up...',
    ]
    let stepIdx = 0

    for (let i = 0; i < 120; i++) {
      await new Promise(r => setTimeout(r, 3000))
      const res = await fetch(`${BACKEND}/media/status/${outputId}`)
      if (!res.ok) continue
      const data = await res.json()

      if (data.status === 'completed') {
        setResultUrls(data.format_urls ?? {})
        setAssembleProgress(100)
        setAssembleStep('Your video is ready!')
        setAssembling(false)
        return
      }
      if (data.status === 'failed') {
        setError(data.error ?? 'Assembly failed')
        setAssembling(false)
        return
      }

      const p = 20 + Math.min(75, (i / 120) * 75)
      setAssembleProgress(Math.round(p))
      if (i % 5 === 0 && stepIdx < steps.length - 1) stepIdx++
      setAssembleStep(steps[stepIdx])
    }
    setError('Assembly timed out')
    setAssembling(false)
  }

  const FORMAT_LABELS: Record<string, string> = {
    '9x16': '📱 9:16 Vertical (Reels)',
    '1x1':  '⬜ 1:1 Square (Feed)',
    '16x9': '🖥️ 16:9 Wide (YouTube)',
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4">
        <div className="flex items-center gap-2.5 mb-1">
          <Combine size={15} className="text-accent" />
          <p className="text-sm font-semibold text-white">Scene-by-scene assembler</p>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Upload each script section as a separate clip. The AI combines them in order, cuts silences, burns captions, and creates a polished video.
        </p>
      </div>

      {/* Scene upload cards */}
      <div className="space-y-3">
        {sections.map((section, i) => {
          const scene = scenes[section.section]
          const meta  = SECTION_LABELS[section.section] ?? { label: section.section, color: '#888', icon: '🎬' }

          return (
            <motion.div
              key={section.section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                'border rounded-2xl overflow-hidden transition-all',
                scene.status === 'done'  ? 'border-emerald-500/40 bg-emerald-500/5' :
                scene.status === 'error' ? 'border-rose-500/30 bg-rose-500/5' :
                scene.file               ? 'border-accent/40 bg-accent/5' :
                'border-border bg-surface'
              )}
            >
              {/* Section header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{meta.icon}</span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: meta.color }}>
                      {meta.label}
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{section.content.slice(0, 60)}...</p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {scene.status === 'done' && <CheckCircle size={15} className="text-emerald-400" />}
                  {scene.status === 'uploading' && <Loader2 size={15} className="text-accent animate-spin" />}
                  {scene.status === 'error' && <AlertCircle size={15} className="text-rose-400" />}
                  {scene.status !== 'done' && (
                    <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                      Scene {i + 1}
                    </span>
                  )}
                  {scene.status === 'done' && (
                    <button
                      onClick={() => setScenes(prev => ({ ...prev, [section.section]: { ...prev[section.section], file: null, uploadKey: null, status: 'idle', progress: 0, previewUrl: null } }))}
                      className="text-slate-600 hover:text-rose-400 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Upload area */}
              <div className="p-4">
                {scene.status === 'done' && scene.previewUrl ? (
                  <div className="flex items-center gap-3">
                    <video src={scene.previewUrl} className="w-20 h-14 rounded-lg object-cover bg-black" />
                    <div>
                      <p className="text-xs font-medium text-white">{scene.file?.name}</p>
                      <p className="text-[10px] text-emerald-400 mt-0.5">✓ Uploaded successfully</p>
                    </div>
                  </div>
                ) : scene.status === 'uploading' ? (
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <p className="text-xs text-slate-400">Uploading...</p>
                      <p className="text-xs text-accent">{scene.progress}%</p>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${scene.progress}%` }} />
                    </div>
                  </div>
                ) : (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="file" accept="video/*" className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (f) { handleFileSelect(section.section, f); setTimeout(() => uploadScene(section.section), 100) }
                      }}
                    />
                    <div className={cn(
                      'flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all',
                      scene.file
                        ? 'border-accent/40 bg-accent/10 text-accent'
                        : 'border-border text-slate-400 hover:border-border-2 hover:text-white hover:bg-white/5 group-hover:border-white/20'
                    )}>
                      <Upload size={13} />
                      {scene.file ? `Re-upload scene ${i + 1}` : `Upload scene ${i + 1}`}
                    </div>
                    <p className="text-xs text-slate-600">Record "{meta.label}" and upload here</p>
                  </label>
                )}

                {scene.status === 'error' && (
                  <p className="text-xs text-rose-400 mt-2">Upload failed — try again</p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Options + assemble */}
      {anyUploaded && !assembling && Object.keys(resultUrls).length === 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-surface border border-border rounded-2xl p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Final video options</p>

            {/* Captions toggle */}
            <button
              onClick={() => setAddCaptions(!addCaptions)}
              className={cn('w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all',
                addCaptions ? 'bg-accent/10 border-accent/40' : 'border-border hover:border-border-2'
              )}
            >
              <div>
                <p className={cn('font-medium', addCaptions ? 'text-white' : 'text-slate-300')}>Burn captions</p>
                <p className="text-xs text-slate-500 mt-0.5">Auto-transcribe and overlay text</p>
              </div>
              <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                addCaptions ? 'border-accent bg-accent' : 'border-slate-600'
              )}>
                {addCaptions && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>

            {/* Music style */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Background music</p>
              <div className="grid grid-cols-4 gap-1.5">
                {['upbeat', 'calm', 'cinematic', 'lofi'].map(m => (
                  <button key={m} onClick={() => setMusicStyle(m)}
                    className={cn('py-2 rounded-lg border text-xs font-medium capitalize transition-all',
                      musicStyle === m ? 'bg-accent/20 border-accent/40 text-accent' : 'border-border text-slate-500 hover:border-border-2'
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-600 mt-1.5">Music suggestion — add to your edit after export</p>
            </div>
          </div>

          {/* Progress summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>{uploadedCount} of {sections.length} scenes uploaded</span>
            {!allUploaded && <span className="text-amber-400">{sections.length - uploadedCount} scenes missing — will be skipped</span>}
          </div>

          {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</p>}

          <button
            onClick={handleAssemble}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2.5 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c6af5, #ec4899)', boxShadow: '0 0 30px rgba(124,106,245,0.3)' }}
          >
            <Combine size={16} />
            Assemble {uploadedCount} scene{uploadedCount !== 1 ? 's' : ''} into final video
          </button>
        </motion.div>
      )}

      {/* Assembly progress */}
      {assembling && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-border rounded-2xl p-6 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #7c6af522, #ec489922)' }}>
            <Loader2 size={24} className="animate-spin text-violet-400" />
          </div>
          <p className="text-white font-semibold mb-1">{assembleStep}</p>
          <p className="text-xs text-slate-500 mb-5">Combining {uploadedCount} scenes into one polished video</p>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
            <motion.div animate={{ width: `${assembleProgress}%` }} transition={{ duration: 0.5 }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #7c6af5, #ec4899)' }}
            />
          </div>
          <p className="text-xs text-slate-600">{assembleProgress}%</p>
        </motion.div>
      )}

      {/* Results */}
      {Object.keys(resultUrls).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle size={18} className="text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-white">Your video is ready!</p>
              <p className="text-xs text-slate-400">All {uploadedCount} scenes assembled, captions burned, exported in 3 formats.</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {Object.entries(resultUrls).map(([fmt, url]) => (
              <div key={fmt} className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
                <p className="text-sm font-medium text-white">{FORMAT_LABELS[fmt] ?? fmt}</p>
                <a href={url as string} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 btn-primary text-xs py-2 px-3"
                >
                  <Download size={12} />Download
                </a>
              </div>
            ))}
          </div>

          <a href="/dashboard/publish" className="w-full btn-outline flex items-center justify-center gap-2 py-3 text-sm">
            Go to Publish to post this video <ArrowRight size={13} />
          </a>
        </motion.div>
      )}
    </div>
  )
}

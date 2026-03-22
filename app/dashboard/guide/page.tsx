'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Film, Target, Lightbulb, Sparkles,
  ChevronDown, ChevronUp, Copy, CheckCheck,
  RefreshCw, ArrowRight, Loader2, ExternalLink,
} from 'lucide-react'
import { generateScript, generateShotList, type ScriptSection } from '@/lib/api'
import { NICHES, PLATFORMS, FORMATS, cn, getNicheEmoji } from '@/lib/utils'
import type { Niche, Platform, ContentFormat } from '@/types'

const SECTION_LABELS: Record<string, string> = {
  hook:         'Hook',
  context:      'Context',
  main_point_1: 'Main point 1',
  main_point_2: 'Main point 2',
  main_point_3: 'Main point 3',
  cta:          'Call to action',
}

const SECTION_COLORS: Record<string, string> = {
  hook:         'text-purple-400 bg-purple-500/10 border-purple-500/20',
  context:      'text-blue-400 bg-blue-500/10 border-blue-500/20',
  main_point_1: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  main_point_2: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  main_point_3: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  cta:          'text-amber-400 bg-amber-500/10 border-amber-500/20',
}

const SHOT_TYPE_LABELS: Record<string, string> = {
  talking_head:  'Talking head',
  broll:         'B-roll',
  screen_record: 'Screen record',
  text_slide:    'Text slide',
}

const SHOT_TYPE_COLORS: Record<string, string> = {
  talking_head:  'bg-purple-500/15 text-purple-300',
  broll:         'bg-teal-500/15 text-teal-300',
  screen_record: 'bg-blue-500/15 text-blue-300',
  text_slide:    'bg-amber-500/15 text-amber-300',
}

function ScriptSectionCard({ section, index }: { section: ScriptSection; index: number }) {
  const [open, setOpen]       = useState(index === 0)
  const [copied, setCopied]   = useState(false)
  const [edited, setEdited]   = useState(section.content)

  async function copy() {
    await navigator.clipboard.writeText(edited)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const label = SECTION_LABELS[section.section] ?? section.section
  const color = SECTION_COLORS[section.section] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/20'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-surface border border-border rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-md border', color)}>
            {label}
          </span>
          {!open && (
            <p className="text-xs text-slate-500 truncate max-w-xs">
              {section.content.slice(0, 60)}...
            </p>
          )}
        </div>
        {open
          ? <ChevronUp size={14} className="text-slate-500 flex-shrink-0" />
          : <ChevronDown size={14} className="text-slate-500 flex-shrink-0" />
        }
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
            <div className="p-4 space-y-3">
              <textarea
                value={edited}
                onChange={e => setEdited(e.target.value)}
                rows={4}
                className="input w-full resize-none text-sm leading-relaxed"
              />
              {section.tips && (
                <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                  <Lightbulb size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300 leading-relaxed">{section.tips}</p>
                </div>
              )}
              <button
                onClick={copy}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-accent transition-colors"
              >
                {copied
                  ? <><CheckCheck size={12} className="text-emerald-400" />Copied</>
                  : <><Copy size={12} />Copy section</>
                }
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function GuidePage() {
  const searchParams = useSearchParams()
  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [hook, setHook]             = useState('')
  const [niche, setNiche]           = useState<Niche>('finance')
  const [platform, setPlatform]     = useState<Platform>('instagram')
  const [format, setFormat]         = useState<ContentFormat>('reel')
  const [duration, setDuration]     = useState(3)

  const [loadingScript, setLoadingScript]     = useState(false)
  const [loadingShotList, setLoadingShotList] = useState(false)
  const [scriptSections, setScriptSections]   = useState<ScriptSection[]>([])
  const [shotList, setShotList]               = useState<any>(null)
  const [error, setError]                     = useState('')

  const [activeTab, setActiveTab] = useState<'setup' | 'script' | 'shots'>('setup')

  useEffect(() => {
    const t = searchParams.get('title')
    const n = searchParams.get('niche')
    if (t) setTitle(decodeURIComponent(t))
    if (n) setNiche(n as any)
  }, [])

  async function handleGenerateScript() {
    if (!title.trim()) return
    setLoadingScript(true)
    setError('')
    try {
      const result = await generateScript({
        title,
        description: description || title,
        hook: hook || '',
        platform,
        niche,
        duration_minutes: duration,
      })
      setScriptSections(result.sections)
      setActiveTab('script')
    } catch (e: any) {
      setError(e.message ?? 'Script generation failed')
    } finally {
      setLoadingScript(false)
    }
  }

  async function handleGenerateShotList() {
    if (!scriptSections.length) return
    setLoadingShotList(true)
    setError('')
    try {
      const result = await generateShotList({
        title,
        script_sections: scriptSections,
        format,
        platform,
      })
      setShotList(result)
      setActiveTab('shots')
    } catch (e: any) {
      setError(e.message ?? 'Shot list generation failed')
    } finally {
      setLoadingShotList(false)
    }
  }

  const totalWords = scriptSections.reduce((acc, s) => acc + s.content.split(' ').length, 0)

  return (
    <div className="min-h-screen bg-canvas">
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={14} className="text-accent" />
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Production guide</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Plan your <span className="text-gradient">content</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Script outline, shot list, and filming tips — before you hit record.
          </p>
        </motion.div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 mb-6">
          {([
            { id: 'setup',  label: 'Setup',       icon: Sparkles },
            { id: 'script', label: 'Script',       icon: FileText },
            { id: 'shots',  label: 'Shot list',    icon: Film },
          ] as const).map(t => {
            const Icon = t.icon
            const isLocked = (t.id === 'script' && !scriptSections.length) ||
                             (t.id === 'shots' && !shotList)
            return (
              <button
                key={t.id}
                onClick={() => !isLocked && setActiveTab(t.id)}
                disabled={isLocked}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all',
                  activeTab === t.id
                    ? 'bg-accent/20 text-accent'
                    : isLocked
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-500 hover:text-slate-300'
                )}
              >
                <Icon size={12} />
                {t.label}
              </button>
            )
          })}
        </div>

        {error && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Setup tab */}
        {activeTab === 'setup' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6"
          >
            <div className="space-y-4">
              <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block font-medium">Video title</label>
                  <input
                    type="text"
                    placeholder="e.g. How I saved ₹50,000 on a ₹30k salary"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block font-medium">Description <span className="text-slate-600">(optional)</span></label>
                  <textarea
                    rows={2}
                    placeholder="What's this video about? More context = better script"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="input w-full resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block font-medium">Opening hook <span className="text-slate-600">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g. I made ₹0 for 8 months. Here's what changed..."
                    value={hook}
                    onChange={e => setHook(e.target.value)}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-2 block font-medium">Duration</label>
                  <div className="flex gap-2">
                    {[1, 3, 5, 10].map(d => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={cn(
                          'flex-1 py-2 rounded-lg border text-xs font-medium transition-all',
                          duration === d
                            ? 'bg-accent/20 border-accent/40 text-accent'
                            : 'border-border text-slate-500 hover:border-border-2'
                        )}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateScript}
                disabled={!title.trim() || loadingScript}
                className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-40"
              >
                {loadingScript ? (
                  <><Loader2 size={15} className="animate-spin" />Generating script...</>
                ) : (
                  <><Sparkles size={15} />Generate script outline</>
                )}
              </button>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              <div className="bg-surface border border-border rounded-2xl p-4">
                <p className="section-label mb-3">Niche</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {NICHES.map(n => (
                    <button
                      key={n.value}
                      onClick={() => setNiche(n.value)}
                      className={cn(
                        'flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium border transition-all',
                        niche === n.value
                          ? 'bg-accent/15 border-accent/40 text-white'
                          : 'border-border text-slate-500 hover:border-border-2'
                      )}
                    >
                      <span>{n.emoji}</span>{n.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-4">
                <p className="section-label mb-3">Platform + format</p>
                <div className="space-y-1.5">
                  {PLATFORMS.slice(0, 3).map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPlatform(p.value)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all',
                        platform === p.value
                          ? 'bg-accent/15 border-accent/40 text-white'
                          : 'border-border text-slate-500 hover:border-border-2'
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Script tab */}
        {activeTab === 'script' && scriptSections.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-slate-500 bg-surface border border-border rounded-xl px-4 py-3">
              <span>~{totalWords} words</span>
              <span>~{duration} min read</span>
              <span className="capitalize">{platform} · {format}</span>
              <button
                onClick={() => setActiveTab('setup')}
                className="ml-auto flex items-center gap-1 hover:text-white transition-colors"
              >
                <RefreshCw size={11} />Regenerate
              </button>
            </div>

            {/* Script sections */}
            <div className="space-y-2.5">
              {scriptSections.map((section, i) => (
                <ScriptSectionCard key={i} section={section} index={i} />
              ))}
            </div>

            {/* Generate shot list CTA */}
            <button
              onClick={handleGenerateShotList}
              disabled={loadingShotList}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-40"
            >
              {loadingShotList ? (
                <><Loader2 size={15} className="animate-spin" />Generating shot list...</>
              ) : (
                <><Film size={15} />Generate shot list from this script<ArrowRight size={14} /></>
              )}
            </button>
          </motion.div>
        )}

        {/* Shot list tab */}
        {activeTab === 'shots' && shotList && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Shot list */}
            <div>
              <p className="section-label mb-3">
                {shotList.shots?.length} shots · ~{Math.round(shotList.total_duration_seconds / 60)} min total
              </p>
              <div className="space-y-2.5">
                {shotList.shots?.map((shot: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-surface border border-border rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-bold text-slate-600 bg-white/5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                          {shot.order}
                        </span>
                        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-md', SHOT_TYPE_COLORS[shot.shot_type] ?? 'bg-slate-500/15 text-slate-300')}>
                          {SHOT_TYPE_LABELS[shot.shot_type] ?? shot.shot_type}
                        </span>
                        <span className="text-xs text-slate-600">{shot.duration_seconds}s</span>
                      </div>
                    </div>
                    <p className="text-sm text-white leading-relaxed mb-2">{shot.description}</p>
                    {shot.tips && (
                      <div className="flex items-start gap-1.5">
                        <Lightbulb size={11} className="text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-300/80">{shot.tips}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* B-roll suggestions */}
            {shotList.broll_suggestions?.length > 0 && (
              <div>
                <p className="section-label mb-3">Free B-roll to download</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {shotList.broll_suggestions.map((b: any, i: number) => (
                    <a
                      key={i}
                      href={b.pexels_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 bg-surface border border-border rounded-xl hover:border-border-2 hover:bg-white/[0.03] transition-all group"
                    >
                      <div>
                        <p className="text-xs font-medium text-white capitalize">{b.keyword}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Pexels free stock</p>
                      </div>
                      <ExternalLink size={12} className="text-slate-600 group-hover:text-accent transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Go to editor CTA */}
            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white mb-0.5">Ready to film?</p>
                <p className="text-xs text-slate-400">Upload your footage to the Editor when done.</p>
              </div>
              <a href="/dashboard/editor" className="btn-primary text-xs flex items-center gap-1.5 flex-shrink-0">
                Go to Editor <ArrowRight size={12} />
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

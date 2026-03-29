'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Copy, CheckCheck, ChevronDown, ChevronUp, Hash } from 'lucide-react'
import { generateCaptions } from '@/lib/api'
import { cn } from '@/lib/utils'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube',   label: 'YouTube' },
  { id: 'twitter',   label: 'Twitter / X' },
  { id: 'linkedin',  label: 'LinkedIn' },
  { id: 'tiktok',    label: 'TikTok' },
]

const STYLE_LABELS: Record<string, string> = {
  curiosity_gap: 'Curiosity gap',
  storytelling:  'Storytelling',
  listicle:      'Listicle',
}

interface CaptionGeneratorProps {
  title: string
  description: string
  niche: string
  hook?: string
  onApply?: (caption: string) => void
}

export function CaptionGenerator({ title, description, niche, hook, onApply }: CaptionGeneratorProps) {
  const [platform, setPlatform]   = useState('instagram')
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState<any>(null)
  const [selected, setSelected]   = useState(0)
  const [copied, setCopied]       = useState<string | null>(null)
  const [showHashtags, setShowHashtags] = useState(false)
  const [editedCaption, setEditedCaption] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setResult(null)
    try {
      const data = await generateCaptions({ title, description, platform, niche, hook })
      setResult(data)
      setSelected(0)
      
      const hashtagsStr = [
        ...(data.hashtags?.big   ?? []),
        ...(data.hashtags?.niche ?? []),
        ...(data.hashtags?.micro ?? []),
      ].map((h: string) => `#${h.replace(/^#/, '')}`).join(' ')
      
      setEditedCaption(`${data.variants[0]?.caption ?? ''}\n\n${hashtagsStr}`.trim())
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard(text: string, key: string) {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  function selectVariant(i: number) {
    setSelected(i)
    const hashtagsStr = [
      ...(result.hashtags?.big   ?? []),
      ...(result.hashtags?.niche ?? []),
      ...(result.hashtags?.micro ?? []),
    ].map((h: string) => `#${h.replace(/^#/, '')}`).join(' ')
    setEditedCaption(`${result.variants[i]?.caption ?? ''}\n\n${hashtagsStr}`.trim())
  }

  const allHashtags = result
    ? [
        ...(result.hashtags.big   ?? []),
        ...(result.hashtags.niche ?? []),
        ...(result.hashtags.micro ?? []),
      ].map(h => `#${h.replace(/^#/, '')}`).join(' ')
    : ''

  return (
    <div className="space-y-4">
      {/* Platform selector */}
      <div>
        <p className="section-label mb-2">Platform</p>
        <div className="flex gap-1.5 flex-wrap">
          {PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={cn(
                'pill text-xs transition-all',
                platform === p.id
                  ? 'bg-accent/20 border-accent/40 text-accent'
                  : 'border-border text-slate-500 hover:border-border-2 hover:text-slate-300'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating captions...
          </>
        ) : (
          <>
            <Sparkles size={14} />
            Generate captions + hashtags
          </>
        )}
      </button>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Style selector */}
            <div>
              <p className="section-label mb-2">Caption style</p>
              <div className="flex gap-1.5">
                {result.variants.map((v: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => selectVariant(i)}
                    className={cn(
                      'pill text-xs transition-all',
                      selected === i
                        ? 'bg-accent/20 border-accent/40 text-accent'
                        : 'border-border text-slate-500 hover:border-border-2'
                    )}
                  >
                    {STYLE_LABELS[v.style] ?? v.style}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption editor */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">
                  {editedCaption.length} chars
                </p>
                <button
                  onClick={() => copyToClipboard(editedCaption, 'caption')}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-accent transition-colors"
                >
                  {copied === 'caption' ? (
                    <><CheckCheck size={12} className="text-emerald-400" /> Copied</>
                  ) : (
                    <><Copy size={12} /> Copy</>
                  )}
                </button>
              </div>
              <textarea
                value={editedCaption}
                onChange={e => setEditedCaption(e.target.value)}
                rows={6}
                className="input w-full resize-none text-sm leading-relaxed"
              />
              {onApply && (
                <button
                  onClick={() => onApply(editedCaption)}
                  className="w-full mt-3 btn-primary py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <CheckCheck size={16} />
                  Apply to Post
                </button>
              )}
            </div>

            {/* Posting time */}
            {result.best_posting_time && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="text-emerald-400">Best time:</span>
                {result.best_posting_time}
              </p>
            )}

            {/* Hashtags */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setShowHashtags(!showHashtags)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-accent" />
                  <span className="text-sm font-medium text-white">Hashtags</span>
                  <span className="text-xs text-slate-500">
                    {(result.hashtags.big?.length ?? 0) +
                     (result.hashtags.niche?.length ?? 0) +
                     (result.hashtags.micro?.length ?? 0)} tags
                  </span>
                </div>
                {showHashtags
                  ? <ChevronUp size={14} className="text-slate-500" />
                  : <ChevronDown size={14} className="text-slate-500" />
                }
              </button>

              <AnimatePresence>
                {showHashtags && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="p-4 space-y-3">
                      {[
                        { label: 'High volume (1M+)', tags: result.hashtags.big, color: 'text-purple-400' },
                        { label: 'Niche (100K–1M)', tags: result.hashtags.niche, color: 'text-teal-400' },
                        { label: 'Micro (<100K)', tags: result.hashtags.micro, color: 'text-amber-400' },
                      ].map(group => (
                        <div key={group.label}>
                          <p className={cn('text-[10px] font-semibold mb-1.5 uppercase tracking-wider', group.color)}>
                            {group.label}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {group.tags?.map((tag: string) => (
                              <span
                                key={tag}
                                className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-border"
                              >
                                #{tag.replace(/^#/, '')}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => copyToClipboard(allHashtags, 'hashtags')}
                        className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-accent transition-colors pt-2 border-t border-border mt-2"
                      >
                        {copied === 'hashtags' ? (
                          <><CheckCheck size={12} className="text-emerald-400" /> Copied all hashtags</>
                        ) : (
                          <><Copy size={12} /> Copy all hashtags</>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

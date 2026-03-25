'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, ExternalLink, Sparkles, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const TOOLS = [
  {
    id:       'runway',
    name:     'Runway',
    tag:      'Video generation',
    desc:     'Generate cinematic B-roll, remove backgrounds, or create AI video from text. Best for intros and transitions.',
    url:      'https://runwayml.com',
    pricing:  'Free tier · $15/mo',
    color:    '#7c6af5',
    hot:      true,
    useCase:  'Generate B-roll for your video',
    deepLink: (title: string) => `https://runwayml.com/ai-tools/gen-3-alpha?prompt=${encodeURIComponent(`cinematic b-roll for: ${title}`)}`,
  },
  {
    id:       'elevenlabs',
    name:     'ElevenLabs',
    tag:      'AI voiceover',
    desc:     'Clone your voice or pick from 1000+ voices. Add professional narration without re-recording.',
    url:      'https://elevenlabs.io',
    pricing:  '10K chars free · $5/mo',
    color:    '#06b6d4',
    hot:      true,
    useCase:  'Add voiceover to your script',
    deepLink: (title: string) => `https://elevenlabs.io/text-to-speech?text=${encodeURIComponent(title)}`,
  },
  {
    id:       'suno',
    name:     'Suno',
    tag:      'AI music',
    desc:     'Generate royalty-free background music that matches your content mood. Upbeat, cinematic, lo-fi — any style.',
    url:      'https://suno.com',
    pricing:  '50 songs/day free',
    color:    '#ec4899',
    hot:      true,
    useCase:  'Generate background music',
    deepLink: (title: string) => `https://suno.com/create?prompt=${encodeURIComponent(`background music for: ${title}`)}`,
  },
  {
    id:       'fliki',
    name:     'Fliki',
    tag:      'Text to video',
    desc:     'Turn your script into a video with AI visuals and voiceover. Great for faceless content creation.',
    url:      'https://fliki.ai',
    pricing:  '5 min free · $21/mo',
    color:    '#f97316',
    hot:      false,
    useCase:  'Turn script into video',
    deepLink: (title: string) => `https://app.fliki.ai/files?script=${encodeURIComponent(title)}`,
  },
  {
    id:       'opusclip',
    name:     'OpusClip',
    tag:      'AI clip extraction',
    desc:     'Automatically extract the most viral moments from long videos. Adds captions and hooks automatically.',
    url:      'https://www.opus.pro',
    pricing:  '60 min free · $15/mo',
    color:    '#10b981',
    hot:      false,
    useCase:  'Extract viral clips',
    deepLink: (_: string) => `https://www.opus.pro`,
  },
  {
    id:       'descript',
    name:     'Descript',
    tag:      'Transcript editing',
    desc:     'Edit video by editing text. Delete words from the transcript to remove them from the video.',
    url:      'https://www.descript.com',
    pricing:  '1 hr free · $24/mo',
    color:    '#a855f7',
    hot:      false,
    useCase:  'Edit video like a doc',
    deepLink: (_: string) => `https://www.descript.com`,
  },
  {
    id:       'capcut',
    name:     'CapCut',
    tag:      'Mobile editing',
    desc:     'Add trending transitions, effects, and templates. Best for adding TikTok/Reels style edits quickly.',
    url:      'https://www.capcut.com',
    pricing:  'Free · Pro $10/mo',
    color:    '#64748b',
    hot:      false,
    useCase:  'Add trending effects',
    deepLink: (_: string) => `https://www.capcut.com`,
  },
  {
    id:       'kling',
    name:     'Kling AI',
    tag:      'Video generation',
    desc:     'Chinese AI video generator rivaling Runway. Great for generating realistic video clips from text prompts.',
    url:      'https://klingai.com',
    pricing:  '66 credits free daily',
    color:    '#3b82f6',
    hot:      false,
    useCase:  'Generate video clips',
    deepLink: (title: string) => `https://klingai.com/text-to-video?prompt=${encodeURIComponent(title)}`,
  },
]

const CATEGORY_FILTERS = ['All', 'Video gen', 'Audio', 'Editing', 'Free']

interface AIToolsPanelProps {
  projectTitle?: string  // passed from editor to pre-fill deep links
}

export function AIToolsPanel({ projectTitle = '' }: AIToolsPanelProps) {
  const [open, setOpen]           = useState(false)
  const [filter, setFilter]       = useState('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = TOOLS.filter(t => {
    if (filter === 'All')     return true
    if (filter === 'Video gen') return t.tag.includes('Video') || t.tag.includes('text to')
    if (filter === 'Audio')   return t.tag.includes('voice') || t.tag.includes('music')
    if (filter === 'Editing') return t.tag.includes('edit') || t.tag.includes('clip')
    if (filter === 'Free')    return t.pricing.toLowerCase().includes('free')
    return true
  })

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
            <Sparkles size={13} className="text-accent" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">AI Tools</p>
            <p className="text-[10px] text-slate-500">Runway · ElevenLabs · Suno + {TOOLS.length - 3} more</p>
          </div>
        </div>
        {open
          ? <ChevronUp size={14} className="text-slate-500" />
          : <ChevronDown size={14} className="text-slate-500" />
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
            <div className="p-3 space-y-3">
              {/* Filter pills */}
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORY_FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      'text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all',
                      filter === f
                        ? 'bg-accent/20 border-accent/40 text-accent'
                        : 'border-border text-slate-500 hover:border-border-2 hover:text-slate-300'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Tools list */}
              <div className="space-y-2">
                {filtered.map((tool, i) => {
                  const isExpanded = expandedId === tool.id
                  return (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        'rounded-xl border transition-all overflow-hidden',
                        isExpanded ? 'border-white/15 bg-white/[0.04]' : 'border-border hover:border-border-2'
                      )}
                    >
                      {/* Tool row */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : tool.id)}
                        className="w-full flex items-center gap-2.5 p-3 text-left"
                      >
                        {/* Color dot */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white"
                          style={{ background: tool.color + '30', border: `1px solid ${tool.color}40` }}
                        >
                          <span style={{ color: tool.color }}>{tool.name.slice(0, 2)}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-white">{tool.name}</p>
                            {tool.hot && (
                              <span className="text-[8px] font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full border border-orange-500/30">
                                HOT
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500">{tool.tag} · {tool.pricing}</p>
                        </div>

                        <ChevronDown
                          size={12}
                          className={cn('text-slate-600 transition-transform flex-shrink-0', isExpanded && 'rotate-180')}
                        />
                      </button>

                      {/* Expanded detail */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden border-t border-white/5"
                          >
                            <div className="px-3 pb-3 pt-2.5 space-y-2.5">
                              <p className="text-xs text-slate-400 leading-relaxed">{tool.desc}</p>

                              <div className="flex gap-2">
                                {/* Deep link — pre-fills with project title */}
                                {projectTitle && (
                                  <a
                                    href={tool.deepLink(projectTitle)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
                                    style={{ background: tool.color + '15' }}
                                  >
                                    <Zap size={11} style={{ color: tool.color }} />
                                    Use for this video
                                    <ExternalLink size={10} className="text-slate-600" />
                                  </a>
                                )}

                                {/* Generic open */}
                                <a
                                  href={tool.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    'flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium text-slate-400 border border-border hover:border-border-2 hover:text-white transition-all',
                                    projectTitle ? 'px-3' : 'flex-1'
                                  )}
                                >
                                  <ExternalLink size={11} />
                                  {projectTitle ? 'Open' : 'Open ' + tool.name}
                                </a>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>

              <p className="text-[10px] text-slate-600 text-center pt-1">
                Opening these tools in a new tab. They are third-party services.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

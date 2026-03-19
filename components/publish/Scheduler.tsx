'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const BEST_TIMES = [
  { label: 'Morning',   time: '07:00', desc: '7am IST — early commute' },
  { label: 'Lunch',     time: '12:30', desc: '12:30pm IST — lunch scroll' },
  { label: 'Evening',   time: '19:00', desc: '7pm IST — peak engagement' },
  { label: 'Night',     time: '21:00', desc: '9pm IST — before bed' },
]

interface SchedulerProps {
  projectId: string
  outputId: string
  platform: string
  caption: string
  hashtags: string
}

export function Scheduler({ projectId, outputId, platform, caption, hashtags }: SchedulerProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('19:00')
  const [scheduling, setScheduling]     = useState(false)
  const [scheduled, setScheduled]       = useState(false)
  const [error, setError]               = useState('')

  // Get tomorrow as default min date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  async function handleSchedule() {
    if (!selectedDate) { setError('Please pick a date'); return }
    setScheduling(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const scheduledFor = new Date(`${selectedDate}T${selectedTime}:00+05:30`).toISOString()
      const fullCaption = hashtags ? `${caption}\n\n${hashtags}` : caption

      await supabase.from('scheduled_posts').insert({
        user_id:      user.id,
        project_id:   projectId,
        output_id:    outputId,
        platform,
        caption:      fullCaption,
        scheduled_for: scheduledFor,
        status:       'scheduled',
      })

      setScheduled(true)
    } catch (e: any) {
      setError(e.message ?? 'Failed to schedule')
    } finally {
      setScheduling(false)
    }
  }

  if (scheduled) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-6"
      >
        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle size={20} className="text-emerald-400" />
        </div>
        <p className="text-white font-semibold mb-1">Scheduled!</p>
        <p className="text-xs text-slate-500">
          {selectedDate} at {selectedTime} IST
        </p>
        <p className="text-xs text-slate-600 mt-2">
          Auto-posting requires platform connection
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Best times */}
      <div>
        <p className="section-label mb-2">Best times to post</p>
        <div className="grid grid-cols-2 gap-2">
          {BEST_TIMES.map(t => (
            <button
              key={t.time}
              onClick={() => setSelectedTime(t.time)}
              className={cn(
                'p-3 rounded-xl border text-left transition-all',
                selectedTime === t.time
                  ? 'bg-accent/15 border-accent/40'
                  : 'border-border hover:border-border-2 hover:bg-white/[0.03]'
              )}
            >
              <p className={cn('text-xs font-semibold', selectedTime === t.time ? 'text-accent' : 'text-white')}>
                {t.label}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom time */}
      <div>
        <p className="section-label mb-2">Custom time</p>
        <input
          type="time"
          value={selectedTime}
          onChange={e => setSelectedTime(e.target.value)}
          className="input w-full"
        />
      </div>

      {/* Date picker */}
      <div>
        <p className="section-label mb-2">Date</p>
        <input
          type="date"
          value={selectedDate}
          min={minDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="input w-full"
        />
      </div>

      {error && (
        <p className="text-xs text-rose-400">{error}</p>
      )}

      <button
        onClick={handleSchedule}
        disabled={scheduling || !selectedDate}
        className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
      >
        {scheduling ? (
          <><Loader2 size={14} className="animate-spin" /> Scheduling...</>
        ) : (
          <><Calendar size={14} /> Schedule post</>
        )}
      </button>

      <p className="text-[10px] text-slate-600 text-center">
        Connect your {platform} account to enable auto-posting
      </p>
    </div>
  )
}

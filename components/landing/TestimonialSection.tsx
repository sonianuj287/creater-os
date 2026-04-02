'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const TESTIMONIALS = [
  { name: '@anubhav_creater', role: 'Vlogger, 2M+ subs', content: "Createros literally saved my sanity. I used to spend 6 hours on one video, now it's done in 40 minutes." },
  { name: '@priya_reels', role: 'Fashion Influencer', content: "The AI ideas are actually viral-ready. I've gained 50k followers in 2 weeks using the growth challenge." },
  { name: '@tech_with_ajit', role: 'Tech Reviewer', content: "The auto-captions and silence cutting are game changers for long-form content. 10/10." },
  { name: '@sneha_cooks', role: 'Food Content Creator', content: "I love how it schedules everything for me. I just film and relax." },
  { name: '@fitness_guru', role: 'Health Coach', content: "The most intuitive creator tool I've ever used. Highly recommended!" },
  { name: '@gamer_boy', role: 'Gaming Streamer', content: "Helped me turn my long streams into shorts in minutes. Huge time saver." },
]

export function TestimonialSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-6">The Wall of Love.</h2>
        <p className="text-white/40 max-w-xl mx-auto">See why thousands of creators are switching to CreaterOS.</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex gap-6 animate-scroll-left hover:pause-scroll">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
             <div key={i} className="min-w-[300px] md:min-w-[400px] p-8 rounded-3xl bg-[#0d0d15] border border-white/5 shadow-xl">
                <div className="flex items-center gap-1 mb-4 text-emerald-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-lg font-medium text-white/80 mb-6 leading-relaxed">"{t.content}"</p>
                <div className="flex flex-col">
                  <span className="font-bold text-white">{t.name}</span>
                  <span className="text-xs text-white/30 uppercase tracking-widest">{t.role}</span>
                </div>
             </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-left {
          display: flex;
          width: fit-content;
          animation: scroll-left 40s linear infinite;
        }
        .hover\:pause-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}

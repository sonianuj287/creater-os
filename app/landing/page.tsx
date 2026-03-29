'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

// ── Data ──────────────────────────────────────────────────────

const STEPS = [
  { num: '01', title: 'Discover', sub: 'Trending ideas daily', desc: 'AI scans YouTube and Instagram every morning. You wake up to 20 viral-ready ideas in your niche.', color: '#7c6af5', bg: 'rgba(124,106,245,0.08)' },
  { num: '02', title: 'Plan',     sub: 'Script + shot list',   desc: 'One click generates a full script, shot list, and free B-roll links. Know exactly what to say.', color: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
  { num: '03', title: 'Film',     sub: 'Scene by scene',       desc: 'Upload each scene separately. The AI assembles them, cuts silences, burns captions, and exports.', color: '#06b6d4', bg: 'rgba(6,182,212,0.08)' },
  { num: '04', title: 'Publish',  sub: 'Post everywhere',      desc: 'AI captions, hashtags, scheduled at peak times. One click posts to Instagram and YouTube.', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
]

// ── Logo Component (NavBar) ───────────────────────────────────
function CreaterosLogoNav() {
  return (
    <div className="flex items-center gap-2.5">
      <div style={{
        width: 24, height: 24, borderRadius: 8,
        background: 'linear-gradient(135deg, #7c6af5 0%, #ec4899 50%, #06b6d4 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 900, color: '#fff',
        boxShadow: '0 4px 20px rgba(124,106,245,0.4)',
      }}>⚡</div>
      <span style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.03em',
        background: 'linear-gradient(135deg, #fff 0%, #a89ef8 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>Createros</span>
    </div>
  )
}

// ── Animated Hero Title (Relax -> Createros) ──────────────────
function AnimatedHeroLogo() {
  const [phase, setPhase] = useState(0)
  
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1600) // 'elax' flies out
    const t2 = setTimeout(() => setPhase(2), 2400) // 'create' and 'os' fly in, 'r' lowers
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="relative flex items-center justify-center font-black text-[clamp(3.5rem,8vw,7rem)] tracking-tight leading-none h-[180px] mt-4 mb-4 overflow-hidden pt-6">
       
       {/* 'create' */}
       <motion.span
         initial={{ opacity: 0, x: -120, filter: 'blur(20px)' }}
         animate={{ 
           opacity: phase >= 2 ? 1 : 0, 
           x: phase >= 2 ? 0 : -80, 
           filter: phase >= 2 ? 'blur(0px)' : 'blur(20px)' 
         }}
         transition={{ type: 'spring', damping: 15, stiffness: 100, mass: 1 }}
         className="absolute right-[50%] mr-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-[#ff4d4d] to-[#f97316] pb-2"
       >
         create
       </motion.span>
       
       {/* 'r' / 'relax' pivot */}
       <div className="absolute left-[50%] -translate-x-1/2 flex items-baseline pb-2">
         <motion.span
           initial={{ y: -50, scale: 1.2 }}
           animate={{
             y: phase >= 2 ? 0 : phase === 1 ? -20 : -50,
             scale: phase >= 2 ? 1 : 1.2,
             color: phase >= 2 ? 'transparent' : '#fff',
             backgroundImage: phase >= 2 ? 'linear-gradient(135deg, #f97316, #7c6af5)' : 'none',
             WebkitBackgroundClip: phase >= 2 ? 'text' : undefined,
           }}
           transition={{ type: 'spring', bounce: 0.35, duration: 1 }}
           className="relative z-10 uppercase"
           style={{ textTransform: phase >= 1 ? 'lowercase' : 'capitalize' } as any}
         >
           r
         </motion.span>
         <AnimatePresence>
           {phase === 0 && (
             <motion.span
               initial={{ opacity: 1 }}
               exit={{ opacity: 0, scale: 0.5, x: 40, y: -20, filter: 'blur(10px)' }}
               transition={{ duration: 0.6, ease: "easeIn" }}
               className="text-white relative -top-[50px] scale-[1.2] origin-left"
             >
               elax
             </motion.span>
           )}
         </AnimatePresence>
       </div>

       {/* 'os' */}
       <motion.span
         initial={{ opacity: 0, x: 120, filter: 'blur(20px)' }}
         animate={{ 
           opacity: phase >= 2 ? 1 : 0, 
           x: phase >= 2 ? 0 : 80, 
           filter: phase >= 2 ? 'blur(0px)' : 'blur(20px)' 
         }}
         transition={{ type: 'spring', damping: 15, stiffness: 100, mass: 1 }}
         className="absolute left-[50%] ml-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-[#7c6af5] to-[#06b6d4] pb-2"
       >
         os
       </motion.span>
       
    </div>
  )
}

// ── Animated grid background ──────────────────────────────────
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(124,106,245,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,106,245,0.06) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 60% at 50% 0%, transparent 40%, #08080f 100%)' }} />
      {[ { x: '20%', y: '20%', c: '#7c6af5' }, { x: '80%', y: '10%', c: '#ec4899' }, { x: '50%', y: '50%', c: '#06b6d4' } ].map((orb, i) => (
        <motion.div key={i}
          style={{ position: 'absolute', left: orb.x, top: orb.y, width: 600, height: 600, background: `radial-gradient(circle, ${orb.c}15 0%, transparent 70%)`, filter: 'blur(50px)', transform: 'translate(-50%,-50%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}


// ── 3D Interactive Scroll Showcase (ManyChat Inspired) ────────
function ScrollShowcase() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] })
  
  // Transform scale and opacity for 3D physics depth effect
  const mainScale = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.95, 1, 1, 0.9])
  const perspectiveY = useTransform(scrollYProgress, [0, 1], [20, -10])
  
  // Big floating text scale and fade
  const textScale = useTransform(scrollYProgress, [0.05, 0.25], [1, 7])
  const textOpacity = useTransform(scrollYProgress, [0.05, 0.22], [1, 0])

  // Sequential UI Card Entrances
  const card1Y = useTransform(scrollYProgress, [0.15, 0.3], [800, 0])
  const card1Rot = useTransform(scrollYProgress, [0.15, 0.4], [15, 0])
  
  const card2Y = useTransform(scrollYProgress, [0.4, 0.6], [800, 0])
  const card2Rot = useTransform(scrollYProgress, [0.4, 0.6], [15, 0])
  
  const card3Y = useTransform(scrollYProgress, [0.65, 0.85], [1000, 0])
  
  // Content crossfades
  const bgOpacity1 = useTransform(scrollYProgress, [0, 0.35], [1, 0.1])
  const bgOpacity2 = useTransform(scrollYProgress, [0.35, 0.45, 0.6, 0.7], [0, 1, 1, 0.2])
  const bgOpacity3 = useTransform(scrollYProgress, [0.65, 0.75], [0, 1])

  return (
    <div ref={containerRef} className="h-[400vh] relative w-full border-t border-white/5 bg-[#050508]">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden perspective-[1200px]">
        
        {/* Massive scrolling text */}
        <motion.div style={{ scale: textScale, opacity: textOpacity }} className="absolute z-10 pointer-events-none flex flex-col items-center justify-center">
          <h2 className="text-[120px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 text-center mix-blend-overlay">
            SCALE<br/>10X
          </h2>
        </motion.div>

        {/* Dynamic Background Halos corresponding to current card */}
        <motion.div style={{ opacity: bgOpacity1 }} className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_rgba(124,106,245,0.15)_0%,_transparent_50%)]" />
        <motion.div style={{ opacity: bgOpacity2 }} className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(6,182,212,0.15)_0%,_transparent_60%)]" />
        <motion.div style={{ opacity: bgOpacity3 }} className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(236,72,153,0.15)_0%,_transparent_60%)]" />

        {/* 3D Moving Container */}
        <motion.div style={{ scale: mainScale, rotateX: perspectiveY }} className="relative w-[90%] max-w-6xl aspect-video mx-auto transform-style-3d">
            
            {/* Card 1: Dashboard UI */}
            <motion.div style={{ y: card1Y, rotateX: card1Rot, zIndex: 10 }} className="absolute right-0 top-0 w-3/5 rounded-3xl overflow-hidden glass-panel">
               <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center backdrop-blur-md">
                 <span className="text-[10px] font-bold tracking-widest text-[#7c6af5] uppercase">Analytics</span>
                 <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"/><div className="w-2.5 h-2.5 rounded-full bg-amber-500"/><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"/></div>
               </div>
               <img src="/assets/hero_dashboard_3d_1774778004295.png" alt="Analytics View" className="w-full object-cover scale-[1.02] transform origin-top" />
               
               {/* Floating Tag */}
               <motion.div style={{ translateY: useTransform(scrollYProgress, [0.2, 0.4], [50, -20]) }} className="absolute -left-12 top-20 bg-black/80 backdrop-blur-xl border border-[#7c6af5]/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
                 <span className="text-xl">📈</span> <span className="text-sm font-bold">Track Viral Scores</span>
               </motion.div>
            </motion.div>

            {/* Card 2: Timeline Editor UI */}
            <motion.div style={{ y: card2Y, rotateX: card2Rot, zIndex: 20 }} className="absolute left-[5%] top-[15%] w-[65%] rounded-3xl overflow-hidden glass-panel shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
               <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center backdrop-blur-md">
                 <span className="text-[10px] font-bold tracking-widest text-[#06b6d4] uppercase">Timeline Engine</span>
               </div>
               <img src="/assets/timeline_editor_3d_1774778024239.png" alt="Timeline Editor" className="w-full object-cover scale-[1.01]" />
               
               {/* Floating Tag */}
               <motion.div style={{ translateY: useTransform(scrollYProgress, [0.4, 0.6], [50, -20]) }} className="absolute -right-6 top-32 bg-black/80 backdrop-blur-xl border border-[#06b6d4]/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
                 <span className="text-xl">✂️</span> <span className="text-sm font-bold">AI Auto Assembly</span>
               </motion.div>
            </motion.div>

            {/* Card 3: Publishing Calendar UI */}
            <motion.div style={{ y: card3Y, zIndex: 30 }} className="absolute right-[8%] bottom-[-5%] w-[45%] rounded-3xl overflow-hidden glass-panel shadow-[0_50px_100px_rgba(0,0,0,0.9)] border border-white/10">
               <div className="p-4 bg-black/40 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
                 <span className="text-[10px] font-bold tracking-widest text-[#ec4899] uppercase">Publishing Queue</span>
               </div>
               <img src="/assets/publishing_calendar_mockup_1774778045010.png" alt="Publish UI" className="w-full object-cover" />
               
               {/* Floating Tag */}
               <motion.div style={{ translateY: useTransform(scrollYProgress, [0.65, 0.85], [50, -20]) }} className="absolute -left-16 bottom-20 bg-black/80 backdrop-blur-xl border border-[#ec4899]/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
                 <span className="text-xl">🚀</span> <span className="text-sm font-bold">Post Everywhere</span>
               </motion.div>
            </motion.div>

        </motion.div>
      </div>
    </div>
  )
}

// ── Main landing page ─────────────────────────────────────────
export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      if (data.session) setIsLoggedIn(true)
    })
  }, [])

  const ctaHref  = isLoggedIn ? '/dashboard' : '/auth/login'
  const ctaLabel = isLoggedIn ? 'Go to dashboard →' : 'Get started free'

  return (
    <div style={{ minHeight: '100vh', background: '#08080f', color: '#fff', overflowX: 'hidden', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-[#08080f]/80 backdrop-blur-xl border-b border-white/5">
        <CreaterosLogoNav />
        <div className="flex items-center gap-4 md:gap-8">
          <Link href={ctaHref} className="text-sm font-bold px-5 py-2.5 rounded-xl text-white bg-gradient-to-br from-[#7c6af5] to-[#ec4899] shadow-[0_0_20px_rgba(124,106,245,0.3)] hover:scale-105 transition-transform">
            {isLoggedIn ? 'Dashboard' : 'Get started'}
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden">
        <GridBackground />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 mt-12">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7c6af5]/10 border border-[#7c6af5]/30 text-xs font-semibold text-[#a89ef8] mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#7c6af5] animate-pulse" />
            Built for creators · Post in 3 minutes
          </motion.div>

          <AnimatedHeroLogo />

          <motion.h4
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Createros finds what's trending, edits your video automatically, and seamlessly publishes to Instagram and YouTube. Just upload and watch it grow.
          </motion.h4>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href={ctaHref} className="group flex items-center gap-2.5 px-8 py-4 bg-gradient-to-br from-[#7c6af5] to-[#ec4899] text-white font-extrabold text-lg rounded-2xl shadow-[0_0_40px_rgba(124,106,245,0.3),_0_8px_32px_rgba(0,0,0,0.3)] hover:scale-[1.03] transition-all">
              {ctaLabel} <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <p className="text-sm text-white/40 font-medium sm:ml-4">Scroll to explore software ↓</p>
          </motion.div>
        </div>
      </section>

      {/* ── 3D Scroll Immersive Sequence ── */}
      <ScrollShowcase />

      {/* ── Stats bar ── */}
      <section className="border-t border-b border-white/5 py-12 px-6 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { v: '10×',   l: 'More content generated' },
            { v: '3 min', l: 'To process a full video' },
            { v: '5+',    l: 'Platforms connected' },
            { v: '0',     l: 'Editing skills needed' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <p className="text-4xl md:text-5xl font-black mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-[#ff4d4d] via-[#7c6af5] to-[#06b6d4]">
                {s.v}
              </p>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">{s.l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works Grid ── */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7c6af5] mb-4">How it works</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">Fully automated workflow.</h2>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
             <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
               className="relative overflow-hidden p-6 rounded-3xl border border-white/10 glass-panel" style={{ background: step.bg }}>
               <div className="absolute right-4 top-4 text-6xl font-black opacity-[0.05]" style={{ color: step.color }}>{step.num}</div>
               <h3 className="text-sm font-black mb-4 uppercase tracking-widest" style={{ color: step.color }}>{step.sub}</h3>
               <p className="text-2xl font-bold text-white mb-3">{step.title}</p>
               <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
             </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 bg-[#08080f]">
        <CreaterosLogoNav />
        <p className="text-xs font-medium text-white/30 text-center md:text-left">Built for creators. Post more. Stress less.</p>
        <div className="flex gap-6 items-center">
          <Link href={ctaHref} className="text-xs font-bold text-white/40 hover:text-white transition-colors">{isLoggedIn ? 'Dashboard' : 'Get started'}</Link>
        </div>
      </footer>

      <style>{`
        .glass-panel { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); }
        .transform-style-3d { transform-style: preserve-3d; }
      `}</style>
    </div>
  )
}

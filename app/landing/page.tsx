'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Instagram, Youtube, TrendingUp, Trophy, Sparkles, Twitter, Github, Linkedin } from 'lucide-react'
import { LottiePlayer } from '@/components/ui/LottiePlayer'
import { PricingSection } from '@/components/landing/PricingSection'
import { TestimonialSection } from '@/components/landing/TestimonialSection'
import { FAQSection } from '@/components/landing/FAQSection'

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
    const t1 = setTimeout(() => setPhase(1), 1600)
    const t2 = setTimeout(() => setPhase(2), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="relative flex items-center justify-center font-black text-[clamp(3rem,10vw,7rem)] tracking-tight leading-none h-[140px] md:h-[180px] mt-4 mb-4 pt-6">
       <motion.span
         initial={{ opacity: 0, x: -120, filter: 'blur(20px)' }}
         animate={{ 
           opacity: phase >= 2 ? 1 : 0, 
           x: phase >= 2 ? 0 : -80, 
           filter: phase >= 2 ? 'blur(0px)' : 'blur(20px)' 
         }}
         transition={{ 
           opacity: { type: 'spring', damping: 15, stiffness: 100 },
           x: { type: 'spring', damping: 15, stiffness: 100 },
           filter: { duration: 0.8, ease: "easeOut" } // Avoid spring for blur to prevent negative values
         }}
         className="absolute right-[50%] mr-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-[#ff4d4d] to-[#f97316] pb-2"
       >
         create
       </motion.span>
       
       <div className="absolute left-[50%] -translate-x-1/2 flex pb-2">
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
           className="relative z-10"
         >
           r
         </motion.span>
         <AnimatePresence>
           {phase === 0 && (
             <motion.span
               initial={{ opacity: 1, y: -50, scale: 1.2 }}
               exit={{ opacity: 0, scale: 0.5, x: 40, y: -20, filter: 'blur(10px)' }}
               transition={{ duration: 0.6, ease: "easeIn" }}
               className="text-white absolute left-[100%] top-0 origin-left pl-1"
             >
               elax
             </motion.span>
           )}
         </AnimatePresence>
       </div>

       <motion.span
         initial={{ opacity: 0, x: 120, filter: 'blur(20px)' }}
         animate={{ 
           opacity: phase >= 2 ? 1 : 0, 
           x: phase >= 2 ? 0 : 80, 
           filter: phase >= 2 ? 'blur(0px)' : 'blur(20px)' 
         }}
         transition={{ 
           opacity: { type: 'spring', damping: 15, stiffness: 100 },
           x: { type: 'spring', damping: 15, stiffness: 100 },
           filter: { duration: 0.8, ease: "easeOut" } // Avoid spring for blur to prevent negative values
         }}
         className="absolute left-[50%] ml-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-[#7c6af5] to-[#06b6d4] pb-2"
       >
         os
       </motion.span>
    </div>
  )
}

function InteractiveGlow() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div
        animate={{ x: mousePos.x - 400, y: mousePos.y - 400 }}
        transition={{ type: 'spring', damping: 50, stiffness: 200, mass: 0.5 }}
        className="w-[800px] h-[800px] rounded-full opacity-[0.08]"
        style={{
          background: 'radial-gradient(circle, #7c6af5 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
    </div>
  )
}

function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(124,106,245,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,106,245,0.06) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 60% at 50% 0%, transparent 40%, #08080f 100%)' }} />
    </div>
  )
}

function ScrollShowcase() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] })
  
  const textScale = useTransform(scrollYProgress, [0, 0.12], [1, 8])
  const textOpacity = useTransform(scrollYProgress, [0, 0.08, 0.12], [1, 1, 0])

  const card1Y = useTransform(scrollYProgress, [0.08, 0.15, 0.35, 0.42], ["30vh", "0vh", "0vh", "-40vh"])
  const card1Opacity = useTransform(scrollYProgress, [0.08, 0.12, 0.35, 0.42], [0, 1, 1, 0])
  const card1Scale = useTransform(scrollYProgress, [0.08, 0.15, 0.35, 0.42], [0.9, 1, 1, 1.1])

  const card2Y = useTransform(scrollYProgress, [0.38, 0.45, 0.65, 0.72], ["30vh", "0vh", "0vh", "-40vh"])
  const card2Opacity = useTransform(scrollYProgress, [0.38, 0.42, 0.65, 0.72], [0, 1, 1, 0])
  const card2Scale = useTransform(scrollYProgress, [0.38, 0.45, 0.65, 0.72], [0.9, 1, 1, 1.1])

  const card3Y = useTransform(scrollYProgress, [0.68, 0.75, 0.95, 1.0], ["30vh", "0vh", "0vh", "0vh"])
  const card3Opacity = useTransform(scrollYProgress, [0.68, 0.72, 0.95], [0, 1, 1])
  const card3Scale = useTransform(scrollYProgress, [0.68, 0.75], [0.9, 1])

  const bgOpacity1 = useTransform(scrollYProgress, [0.05, 0.1, 0.35, 0.42], [0, 1, 1, 0])
  const bgOpacity2 = useTransform(scrollYProgress, [0.38, 0.45, 0.65, 0.72], [0, 1, 1, 0])
  const bgOpacity3 = useTransform(scrollYProgress, [0.68, 0.75], [0, 1])

  return (
    <div ref={containerRef} className="h-[300vh] md:h-[400vh] relative w-full border-t border-white/5 bg-[#050508]">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div style={{ scale: textScale, opacity: textOpacity }} className="absolute z-10 pointer-events-none flex flex-col items-center justify-center">
          <h2 className="text-[60px] sm:text-[100px] md:text-[150px] lg:text-[180px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 text-center mix-blend-overlay">
            SCALE<br/>10X
          </h2>
        </motion.div>
        <motion.div style={{ opacity: bgOpacity1 }} className="absolute inset-0 bg-radial-gradient-1" />
        <motion.div style={{ opacity: bgOpacity2 }} className="absolute inset-0 bg-radial-gradient-2" />
        <motion.div style={{ opacity: bgOpacity3 }} className="absolute inset-0 bg-radial-gradient-3" />
        <div className="relative w-[90%] max-w-5xl aspect-video mx-auto flex items-center justify-center perspective-[1200px]">
            <motion.div style={{ y: card1Y, opacity: card1Opacity, scale: card1Scale }} className="absolute w-full rounded-2xl md:rounded-3xl overflow-hidden bg-[#0d0d15] border border-white/10 shadow-2xl">
               <div className="p-3 md:p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                 <span className="text-[10px] md:text-xs font-bold tracking-widest text-[#7c6af5] uppercase">Viral Analytics</span>
                 <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"/><div className="w-2.5 h-2.5 rounded-full bg-amber-500"/><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"/></div>
               </div>
               <img src="/assets/hero_dashboard_3d_1774778004295.png" alt="Analytics View" className="w-full object-cover scale-[1.02]" />
            </motion.div>
            <motion.div style={{ y: card2Y, opacity: card2Opacity, scale: card2Scale }} className="absolute w-full rounded-2xl md:rounded-3xl overflow-hidden bg-[#0d0d15] border border-white/10 shadow-2xl">
               <div className="p-3 md:p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                 <span className="text-[10px] md:text-xs font-bold tracking-widest text-[#06b6d4] uppercase">Timeline Engine</span>
               </div>
               <img src="/assets/timeline_editor_3d_1774778024239.png" alt="Timeline Editor" className="w-full object-cover scale-[1.01]" />
            </motion.div>
            <motion.div style={{ y: card3Y, opacity: card3Opacity, scale: card3Scale }} className="absolute w-full rounded-2xl md:rounded-3xl overflow-hidden bg-[#0d0d15] border border-white/10 shadow-2xl">
               <div className="p-3 md:p-4 bg-black/40 border-b border-white/5 flex justify-between items-center">
                 <span className="text-[10px] md:text-xs font-bold tracking-widest text-[#ec4899] uppercase">Publishing Queue</span>
               </div>
               <img src="/assets/publishing_calendar_mockup_1774778045010.png" alt="Publish UI" className="w-full object-cover" />
            </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    createClient().auth.getSession().then(({ data }) => {
      if (data.session) setIsLoggedIn(true)
    })
  }, [])

  const ctaHref  = isLoggedIn ? '/dashboard' : '/auth/login'
  const ctaLabel = isLoggedIn ? 'Dashboard' : 'Get started free'

  if (!isClient) return null

  return (
    <div className="min-h-screen bg-[#08080f] text-white overflow-x-hidden font-sans">
      <InteractiveGlow />
      <nav className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-4xl z-[60] flex items-center justify-between px-6 py-4 bg-[#08080f]/60 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl">
        <CreaterosLogoNav />
        <div className="flex items-center gap-4 md:gap-8">
          <Link href={ctaHref} className="hidden sm:block text-sm font-bold text-white/50 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href={ctaHref} className="text-sm font-bold px-6 py-2.5 rounded-xl text-white bg-gradient-to-br from-[#7c6af5] to-[#ec4899] shadow-lg hover:scale-105 transition-transform">
            {isLoggedIn ? 'Dashboard' : 'Get started'}
          </Link>
        </div>
      </nav>

      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden">
        <GridBackground />
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
           <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute left-[15%] top-[25%] p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md opacity-40">
             <Instagram className="text-[#ec4899]" size={28} />
           </motion.div>
           <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute right-[20%] top-[30%] p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md opacity-30">
             <Youtube className="text-[#ff0000]" size={32} />
           </motion.div>
        </div>

        <div className="relative z-20 text-center max-w-4xl mx-auto px-6 mt-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7c6af5]/10 border border-[#7c6af5]/30 text-xs font-bold text-[#a89ef8] mb-8">
            <Sparkles size={12} className="animate-pulse" />
            Empowering the next 1M creators
          </motion.div>
          <AnimatedHeroLogo />
          <motion.h4 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="text-lg md:text-xl text-white/50 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
            Createros scans trending signals, scripts your content, and automates posting. Turn your ideas into viral reality with the creator's ultimate OS.
          </motion.h4>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#7c6af5] to-[#ec4899] rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000" />
              <Link href={ctaHref} className="relative flex items-center gap-3 px-10 py-4 bg-[#08080f] border border-white/10 text-white font-black text-lg rounded-2xl hover:bg-white/[0.02] transition-all">
                {ctaLabel} <LottiePlayer preset="rocket" size={24} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ScrollShowcase />

      <section className="border-t border-b border-white/5 py-16 px-6 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { v: '10x', l: 'Output Boost' },
            { v: '3 m', l: 'Fast workflow' },
            { v: '2,400', l: 'Active Creators' },
            { v: '0', l: 'Skills Required' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-4xl md:text-5xl font-black mb-1.5 tracking-tight">{s.v}</p>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-32 px-6 relative overflow-hidden">
         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-[#ff4d4d]/10 blur-[100px] pointer-events-none rounded-full" />
         <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-xl bg-[#ff4d4d]/10 flex items-center justify-center border border-[#ff4d4d]/20">
                   <LottiePlayer preset="fire" size={24} />
                 </div>
                 <span className="text-xs font-black uppercase tracking-widest text-[#ff4d4d]">30-Day Growth Challenge</span>
               </div>
               <h2 className="text-4xl md:text-6xl font-black leading-tight mb-8">
                 The 30-Day <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d4d] to-[#f97316]">Creator Sprint</span>
               </h2>
               <p className="text-lg text-white/50 mb-10 leading-relaxed max-w-xl">
                 Don't just create content. Build a habit. Our Sprint engine gives you a roadmap, tracks your streak, and uses AI to refine your niche day by day.
               </p>
            </div>
            <div className="relative">
               <div className="absolute -inset-4 bg-gradient-to-br from-[#ff4d4d]/20 to-transparent blur-2xl rounded-[3rem]" />
               <div className="relative bg-[#0d0d15] border border-white/10 rounded-[2.5rem] p-1 overflow-hidden shadow-2xl">
                  <img src="/assets/media__1774782265115.png" alt="Sprint Dashboard" className="rounded-[2.4rem] w-full" />
               </div>
            </div>
         </div>
      </section>

      <section className="py-24 px-6 md:px-10">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7c6af5] mb-4">How it works</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">Fully automated workflow.</h2>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
             <div key={i} className="relative overflow-hidden p-6 rounded-3xl border border-white/10" style={{ background: step.bg }}>
               <div className="absolute right-4 top-4 text-6xl font-black opacity-[0.05]" style={{ color: step.color }}>{step.num}</div>
               <h3 className="text-sm font-black mb-4 uppercase tracking-widest" style={{ color: step.color }}>{step.sub}</h3>
               <p className="text-2xl font-bold text-white mb-3">{step.title}</p>
               <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
             </div>
          ))}
        </div>
      </section>

      <TestimonialSection />
      <PricingSection />
      <FAQSection />

      <footer className="border-t border-white/5 py-12 px-6 md:px-20 bg-[#050508] relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
           <div className="col-span-1 md:col-span-2">
             <CreaterosLogoNav />
             <p className="mt-6 text-white/40 max-w-sm leading-relaxed">
               The ultimate AI OS for content creators. From trending ideas to automated posting, we help you scale your presence effortlessly.
             </p>
             <div className="flex gap-4 mt-8">
               {[Instagram, Youtube, Twitter, Github].map((Icon, i) => (
                 <Link key={i} href="#" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all">
                   <Icon size={18} />
                 </Link>
               ))}
             </div>
           </div>
           <div>
             <h4 className="font-bold mb-6">Product</h4>
             <ul className="space-y-4 text-sm text-white/40">
               <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
               <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
               <li><Link href="#testimonials" className="hover:text-white transition-colors">Testimonials</Link></li>
             </ul>
           </div>
           <div>
             <h4 className="font-bold mb-6">Legal</h4>
             <ul className="space-y-4 text-sm text-white/40">
               <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
               <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
               <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
             </ul>
           </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">© 2026 Createros AI. All rights reserved.</p>
          <div className="flex gap-8">
             <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">Made with ⚡ in India</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .bg-radial-gradient-1 { background: radial-gradient(circle at 50% 50%, rgba(124,106,245,0.15) 0%, transparent 60%); }
        .bg-radial-gradient-2 { background: radial-gradient(circle at 50% 50%, rgba(6,182,212,0.11) 0%, transparent 60%); }
        .bg-radial-gradient-3 { background: radial-gradient(circle at 50% 50%, rgba(236,72,153,0.11) 0%, transparent 60%); }
      `}</style>
    </div>
  )
}

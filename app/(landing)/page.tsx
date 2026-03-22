'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const STEPS = [
  { num: '01', title: 'Discover', sub: 'Trending ideas', desc: 'AI scans YouTube and Instagram daily. You wake up to 20 viral-ready ideas in your niche — with hooks, angles, and difficulty ratings already attached.', color: '#7c6af5' },
  { num: '02', title: 'Plan', sub: 'Script + shot list', desc: 'Pick an idea. Get a full script outline, a shot-by-shot filming guide, and free B-roll links. You know exactly what to say and what to film before you hit record.', color: '#ec4899' },
  { num: '03', title: 'Film', sub: 'Scene by scene', desc: 'Upload each scene as you film it. The app assembles them in order, cuts silences, burns captions, and exports in 3 formats automatically.', color: '#06b6d4' },
  { num: '04', title: 'Multiply', sub: '10x your output', desc: 'One video becomes a Reel, a Short, a carousel, a tweet thread, and a newsletter — in minutes. Not hours.', color: '#10b981' },
  { num: '05', title: 'Publish', sub: 'Post everywhere', desc: 'Generate platform-specific captions and hashtags, schedule your posts at peak times, and push to Instagram and YouTube in one click.', color: '#f59e0b' },
]

const STATS = [
  { value: '10×', label: 'More content from one video' },
  { value: '3 min', label: 'To process a full video' },
  { value: '5+', label: 'Platforms in one click' },
  { value: '0', label: 'Design skills needed' },
]

const FEATURES = [
  { icon: '⚡', title: 'AI Idea Engine', desc: 'Daily trending ideas personalised to your niche with viral scores, hooks, and difficulty ratings.' },
  { icon: '📝', title: 'Script Studio', desc: 'Full script outline, shot list, and B-roll links. Film with confidence, not guesswork.' },
  { icon: '✂️', title: 'Smart Editor', desc: 'Auto silence cut, caption burn-in, and 3-format export from a single upload.' },
  { icon: '🎬', title: 'Scene Assembler', desc: 'Upload each scene separately. The AI assembles, edits, and combines them into one polished video.' },
  { icon: '🚀', title: 'One-Click Publish', desc: 'AI captions + hashtags + scheduled posting to Instagram and YouTube simultaneously.' },
  { icon: '📊', title: 'Growth Analytics', desc: 'Track what works, see your path to monetisation, and let the algorithm learn your style.' },
]

// Animated 3D-ish floating orbs background
function OrbField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { x: '15%', y: '20%', size: 400, color: '#7c6af5', delay: 0 },
        { x: '75%', y: '10%', size: 300, color: '#ec4899', delay: 1.5 },
        { x: '85%', y: '60%', size: 350, color: '#06b6d4', delay: 0.8 },
        { x: '5%',  y: '70%', size: 280, color: '#7c6af5', delay: 2 },
        { x: '45%', y: '85%', size: 320, color: '#10b981', delay: 1.2 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: orb.x, top: orb.y,
            width: orb.size, height: orb.size,
            background: `radial-gradient(circle at 35% 35%, ${orb.color}40, ${orb.color}08 70%, transparent)`,
            filter: 'blur(40px)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 1, 0.6],
            x: [-20, 20, -20],
            y: [-15, 15, -15],
          }}
          transition={{ duration: 8 + i * 1.5, repeat: Infinity, delay: orb.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// Floating 3D card mockup
function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 15 }}
      animate={{ opacity: 1, y: 0, rotateX: 8 }}
      transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      className="relative mx-auto max-w-3xl"
    >
      <motion.div
        animate={{ y: [-6, 6, -6], rotateZ: [-0.5, 0.5, -0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Glow behind card */}
        <div className="absolute inset-0 -inset-x-8 bg-gradient-to-b from-violet-500/20 to-transparent rounded-3xl blur-3xl" />

        {/* Main card */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #111118 0%, #18181f 100%)' }}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/8" style={{ background: '#0e0e14' }}>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            <div className="ml-3 flex-1 bg-white/5 rounded-md py-1 px-3 text-[10px] text-slate-500 max-w-xs">
              creatorapp.in/dashboard
            </div>
          </div>

          {/* Dashboard content */}
          <div className="flex" style={{ minHeight: 340 }}>
            {/* Sidebar */}
            <div className="w-36 border-r border-white/5 p-3 space-y-1" style={{ background: '#0d0d14' }}>
              <div className="flex items-center gap-2 px-2 py-2 mb-3">
                <div className="w-5 h-5 rounded-md bg-violet-500/30 border border-violet-500/40 flex items-center justify-center">
                  <span style={{ fontSize: 9 }}>⚡</span>
                </div>
                <span className="text-[10px] font-bold text-white">Creator OS</span>
              </div>
              {['Feed', 'Ideas', 'Guide', 'Editor', 'Publish', 'Analytics'].map((item, i) => (
                <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${i === 0 ? 'bg-violet-500/20' : ''}`}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: i === 0 ? '#7c6af5' : '#333' }} />
                  <span className={`text-[9px] font-medium ${i === 0 ? 'text-violet-300' : 'text-slate-500'}`}>{item}</span>
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] text-orange-400 font-medium mb-0.5">🔥 TRENDING TODAY</div>
                  <div className="text-sm font-bold text-white">What to create right now</div>
                </div>
                <div className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/30">Live</div>
              </div>

              {/* Idea cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { title: 'How I saved ₹50K on ₹30K salary', score: 91, tag: 'finance', color: '#7c6af5' },
                  { title: '5 AI tools replacing freelancers', score: 87, tag: 'tech', color: '#ec4899' },
                  { title: 'Morning routine that actually works', score: 84, tag: 'lifestyle', color: '#06b6d4' },
                  { title: 'Gym for people who hate the gym', score: 88, tag: 'fitness', color: '#10b981' },
                ].map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + i * 0.1 }}
                    className="rounded-xl border border-white/6 p-2.5 hover:border-white/12 transition-all cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[8px] font-medium px-1.5 py-0.5 rounded-full border" style={{ color: card.color, borderColor: card.color + '40', background: card.color + '15' }}>{card.tag}</span>
                      <span className="text-[9px] font-bold text-emerald-400">{card.score}</span>
                    </div>
                    <p className="text-[9px] text-white leading-tight font-medium">{card.title}</p>
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
                className="mt-3 rounded-xl border border-violet-500/20 p-2.5"
                style={{ background: 'rgba(124,106,245,0.06)' }}
              >
                <div className="flex justify-between mb-1.5">
                  <span className="text-[8px] text-slate-400">Instagram monetisation goal</span>
                  <span className="text-[8px] font-bold text-violet-400">64%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: '64%' }} transition={{ delay: 1.5, duration: 1 }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #7c6af5, #a89ef8)' }}
                  />
                </div>
                <p className="text-[7px] text-slate-600 mt-1">3,600 more followers to unlock IG Bonuses · ~6 weeks at current pace</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Floating badges */}
        {[
          { text: '🎬 Video processed in 2m 43s', x: '-12%', y: '20%', delay: 1.8 },
          { text: '✅ Posted to Instagram', x: '85%', y: '35%', delay: 2.1 },
          { text: '🚀 91 viral score', x: '80%', y: '75%', delay: 2.4 },
        ].map((badge, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: badge.delay, type: 'spring' }}
            className="absolute text-[10px] font-semibold text-white px-3 py-1.5 rounded-full border border-white/10 whitespace-nowrap"
            style={{ left: badge.x, top: badge.y, background: 'rgba(15,15,22,0.9)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
          >
            {badge.text}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

// Step card with number
function StepCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'start 0.2'] })
  const opacity   = useTransform(scrollYProgress, [0, 0.5], [0.3, 1])
  const translateY = useTransform(scrollYProgress, [0, 0.5], [30, 0])

  return (
    <motion.div ref={ref} style={{ opacity, y: translateY }} className="relative pl-16 md:pl-0">
      {/* Big number */}
      <div className="md:absolute md:-left-20 md:top-0 absolute left-0 top-0 text-6xl font-black leading-none select-none"
        style={{ color: step.color + '18', fontFamily: 'monospace' }}
      >
        {step.num}
      </div>

      <div className="rounded-2xl border border-white/8 p-6 hover:border-white/15 transition-all"
        style={{ background: `linear-gradient(135deg, ${step.color}08 0%, transparent 60%)` }}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: step.color }}>{step.sub}</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY     = useTransform(scrollYProgress, [0, 1], [0, 120])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setActiveFeature(p => (p + 1) % FEATURES.length), 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#08080f] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ background: 'rgba(8,8,15,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg, #7c6af5, #a89ef8)' }}>⚡</div>
          <span className="text-base font-bold tracking-tight">Creator OS</span>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="hidden md:flex items-center gap-6">
          {['Features', 'How it works', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm text-slate-400 hover:text-white transition-colors">{item}</a>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">Sign in</Link>
          <Link href="/auth/login"
            className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c6af5, #a89ef8)' }}
          >
            Get started free
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden">
        <OrbField />

        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundSize: '200px 200px' }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center max-w-5xl mx-auto mb-12">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 text-xs font-medium text-violet-300 mb-8"
            style={{ background: 'rgba(124,106,245,0.1)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Built for Indian creators · Post in 3 minutes
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-6"
            style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
          >
            <span className="block text-white">From idea to</span>
            <span className="block" style={{
              background: 'linear-gradient(135deg, #7c6af5 0%, #ec4899 40%, #06b6d4 80%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>
              posted in 3 minutes.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Creator OS finds what's trending, scripts your video, edits it automatically, and posts to Instagram and YouTube — while you focus on creating.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/auth/login"
              className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white text-base transition-all hover:scale-105 hover:shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #7c6af5, #ec4899)', boxShadow: '0 0 40px rgba(124,106,245,0.3)' }}
            >
              Start creating free
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <a href="#how-it-works" className="flex items-center gap-2 px-6 py-4 rounded-2xl font-medium text-slate-300 hover:text-white text-base transition-all border border-white/10 hover:border-white/20 hover:bg-white/5">
              See how it works
              <span>↓</span>
            </a>
          </motion.div>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          style={{ y: heroY }}
          className="relative z-10 w-full max-w-4xl mx-auto px-4"
        >
          <DashboardMockup />
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 border-y border-white/6 py-12" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl font-black text-white mb-1" style={{ background: 'linear-gradient(135deg, #7c6af5, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {stat.value}
              </p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">How it works</p>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Your entire content<br />workflow. Automated.
            </h2>
          </motion.div>

          <div className="relative space-y-6 md:pl-24">
            {/* Vertical line */}
            <div className="hidden md:block absolute left-8 top-3 bottom-3 w-px" style={{ background: 'linear-gradient(180deg, transparent, #7c6af5 20%, #ec4899 50%, #06b6d4 80%, transparent)' }} />

            {STEPS.map((step, i) => <StepCard key={i} step={step} index={i} />)}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-32 px-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">Features</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">Everything a creator needs</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, borderColor: 'rgba(124,106,245,0.4)' }}
                className="rounded-2xl border border-white/8 p-6 transition-all cursor-default"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator pain points solved */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">We know the struggle.</h2>
            <p className="text-lg text-slate-400">Every creator's pain point — solved.</p>
          </motion.div>

          <div className="space-y-4">
            {[
              { pain: '"What should I make today?"', solution: 'AI shows you 20 trending ideas in your niche every morning.' },
              { pain: '"I don\'t know how to edit."', solution: 'Upload your clips. The AI edits, captions, and exports automatically.' },
              { pain: '"Captions take me an hour."', solution: 'Generate platform-specific captions and hashtags in 10 seconds.' },
              { pain: '"I forget to post consistently."', solution: 'Schedule weeks of content in advance. Post at peak times automatically.' },
              { pain: '"I made a video but only one piece of content."', solution: 'One video → Reel + Short + carousel + thread + newsletter.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex gap-6 items-start p-5 rounded-2xl border border-white/6 hover:border-white/12 transition-all"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <span className="text-rose-400 text-sm line-through opacity-70 block leading-relaxed">{item.pain}</span>
                </div>
                <div className="w-px self-stretch bg-white/10 flex-shrink-0" />
                <div>
                  <span className="text-emerald-400 text-sm leading-relaxed">✓ {item.solution}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-32 px-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Simple, honest pricing</h2>
            <p className="text-slate-400">Start free. Upgrade when you're ready to scale.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '₹0', period: '', features: ['2 ideas / month', '2 video uploads', '1 format export', 'Watermark on videos'], cta: 'Start free', highlight: false },
              { name: 'Creator', price: '₹1,599', period: '/month', features: ['50 ideas / month', '20 video uploads', '3 format exports', 'No watermark', 'Scheduling', 'All AI features'], cta: 'Start creating', highlight: true },
              { name: 'Pro', price: '₹3,999', period: '/month', features: ['Unlimited everything', 'Priority processing', 'Analytics dashboard', 'White-label exports', 'Early features'], cta: 'Go Pro', highlight: false },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 border transition-all ${plan.highlight ? 'border-violet-500/50' : 'border-white/8'}`}
                style={{ background: plan.highlight ? 'linear-gradient(135deg, rgba(124,106,245,0.15), rgba(236,72,153,0.08))' : 'rgba(255,255,255,0.03)' }}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white px-3 py-1 rounded-full" style={{ background: 'linear-gradient(135deg, #7c6af5, #ec4899)' }}>
                    Most popular
                  </div>
                )}
                <p className="text-base font-bold text-white mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <span className="text-emerald-400 text-xs">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/login"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 ${plan.highlight ? 'text-white' : 'text-slate-300 border border-white/15 hover:border-white/30'}`}
                  style={plan.highlight ? { background: 'linear-gradient(135deg, #7c6af5, #ec4899)' } : {}}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(124,106,245,0.15), transparent)' }} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Your audience is<br />waiting. Let's go.
          </h2>
          <p className="text-lg text-slate-400 mb-10">
            Join creators who are posting more, stressing less, and growing faster with Creator OS.
          </p>
          <Link href="/auth/login"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-white text-lg transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #7c6af5, #ec4899)', boxShadow: '0 0 60px rgba(124,106,245,0.4)' }}
          >
            Start for free
            <span className="text-xl">→</span>
          </Link>
          <p className="text-xs text-slate-600 mt-4">No credit card required. Free forever plan available.</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/6 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: 'linear-gradient(135deg, #7c6af5, #a89ef8)' }}>⚡</div>
            <span className="text-sm font-bold text-white">Creator OS</span>
          </div>
          <p className="text-xs text-slate-600">Built for creators in India. Post more. Stress less.</p>
          <div className="flex gap-6">
            <Link href="/auth/login" className="text-xs text-slate-500 hover:text-white transition-colors">Sign in</Link>
            <Link href="/dashboard" className="text-xs text-slate-500 hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

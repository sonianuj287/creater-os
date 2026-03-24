'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

// ── Data ──────────────────────────────────────────────────────

const STEPS = [
  { num: '01', title: 'Discover', sub: 'Trending ideas daily', desc: 'AI scans YouTube and Instagram every morning. You wake up to 20 viral-ready ideas in your niche — with hooks, angles, and difficulty ratings.', color: '#7c6af5', bg: 'rgba(124,106,245,0.08)' },
  { num: '02', title: 'Plan',     sub: 'Script + shot list',   desc: 'One click generates a full script, shot list, and free B-roll links. You know exactly what to say before you hit record.', color: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
  { num: '03', title: 'Film',     sub: 'Scene by scene',       desc: 'Upload each scene separately. The AI assembles them, cuts silences, burns captions, and exports in 3 formats — automatically.', color: '#06b6d4', bg: 'rgba(6,182,212,0.08)' },
  { num: '04', title: 'Publish',  sub: 'Post everywhere',      desc: 'AI captions, perfect hashtags, scheduled at peak times. One click posts to Instagram and YouTube simultaneously.', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
]

const FEATURES = [
  { icon: '⚡', title: 'Trending idea engine',    desc: 'Daily ideas personalised to your niche with viral scores and ready-to-use hooks.',        color: '#7c6af5' },
  { icon: '📝', title: 'AI script studio',        desc: 'Full script outline, shot list, and B-roll links in one click.',                          color: '#ec4899' },
  { icon: '✂️', title: 'Smart video editor',      desc: 'Auto silence cut, caption burn-in, 3-format export from a single upload.',               color: '#06b6d4' },
  { icon: '🎬', title: 'Scene assembler',          desc: 'Film in parts. AI stitches, captions, and polishes into one complete video.',             color: '#f59e0b' },
  { icon: '🚀', title: 'One-click publishing',    desc: 'AI captions + hashtags + scheduled posts to Instagram and YouTube.',                       color: '#10b981' },
  { icon: '📊', title: 'Growth analytics',        desc: 'Track views, saves, follower growth and see your path to monetisation.',                  color: '#a855f7' },
]

const PAIN_POINTS = [
  { pain: '"What should I make today?"',       fix: 'AI shows you 20 trending ideas in your niche every morning.' },
  { pain: '"I don\'t know how to edit."',      fix: 'Upload clips. AI edits, captions, and exports in 3 formats automatically.' },
  { pain: '"Captions take me an hour."',       fix: 'Platform-specific captions + hashtags generated in 10 seconds.' },
  { pain: '"I forget to post consistently."', fix: 'Schedule weeks of content. Auto-post at peak engagement times.' },
  { pain: '"One video = one post."',           fix: 'One video → Reel + Short + carousel + thread + newsletter.' },
]

// ── Logo Component ────────────────────────────────────────────
function CreatorOSLogo({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const fontSize = size === 'lg' ? '5.5rem' : '1.1rem'
  const iconSize = size === 'lg' ? 56 : 24
  const iconRadius = size === 'lg' ? 16 : 8

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2.5">
        <div style={{
          width: iconSize, height: iconSize, borderRadius: iconRadius,
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
        }}>Creator OS</span>
      </div>
    )
  }

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 20 }}
      >
        {/* 3D icon */}
        <motion.div
          animate={{ rotateY: [0, 10, -10, 0], rotateX: [0, -5, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: iconSize, height: iconSize, borderRadius: iconRadius,
            background: 'linear-gradient(135deg, #7c6af5 0%, #ec4899 50%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 900,
            boxShadow: '0 8px 40px rgba(124,106,245,0.5), 0 2px 8px rgba(0,0,0,0.3)',
            transformStyle: 'preserve-3d',
          }}
        >⚡</motion.div>

        {/* Wordmark */}
        <span style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontWeight: 900,
          fontSize: fontSize,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          background: 'linear-gradient(135deg, #ff4d4d 0%, #f97316 20%, #7c6af5 55%, #06b6d4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Creator OS
        </span>
      </motion.div>
    </div>
  )
}

// ── Animated grid background ──────────────────────────────────
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(124,106,245,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,106,245,0.06) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />
      {/* Radial fade overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, #08080f 100%)',
      }} />
      {/* Glowing orbs */}
      {[
        { x: '20%', y: '30%', c: '#7c6af5', s: 500 },
        { x: '80%', y: '15%', c: '#ec4899', s: 400 },
        { x: '60%', y: '70%', c: '#06b6d4', s: 350 },
      ].map((orb, i) => (
        <motion.div key={i}
          style={{
            position: 'absolute', left: orb.x, top: orb.y,
            width: orb.s, height: orb.s,
            background: `radial-gradient(circle, ${orb.c}25 0%, transparent 70%)`,
            filter: 'blur(40px)',
            transform: 'translate(-50%,-50%)',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, delay: i * 1.5, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ── 3D floating dashboard mockup ──────────────────────────────
function DashboardCard() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  function handleMouseMove(e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20
    const y = -((e.clientY - rect.top) / rect.height - 0.5) * 20
    setMousePos({ x, y })
  }
  function handleMouseLeave() { setMousePos({ x: 0, y: 0 }) }

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 20 }}
      animate={{ opacity: 1, y: 0, rotateX: 8 }}
      transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
      className="relative mx-auto max-w-3xl cursor-pointer"
    >
      <motion.div
        animate={{
          rotateX: mousePos.y + 8,
          rotateY: mousePos.x,
          y: mousePos.x === 0 ? [-8, 8, -8] : 0,
        }}
        transition={mousePos.x === 0
          ? { y: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }
          : { type: 'spring', stiffness: 200, damping: 30 }
        }
        style={{ transformStyle: 'preserve-3d' }}
        className="relative"
      >
        {/* Glow */}
        <div style={{
          position: 'absolute', inset: '-20px',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(124,106,245,0.25), transparent 70%)',
          filter: 'blur(30px)',
          transform: 'translateZ(-10px)',
        }} />

        {/* Card */}
        <div style={{
          background: 'linear-gradient(145deg, #13131c 0%, #0e0e18 100%)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
          {/* Browser bar */}
          <div style={{ background: '#0a0a12', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#eab308', opacity: 0.8 }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', opacity: 0.8 }} />
            <div style={{ marginLeft: 12, flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '4px 12px', fontSize: 10, color: 'rgba(255,255,255,0.3)', maxWidth: 240 }}>
              creatorapp.in/dashboard
            </div>
          </div>

          <div style={{ display: 'flex', minHeight: 360 }}>
            {/* Sidebar */}
            <div style={{ width: 150, background: '#0a0a12', borderRight: '1px solid rgba(255,255,255,0.05)', padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 8px 16px' }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg,#7c6af5,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>⚡</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Creator OS</span>
              </div>
              {[
                { label: 'Feed', active: true, dot: '#7c6af5' },
                { label: 'Ideas', active: false, dot: '#444' },
                { label: 'Guide', active: false, dot: '#444' },
                { label: 'Editor', active: false, dot: '#444' },
                { label: 'Publish', active: false, dot: '#444' },
                { label: 'Analytics', active: false, dot: '#444' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 8px', borderRadius: 8, marginBottom: 2,
                  background: item.active ? 'rgba(124,106,245,0.15)' : 'transparent',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.dot }} />
                  <span style={{ fontSize: 10, color: item.active ? '#a89ef8' : 'rgba(255,255,255,0.3)', fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Main content */}
            <div style={{ flex: 1, padding: 16, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 9, color: '#f97316', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>🔥 Trending Today</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>What to create right now</div>
                </div>
                <div style={{ fontSize: 8, background: 'rgba(34,197,94,0.15)', color: '#4ade80', padding: '3px 8px', borderRadius: 20, border: '1px solid rgba(34,197,94,0.3)', fontWeight: 600 }}>● Live</div>
              </div>

              {/* Idea cards grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                {[
                  { title: 'How I saved ₹50K on ₹30K salary', score: 91, tag: 'finance', c: '#7c6af5' },
                  { title: '5 AI tools replacing freelancers', score: 87, tag: 'tech', c: '#ec4899' },
                  { title: 'Morning routine that works', score: 84, tag: 'lifestyle', c: '#06b6d4' },
                  { title: 'Gym for people who hate gym', score: 88, tag: 'fitness', c: '#10b981' },
                ].map((card, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                    style={{
                      background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.07)', padding: 10,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 6px', borderRadius: 10, background: card.c + '20', color: card.c, border: `1px solid ${card.c}40` }}>{card.tag}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#4ade80' }}>{card.score}</span>
                    </div>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: 600, lineHeight: 1.4 }}>{card.title}</p>
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
                style={{ background: 'rgba(124,106,245,0.08)', borderRadius: 10, border: '1px solid rgba(124,106,245,0.2)', padding: 10 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>Instagram monetisation goal</span>
                  <span style={{ fontSize: 8, color: '#a89ef8', fontWeight: 700 }}>64%</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: '64%' }}
                    transition={{ delay: 1.8, duration: 1.2, ease: [0.22,1,0.36,1] }}
                    style={{ height: '100%', background: 'linear-gradient(90deg,#7c6af5,#ec4899)', borderRadius: 2 }}
                  />
                </div>
                <p style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>3,600 more followers · ~6 weeks at current pace</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Floating notification badges */}
        {[
          { text: '🎬 Video processed in 2m 43s', x: '-8%', y: '18%' },
          { text: '✅ Posted to Instagram + YouTube', x: '78%', y: '32%' },
          { text: '🚀 91 viral score · trending now', x: '72%', y: '78%' },
        ].map((b, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.8 + i * 0.25, type: 'spring', stiffness: 200 }}
            style={{
              position: 'absolute', left: b.x, top: b.y,
              background: 'rgba(10,10,18,0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 30, padding: '7px 14px',
              fontSize: 11, fontWeight: 600, color: '#fff',
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              transform: 'translateZ(20px)',
            }}
          >{b.text}</motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

// ── Step card ─────────────────────────────────────────────────
function StepCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{
        background: step.bg,
        border: `1px solid ${step.color}25`,
        borderRadius: 20, padding: '32px 28px',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Big number watermark */}
      <div style={{
        position: 'absolute', right: 20, top: 10,
        fontSize: 80, fontWeight: 900, color: step.color,
        opacity: 0.08, lineHeight: 1, pointerEvents: 'none',
        fontFamily: 'monospace',
      }}>{step.num}</div>

      <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: step.color, marginBottom: 10 }}>
        {step.sub}
      </div>
      <h3 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>{step.title}</h3>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{step.desc}</p>
    </motion.div>
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
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 40px',
        background: 'rgba(8,8,15,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <CreatorOSLogo size="sm" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {['Features', 'How it works', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
              style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = '#fff'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.5)'}
            >{item}</a>
          ))}
          <Link href={ctaHref} style={{
            fontSize: 13, fontWeight: 700, padding: '8px 20px', borderRadius: 12,
            background: 'linear-gradient(135deg, #7c6af5, #ec4899)',
            color: '#fff', textDecoration: 'none',
            boxShadow: '0 0 20px rgba(124,106,245,0.3)',
          }}>{isLoggedIn ? 'Dashboard' : 'Get started'}</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 100, paddingBottom: 60, overflow: 'hidden' }}>
        <GridBackground />

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          {/* Eyebrow pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 30,
              background: 'rgba(124,106,245,0.12)',
              border: '1px solid rgba(124,106,245,0.35)',
              fontSize: 12, fontWeight: 600, color: '#a89ef8',
              marginBottom: 32,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c6af5', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Built for creators · Post in 3 minutes
          </motion.div>

          {/* Big headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.04em', margin: '0 0 20px' }}>
              <span style={{ display: 'block', color: '#fff' }}>From idea to</span>
              <span style={{
                display: 'block',
                background: 'linear-gradient(135deg, #ff4d4d 0%, #f97316 25%, #7c6af5 60%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                posted in 3 minutes.
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}
          >
            Creator OS finds what's trending, scripts your video, edits it automatically, and posts to Instagram and YouTube — while you focus on creating.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href={ctaHref} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '16px 36px', borderRadius: 16,
              background: 'linear-gradient(135deg, #7c6af5, #ec4899)',
              color: '#fff', fontWeight: 800, fontSize: 16, textDecoration: 'none',
              boxShadow: '0 0 50px rgba(124,106,245,0.4), 0 8px 32px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.04)' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)' }}
            >
              {ctaLabel}
              <span style={{ fontSize: 20 }}>→</span>
            </Link>
            <a href="#how-it-works" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '16px 28px', borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 15, textDecoration: 'none',
              background: 'rgba(255,255,255,0.04)',
            }}>See how it works ↓</a>
          </motion.div>
        </div>

        {/* Dashboard mockup */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 900, margin: '60px auto 0', padding: '0 20px' }}>
          <DashboardCard />
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 40px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
          {[
            { v: '10×',   l: 'More content from one video' },
            { v: '3 min', l: 'To process a full video' },
            { v: '5+',    l: 'Platforms in one click' },
            { v: '0',     l: 'Design skills needed' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <p style={{
                fontSize: 42, fontWeight: 900, marginBottom: 6, letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #ff4d4d, #7c6af5, #06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{s.v}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{s.l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#7c6af5', marginBottom: 16 }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#fff' }}>
              Your entire content workflow.<br />Automated.
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {STEPS.map((step, i) => <StepCard key={i} step={step} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '100px 40px', background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#ec4899', marginBottom: 16 }}>Features</p>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff' }}>Everything a creator needs</h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                whileHover={{ y: -6, borderColor: f.color + '50' }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20, padding: 28, cursor: 'default',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pain points ── */}
      <section style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', marginBottom: 12 }}>We know the struggle.</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.4)' }}>Every creator's daily pain — solved.</p>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PAIN_POINTS.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                style={{
                  display: 'flex', gap: 20, alignItems: 'flex-start',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16, padding: '18px 24px',
                }}
              >
                <span style={{ fontSize: 14, color: 'rgba(239,68,68,0.7)', textDecoration: 'line-through', flex: '0 0 46%', lineHeight: 1.5 }}>{item.pain}</span>
                <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: '#4ade80', lineHeight: 1.5 }}>✓ {item.fix}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '100px 40px', background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#10b981', marginBottom: 16 }}>Pricing</p>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', marginBottom: 10 }}>Simple pricing</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>Start free. Upgrade when you're ready to scale.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { name: 'Free', price: '₹0', features: ['2 ideas/month', '2 video uploads', '1 format export', 'Watermark'], highlight: false, cta: 'Start free' },
              { name: 'Creator', price: '₹1,599/mo', features: ['50 ideas/month', '20 video uploads', '3 format exports', 'No watermark', 'Scheduling'], highlight: true, cta: 'Start creating' },
              { name: 'Pro', price: '₹3,999/mo', features: ['Unlimited everything', 'Priority processing', 'Analytics', 'White-label'], highlight: false, cta: 'Go Pro' },
            ].map((plan, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{
                  position: 'relative',
                  background: plan.highlight ? 'linear-gradient(135deg, rgba(124,106,245,0.15), rgba(236,72,153,0.08))' : 'rgba(255,255,255,0.03)',
                  border: plan.highlight ? '1px solid rgba(124,106,245,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20, padding: 28,
                }}
              >
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 800, color: '#fff', padding: '4px 14px', borderRadius: 20, background: 'linear-gradient(135deg,#7c6af5,#ec4899)', whiteSpace: 'nowrap' }}>
                    Most popular
                  </div>
                )}
                <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{plan.name}</p>
                <p style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 20, letterSpacing: '-0.02em' }}>{plan.price}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                      <span style={{ color: '#4ade80', fontSize: 11 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href={ctaHref} style={{
                  display: 'block', textAlign: 'center', padding: '12px', borderRadius: 12,
                  background: plan.highlight ? 'linear-gradient(135deg,#7c6af5,#ec4899)' : 'rgba(255,255,255,0.07)',
                  border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}>{plan.cta}</Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Big CTA ── */}
      <section style={{ padding: '120px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,106,245,0.12), transparent)', pointerEvents: 'none' }} />
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative' }}
        >
          <CreatorOSLogo size="lg" />
          <p style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, color: '#fff', margin: '28px 0 16px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            Your audience is waiting.
          </p>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', marginBottom: 40 }}>
            Join creators posting more, stressing less, and growing faster.
          </p>
          <Link href={ctaHref} style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: '18px 44px', borderRadius: 18,
            background: 'linear-gradient(135deg, #7c6af5, #ec4899)',
            color: '#fff', fontWeight: 800, fontSize: 17, textDecoration: 'none',
            boxShadow: '0 0 60px rgba(124,106,245,0.4), 0 12px 40px rgba(0,0,0,0.4)',
          }}>
            {ctaLabel} <span style={{ fontSize: 22 }}>→</span>
          </Link>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 16 }}>No credit card · Free plan available</p>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <CreatorOSLogo size="sm" />
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Built for creators in India. Post more. Stress less.</p>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link href={ctaHref} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>{isLoggedIn ? 'Dashboard' : 'Get started'}</Link>
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>
    </div>
  )
}
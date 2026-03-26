import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt     = 'Createros — From idea to posted in 3 minutes'
export const size    = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background:     '#08080f',
          width:          '100%',
          height:         '100%',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          fontFamily:     'system-ui, sans-serif',
          position:       'relative',
          overflow:       'hidden',
        }}
      >
        {/* Grid bg */}
        <div style={{
          position:        'absolute',
          inset:           0,
          backgroundImage: 'linear-gradient(rgba(124,106,245,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124,106,245,0.08) 1px, transparent 1px)',
          backgroundSize:  '60px 60px',
        }} />

        {/* Gradient orbs */}
        <div style={{ position:'absolute', width:600, height:600, left:-100, top:-100, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,106,245,0.18), transparent 70%)', filter:'blur(40px)' }} />
        <div style={{ position:'absolute', width:400, height:400, right:-50, bottom:-50, borderRadius:'50%', background:'radial-gradient(circle, rgba(236,72,153,0.15), transparent 70%)', filter:'blur(40px)' }} />

        {/* Content */}
        <div style={{ position:'relative', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'0 80px' }}>

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:40 }}>
            <div style={{ width:72, height:72, borderRadius:20, background:'linear-gradient(135deg,#7c6af5,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>
              ⚡
            </div>
            <span style={{ fontSize:52, fontWeight:900, color:'#fff', letterSpacing:'-0.04em' }}>Createros</span>
          </div>

          {/* Headline */}
          <div style={{ fontSize:56, fontWeight:900, lineHeight:1.05, letterSpacing:'-0.04em', marginBottom:24 }}>
            <span style={{ color:'#fff' }}>From idea to </span>
            <span style={{ background:'linear-gradient(135deg,#ff4d4d,#f97316,#7c6af5,#06b6d4)', WebkitBackgroundClip:'text', color:'transparent' }}>
              posted in 3 min.
            </span>
          </div>

          {/* Subline */}
          <p style={{ fontSize:22, color:'rgba(255,255,255,0.5)', maxWidth:700, lineHeight:1.5, margin:0 }}>
            AI ideas · auto video editing · captions · Instagram + YouTube
          </p>

          {/* Pills */}
          <div style={{ display:'flex', gap:12, marginTop:40 }}>
            {['Free to start', 'Built for India', 'No editing skills needed'].map(tag => (
              <div key={tag} style={{ padding:'8px 18px', borderRadius:30, background:'rgba(124,106,245,0.12)', border:'1px solid rgba(124,106,245,0.3)', fontSize:16, color:'#a89ef8', fontWeight:600 }}>
                {tag}
              </div>
            ))}
          </div>

          {/* URL */}
          <p style={{ marginTop:40, fontSize:18, color:'rgba(255,255,255,0.25)', letterSpacing:'0.05em' }}>
            createros.in
          </p>
        </div>
      </div>
    ),
    { ...size }
  )
}

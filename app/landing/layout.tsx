export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Server-rendered privacy link — visible to Google crawler */}
      <div style={{ textAlign: 'center', padding: '12px', background: '#08080f' }}>
        <a href="/privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'underline' }}>
          Privacy Policy
        </a>
        {' · '}
        <a href="https://createros.in" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          createros.in
        </a>
      </div>
    </>
  )
}

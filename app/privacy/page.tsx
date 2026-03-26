import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Createros — how we collect, use and protect your data.',
  alternates: { canonical: 'https://createros.in/privacy' },
}

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Information we collect',
      body: `We collect information you provide directly:
• Account information: name, email address, and profile photo when you sign up via Google OAuth.
• Content data: videos, images, and text you upload or generate within the platform.
• Usage data: which features you use, how often, and basic device/browser information.
• Platform connections: access tokens for Instagram and YouTube when you choose to connect them.`,
    },
    {
      title: '2. How we use your information',
      body: `We use collected information to:
• Provide and improve the Createros service.
• Process your videos and generate AI content on your behalf.
• Post to connected social media accounts when you explicitly request it.
• Send product updates and important service notifications (you can opt out).
• Analyse usage patterns to improve features — we use aggregated, anonymised data only.`,
    },
    {
      title: '3. Data sharing',
      body: `We do not sell your personal data. We share data only with:
• Infrastructure providers: Supabase (database), Cloudflare R2 (file storage), Railway (compute). All are bound by data processing agreements.
• AI providers: Google Gemini API processes your video transcripts and content prompts. Audio/video is not stored by Google after processing.
• Social platforms: Instagram Graph API and YouTube Data API receive your content only when you explicitly click "Post" or "Schedule".`,
    },
    {
      title: '4. Instagram and Facebook data',
      body: `When you connect your Instagram account, we access:
• Basic profile information (username, follower count) to display in your dashboard.
• Content publishing permissions to post Reels and carousels on your behalf.
• Insights data to show you post performance in Analytics.

We do not access your Instagram DMs, personal messages, or contact list. You can disconnect your Instagram account at any time from the Publish → Accounts tab, which revokes all permissions.`,
    },
    {
      title: '5. YouTube data',
      body: `When you connect your YouTube account, we access:
• Channel information (name, subscriber count) for display purposes.
• Upload permission (youtube.upload scope) to post videos on your behalf.

We do not access your YouTube watch history, subscriptions, or private data. You can disconnect at any time.`,
    },
    {
      title: '6. Data retention',
      body: `• Account data: retained while your account is active. Deleted within 30 days of account deletion.
• Uploaded videos: stored in Cloudflare R2. Processed outputs retained for 90 days, then automatically deleted unless you download them.
• Usage logs: retained for 12 months for billing and abuse prevention.
• Social tokens: deleted immediately when you disconnect a platform account.`,
    },
    {
      title: '7. Your rights',
      body: `You have the right to:
• Access your personal data — email us and we'll provide a copy within 7 days.
• Delete your account and all associated data — available in Settings.
• Disconnect any social platform at any time.
• Opt out of non-essential communications.
• Lodge a complaint with your local data protection authority.`,
    },
    {
      title: '8. Security',
      body: `We implement industry-standard security measures including HTTPS encryption in transit, encrypted storage at rest, OAuth 2.0 for social connections (we never store your passwords), and regular security reviews. No system is 100% secure — if you discover a vulnerability, please email security@createros.in.`,
    },
    {
      title: '9. Cookies',
      body: `We use only essential cookies required for authentication (Supabase session tokens). We do not use advertising cookies or third-party tracking pixels. You can disable cookies in your browser but this will prevent you from staying logged in.`,
    },
    {
      title: '10. Changes to this policy',
      body: `We may update this policy occasionally. For significant changes we will notify you by email and show a notice in the app. Continued use after changes constitutes acceptance.`,
    },
    {
      title: '11. Contact',
      body: `For privacy questions or data requests, contact us at:\n\nEmail: privacy@createros.in\nWebsite: https://createros.in\n\nCreateros is operated by an independent developer based in India.`,
    },
  ]

  return (
    <div style={{ background: '#08080f', minHeight: '100vh', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#7c6af5,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Createros</span>
        </a>
        <a href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>← Back to home</a>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 80px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7c6af5', marginBottom: 16 }}>Legal</p>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 12 }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 48 }}>
          Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 48, padding: '20px 24px', background: 'rgba(124,106,245,0.08)', borderRadius: 12, border: '1px solid rgba(124,106,245,0.2)' }}>
          Createros is committed to protecting your privacy. This policy explains what data we collect, why we collect it, and how you can control it.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {sections.map((s) => (
            <div key={s.title}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>{s.title}</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} Createros · createros.in · privacy@createros.in</p>
      </div>
    </div>
  )
}

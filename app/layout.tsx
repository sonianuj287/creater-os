import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

const BASE_URL = 'https://createros.in'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Createros — From idea to posted in 3 minutes',
    template: '%s | Createros',
  },
  description: 'AI-powered content OS for Indian creators. Get trending ideas, auto-edit your videos, generate captions, and post to YouTube — all in one place.',
  keywords: [
    'content creator tools india',
    'ai video editing india',
    'instagram reels automation',
    'youtube shorts creator',
    'social media scheduler india',
    'content creation ai',
    'video repurposing tool',
    'creator tools hindi',
    'instagram growth tool india',
    'youtube automation india',
  ],
  authors: [{ name: 'Createros', url: BASE_URL }],
  creator: 'Createros',
  publisher: 'Createros',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type:        'website',
    locale:      'en_IN',
    url:         BASE_URL,
    siteName:    'Createros',
    title:       'Createros — From idea to posted in 3 minutes',
    description: 'AI-powered content OS for Indian creators. Trending ideas → auto-edit → post to YouTube.',
    images: [{
      url:    '/og-image.png',
      width:  1200,
      height: 630,
      alt:    'Createros — AI content creation platform',
    }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Createros — From idea to posted in 3 minutes',
    description: 'AI-powered content OS for Indian creators.',
    images:      ['/og-image.png'],
    creator:     '@createros_in',
  },
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon:  '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'REPLACE_WITH_GOOGLE_VERIFICATION_CODE',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans bg-canvas text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}

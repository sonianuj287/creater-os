import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Creator OS — Your content command centre',
  description: 'From trending idea to published post. Powered by AI.',
  openGraph: {
    title: 'Creator OS',
    description: 'From trending idea to published post. Powered by AI.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans bg-canvas text-white antialiased`}
      >
        {children}
      </body>
    </html>
  )
}

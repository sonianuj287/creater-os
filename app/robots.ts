import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/auth/callback', '/api/'],
      },
    ],
    sitemap: 'https://createros.in/sitemap.xml',
    host:    'https://createros.in',
  }
}

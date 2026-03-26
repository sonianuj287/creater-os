import { MetadataRoute } from 'next'

const BASE_URL = 'https://createros.in'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url:              BASE_URL,
      lastModified:     new Date(),
      changeFrequency:  'weekly',
      priority:         1,
    },
    {
      url:              `${BASE_URL}/auth/login`,
      lastModified:     new Date(),
      changeFrequency:  'monthly',
      priority:         0.8,
    },
    {
      url:              `${BASE_URL}/dashboard`,
      lastModified:     new Date(),
      changeFrequency:  'daily',
      priority:         0.9,
    },
    {
      url:              `${BASE_URL}/dashboard/studio`,
      lastModified:     new Date(),
      changeFrequency:  'weekly',
      priority:         0.7,
    },
    {
      url:              `${BASE_URL}/dashboard/editor`,
      lastModified:     new Date(),
      changeFrequency:  'weekly',
      priority:         0.7,
    },
    {
      url:              `${BASE_URL}/dashboard/publish`,
      lastModified:     new Date(),
      changeFrequency:  'weekly',
      priority:         0.6,
    },
  ]
}

// lib/api.ts — typed client for the FastAPI backend

const BACKEND = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, '')

async function call<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = typeof err?.detail === 'object' ? (err.detail.message || JSON.stringify(err.detail)) : err?.detail
    throw new Error(msg || `API error ${res.status}`)
  }
  return res.json()
}

// ── Trending feed ─────────────────────────────────────────────

export async function getTrendingIdeas(niche = "all", limit = 20) {
  return call<{ ideas: any[]; source: string; count: number }>(
    `/ideas/trending?niche=${niche}&limit=${limit}`
  )
}

// ── Idea Studio ───────────────────────────────────────────────

export interface IdeaGenerateRequest {
  user_id: string
  prompt: string
  niche: string
  platforms: string[]
  num_ideas?: number
}

export interface HookVariant {
  text: string
  style: string
  score: number
}

export interface IdeaVariant {
  title: string
  angle: string
  description: string
  hooks: HookVariant[]
  recommended_format: string
  estimated_minutes: number
  difficulty: string
  niche?: string
}

export async function generateIdeas(req: IdeaGenerateRequest) {
  return call<{ ideas: IdeaVariant[] }>("/ideas/generate", {
    method: "POST",
    body: JSON.stringify(req),
  })
}

// ── Script ────────────────────────────────────────────────────

export interface ScriptSection {
  section: string
  content: string
  tips: string
}

export async function generateScript(req: {
  title: string
  description: string
  hook: string
  platform: string
  niche: string
  duration_minutes?: number
}) {
  return call<{ sections: ScriptSection[]; total_words: number; estimated_duration_seconds: number }>(
    "/studio/script",
    { method: "POST", body: JSON.stringify(req) }
  )
}

// ── Shot list ─────────────────────────────────────────────────

export async function generateShotList(req: {
  title: string
  script_sections: ScriptSection[]
  format: string
  platform: string
}) {
  return call<{
    shots: Array<{ order: number; shot_type: string; description: string; duration_seconds: number; tips: string }>
    broll_suggestions: Array<{ keyword: string; pexels_url: string }>
    total_duration_seconds: number
  }>("/studio/shot-list", { method: "POST", body: JSON.stringify(req) })
}

// ── Captions ──────────────────────────────────────────────────

export async function generateCaptions(req: {
  title: string
  description: string
  platform: string
  niche: string
  hook?: string
}) {
  return call<{
    variants: Array<{ style: string; caption: string; char_count: number }>
    hashtags: { big: string[]; niche: string[]; micro: string[] }
    best_posting_time: string
  }>("/studio/captions", { method: "POST", body: JSON.stringify(req) })
}

// ── Competitors ───────────────────────────────────────────────

export async function getCompetitorExamples(query: string, max = 3) {
  return call<{
    results: Array<{ title: string; channel: string; thumbnail: string; url: string; views: number }>
  }>(`/studio/competitors?query=${encodeURIComponent(query)}&max_results=${max}`)
}

// ── Trending Audio ─────────────────────────────────────────────

export interface TrendingTrack {
  id: string
  title: string
  artist: string
  genre: string
  artwork: string
  preview_url?: string | null
  apple_url?: string
  deezer_url?: string
  source: 'apple_india' | 'deezer_global' | 'itunes_curated'
  rank: number
  hot: boolean
}

export async function getTrendingAudio(limit = 30, refresh = false) {
  return call<{ tracks: TrendingTrack[]; source: 'cache' | 'live'; count: number }>(
    `/studio/trending-audio?limit=${limit}&refresh=${refresh}`
  )
}

// ── Creator Sprint ─────────────────────────────────────────────

export interface SprintIdea {
  day: number
  title: string
  hook: string
  format: string
  difficulty: string
  angle: string
}

export interface SprintData {
  id: string
  user_id: string
  niche: string
  status: 'active' | 'completed' | 'cancelled'
  start_date: string
  end_date: string
  ideas: SprintIdea[]
  email_notifications: boolean
  streak: number
  days_completed: number
  current_day: number
  days_remaining: number
  completion_pct: number
  completed_days: Record<string, { completed_at: string; project_id?: string }>
}

export async function enrollSprint(req: {
  user_id: string; niche: string; email: string; name: string; email_notifications: boolean
}) {
  return call<{ sprint_id: string; start_date: string; end_date: string; ideas_count: number; message: string }>(
    '/sprint/enroll', { method: 'POST', body: JSON.stringify(req) }
  )
}

export async function getMySprint(userId: string) {
  return call<{ sprint: SprintData | null }>(`/sprint/me/${userId}`)
}

export async function completeSprintDay(req: {
  user_id: string; sprint_id: string; day_number: number; project_id?: string
}) {
  return call<{ status: string; day: number; total_completed: number }>(
    '/sprint/complete-day', { method: 'POST', body: JSON.stringify(req) }
  )
}

export async function cancelSprint(userId: string) {
  return call<{ status: string }>(`/sprint/cancel/${userId}`, { method: 'DELETE' })
}



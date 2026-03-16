// lib/api.ts — typed client for the FastAPI backend

const BACKEND = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, '')

async function call<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.detail ?? `API error ${res.status}`)
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

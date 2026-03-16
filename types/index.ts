// ============================================================
// Creator OS — Core Types
// ============================================================

export type Plan = 'free' | 'creator' | 'pro' | 'agency'
export type Niche = 'finance' | 'fitness' | 'tech' | 'lifestyle' | 'food' | 'travel' | 'education' | 'gaming' | 'beauty' | 'other'
export type Platform = 'instagram' | 'youtube' | 'tiktok' | 'twitter' | 'linkedin'
export type ContentFormat = 'reel' | 'short' | 'carousel' | 'long_form' | 'thread'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type ProjectStatus = 'planning' | 'scripting' | 'recording' | 'editing' | 'publishing' | 'published'

export interface MonetisationGoal {
  platform: Platform
  target_followers: number
  current_followers: number
}

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  niche: Niche | null
  sub_niche: string | null
  platforms: Platform[]
  content_formats: ContentFormat[]
  monetisation_goal: MonetisationGoal | null
  plan: Plan
  stripe_customer_id: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Idea {
  id: string
  source: 'trending' | 'user_generated' | 'ai_suggested'
  created_by: string | null
  title: string
  description: string | null
  hook_preview: string | null
  niche: Niche
  sub_niche: string | null
  platforms: Platform[]
  recommended_format: ContentFormat | null
  difficulty: Difficulty
  estimated_minutes: number
  viral_score: number
  trending_reason: string | null
  similar_views_avg: number | null
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export interface HookVariant {
  text: string
  style: 'question' | 'shock_stat' | 'story' | 'bold_claim'
  score: number
}

export interface ShotListItem {
  order: number
  description: string
  type: 'talking_head' | 'broll' | 'screen_record' | 'text_slide' | 'product_shot'
  duration_sec: number
}

export interface ScriptOutline {
  hook: string
  context: string
  main_points: string[]
  cta: string
}

export interface Project {
  id: string
  user_id: string
  idea_id: string | null
  title: string
  status: ProjectStatus
  niche: Niche | null
  platform: Platform | null
  format: ContentFormat | null
  hook_variants: HookVariant[]
  script_outline: ScriptOutline | null
  shot_list: ShotListItem[]
  broll_suggestions: Array<{ keyword: string; url: string; thumbnail: string }>
  thumbnail_brief: { text: string; color_palette: string[]; style_notes: string } | null
  competitor_examples: Array<{ title: string; url: string; views: number; thumbnail: string }>
  created_at: string
  updated_at: string
}

// ============================================================
// UI-specific types
// ============================================================

export interface FilterState {
  niche: Niche | 'all'
  platform: Platform | 'all'
  format: ContentFormat | 'all'
  difficulty: Difficulty | 'all'
}

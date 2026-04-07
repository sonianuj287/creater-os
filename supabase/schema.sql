-- ============================================================
-- Creator OS — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  -- Niche & platform prefs (set during onboarding)
  niche text,                        -- 'finance' | 'fitness' | 'tech' | 'lifestyle' | 'food' | 'travel' | 'education' | 'other'
  sub_niche text,                    -- More specific e.g. 'crypto' under 'finance'
  platforms text[] default '{}',    -- ['youtube','tiktok','twitter','linkedin']
  content_formats text[] default '{}', -- ['reels','shorts','carousels','long_form','threads']
  -- Monetisation goals
  monetisation_goal jsonb default '{}', -- { platform:  target_followers: 10000, current_followers: 3400 }
  -- Plan
  plan text default 'free',          -- 'free' | 'creator' | 'pro' | 'agency'
  stripe_customer_id text,
  stripe_subscription_id text,
  -- Timestamps
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- IDEAS (trending feed + user-generated)
-- ============================================================
create table public.ideas (
  id uuid default uuid_generate_v4() primary key,
  -- Source
  source text default 'trending',    -- 'trending' | 'user_generated' | 'ai_suggested'
  created_by uuid references public.profiles(id) on delete set null,
  -- Content
  title text not null,
  description text,
  hook_preview text,                 -- First hook variant preview for card
  niche text not null,
  sub_niche text,
  -- Targeting
  platforms text[] default '{}',
  recommended_format text,           -- 'reel' | 'short' | 'carousel' | 'long_form' | 'thread'
  difficulty text default 'medium',  -- 'easy' | 'medium' | 'hard'
  estimated_minutes integer default 60,
  -- Scoring
  viral_score integer default 0,     -- 0-100
  trending_reason text,              -- "3.2M views in 48h on this topic"
  similar_views_avg integer,         -- avg views of similar content
  -- Status
  is_active boolean default true,
  expires_at timestamptz,            -- Trending ideas expire after 48h
  created_at timestamptz default now()
);

-- ============================================================
-- PROJECTS (one content piece in progress)
-- ============================================================
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  idea_id uuid references public.ideas(id) on delete set null,
  -- Meta
  title text not null,
  status text default 'planning',    -- 'planning' | 'scripting' | 'recording' | 'editing' | 'publishing' | 'published'
  niche text,
  platform text,
  format text,
  -- AI Outputs (stored as JSONB for flexibility)
  hook_variants jsonb default '[]',       -- [{text, style, score}]
  script_outline jsonb default '{}',      -- {hook, context, main_points, cta}
  shot_list jsonb default '[]',           -- [{order, description, type, duration_sec}]
  broll_suggestions jsonb default '[]',   -- [{keyword, url, thumbnail}]
  thumbnail_brief jsonb default '{}',     -- {text, color_palette, style_notes}
  competitor_examples jsonb default '[]', -- [{title, url, views, thumbnail}]
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- GENERATED OUTPUTS (clips, carousels, etc.)
-- ============================================================
create table public.generated_outputs (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  -- Type
  output_type text not null,         -- 'clip' | 'carousel' | 'thumbnail' | 'newsletter' | 'thread' | 'caption_set'
  format text,                       -- '9:16' | '1:1' | '16:9'
  platform text,
  -- Storage
  file_url text,                     -- S3 URL
  thumbnail_url text,
  file_size_bytes integer,
  duration_seconds integer,          -- For video outputs
  -- Content
  content jsonb default '{}',        -- Text content (captions, thread, newsletter)
  metadata jsonb default '{}',       -- Processing metadata
  -- Processing status
  status text default 'pending',     -- 'pending' | 'processing' | 'completed' | 'failed'
  error_message text,
  -- Watermark
  is_watermarked boolean default true,
  -- Timestamps
  created_at timestamptz default now()
);

-- ============================================================
-- SCHEDULED POSTS
-- ============================================================
create table public.scheduled_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade,
  output_id uuid references public.generated_outputs(id) on delete set null,
  -- Platform
  platform text not null,
  platform_account_id text,          -- Their connected account ID
  -- Content
  caption text,
  hashtags text[],
  -- Scheduling
  scheduled_for timestamptz not null,
  status text default 'scheduled',   -- 'scheduled' | 'posted' | 'failed' | 'cancelled'
  platform_post_id text,             -- ID returned by platform after posting
  error_message text,
  -- Timestamps
  created_at timestamptz default now(),
  posted_at timestamptz
);

-- ============================================================
-- ANALYTICS SNAPSHOTS
-- ============================================================
create table public.analytics_snapshots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.scheduled_posts(id) on delete cascade,
  platform text not null,
  -- Metrics
  views integer default 0,
  likes integer default 0,
  saves integer default 0,
  shares integer default 0,
  comments integer default 0,
  profile_visits integer default 0,
  followers_gained integer default 0,
  -- Follower totals (snapshot)
  total_followers integer,
  -- Snapshotted at
  snapshot_at timestamptz default now()
);

-- ============================================================
-- CONNECTED ACCOUNTS (OAuth tokens)
-- ============================================================
create table public.connected_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null,            -- 'youtube' | 'tiktok' | 'twitter' | 'linkedin'
  platform_user_id text,
  platform_username text,
  platform_display_name text,
  access_token text,                 -- Encrypted in production
  refresh_token text,
  token_expires_at timestamptz,
  follower_count integer default 0,
  is_active boolean default true,
  connected_at timestamptz default now(),
  unique(user_id, platform)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.projects enable row level security;
alter table public.generated_outputs enable row level security;
alter table public.scheduled_posts enable row level security;
alter table public.analytics_snapshots enable row level security;
alter table public.connected_accounts enable row level security;

-- Profiles: users see only their own
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Ideas: everyone can read active ideas
create policy "Anyone can read active ideas" on public.ideas for select using (is_active = true);
create policy "Users can create ideas" on public.ideas for insert with check (auth.uid() = created_by);

-- Projects: own only
create policy "Users manage own projects" on public.projects for all using (auth.uid() = user_id);

-- Outputs: own only
create policy "Users manage own outputs" on public.generated_outputs for all using (auth.uid() = user_id);

-- Posts: own only
create policy "Users manage own posts" on public.scheduled_posts for all using (auth.uid() = user_id);

-- Analytics: own only
create policy "Users view own analytics" on public.analytics_snapshots for all using (auth.uid() = user_id);

-- Connected accounts: own only
create policy "Users manage own accounts" on public.connected_accounts for all using (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TRIGGER: updated_at auto-update
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();
create trigger set_projects_updated_at before update on public.projects
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- SEED: Sample trending ideas
-- ============================================================
insert into public.ideas (title, description, hook_preview, niche, platforms, recommended_format, difficulty, estimated_minutes, viral_score, trending_reason, similar_views_avg) values
('How I saved ₹50,000 in 6 months on a ₹30k salary', 'Personal finance breakdown showing exact budget splits, zero-based budgeting, and small wins that compound.', '"Everyone says save money. Nobody shows you HOW on a low salary. Here''s my exact breakdown..."', 'finance', ARRAY['youtube'], 'reel', 'easy', 30, 91, '4.2M views on similar content this week', 890000),
('5 AI tools replacing my ₹20k/month freelancer job', 'Practical demo of 5 tools that automate design, writing, video editing, and customer support tasks.', '"I paid someone ₹20,000 a month for this. Now I use these 5 free tools instead..."', 'tech', ARRAY['youtube'], 'short', 'medium', 45, 87, 'AI tools niche up 340% search volume this month', 650000),
('What no one tells you about starting a YouTube channel', 'The real numbers: views, revenue, time invested vs returns. Myth-busting format.', '"I made ₹0 for 8 months. Here''s what actually changes everything in month 9..."', 'education', ARRAY['youtube'], 'long_form', 'medium', 90, 84, 'Creator economy content surging after YT monetisation update', 1200000),
('Morning routine that changed my productivity completely', 'A realistic 45-min morning routine with science behind each habit. No 4am wakeups.', '"I''m not a morning person. This routine works even if you sleep until 8..."', 'lifestyle', ARRAY['tiktok'], 'reel', 'easy', 25, 79, 'Productivity niche consistently top-5 saves category', 420000),
('Gym workout for people who hate the gym', 'Minimal equipment, 30-min sessions, real body transformation. Anti-gym-bro energy.', '"Been going to the gym for 2 years with zero results. Then I changed one thing..."', 'fitness', ARRAY['youtube','tiktok'], 'reel', 'easy', 35, 88, '2.1M saves on similar anti-bro fitness content this month', 750000),
('How to cook restaurant-quality biryani at home', 'Step-by-step with common mistakes shown and fixed. Satisfying B-roll of final dish.', '"Every biryani recipe lies to you about one step. Here''s what they skip..."', 'food', ARRAY['youtube'], 'reel', 'medium', 40, 82, 'Food content highest save rate of any niche on Instagram', 980000);

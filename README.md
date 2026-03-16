# Creator OS — Phase 1

A full-stack Next.js app for content creators. From trending idea to published post.

## Phase 1 delivers
- Auth (Google OAuth + magic link email)
- 3-step onboarding (niche → platforms → monetisation goal)
- Homepage trending feed with filtering
- Idea detail page
- Monetisation progress bar
- Full Supabase schema (ready for Phase 2)

---

## Quick start

### 1. Clone and install
```bash
git clone <your-repo>
cd creator-os
npm install
```

### 2. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase/schema.sql`
3. Go to **Authentication → Providers** → enable **Google**
4. Add your Google OAuth credentials (from Google Cloud Console)
5. Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 3. Environment variables
```bash
cp .env.example .env.local
```
Fill in your Supabase URL and anon key from:
`supabase.com → your project → Settings → API`

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add env vars in Vercel dashboard or:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Project structure

```
creator-os/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx          ← Login page
│   │   ├── onboarding/page.tsx     ← 3-step onboarding
│   │   └── callback/route.ts       ← OAuth callback
│   ├── dashboard/
│   │   ├── layout.tsx              ← Sidebar layout
│   │   ├── page.tsx                ← Homepage feed
│   │   └── idea/[id]/page.tsx      ← Idea detail
│   ├── layout.tsx                  ← Root layout
│   └── globals.css
├── components/
│   ├── feed/
│   │   ├── IdeaCard.tsx            ← Main card component
│   │   ├── MonetisationBar.tsx     ← Progress bar hook
│   │   └── NicheFilter.tsx         ← Filter controls
│   └── layout/
│       └── Sidebar.tsx             ← Nav sidebar
├── lib/
│   ├── supabase.ts                 ← Browser client
│   ├── supabase-server.ts          ← Server client + middleware
│   ├── utils.ts                    ← Helpers + constants
│   └── mock-data.ts                ← Dev mock data
├── types/index.ts                  ← All TypeScript types
├── supabase/schema.sql             ← Full DB schema
└── middleware.ts                   ← Auth route protection
```

---

## What's next — Phase 2 (Weeks 4–7)

Phase 2 adds the AI layer:
- FastAPI Python backend (Railway)
- OpenAI GPT-4o for idea/hook/script generation
- YouTube API for live trending data
- Whisper for audio transcription
- Stripe subscription billing

See the development plan for the full roadmap.

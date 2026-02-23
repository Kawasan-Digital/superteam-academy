# Architecture — Solana Academy LMS

## System Overview

Solana Academy is a production-ready learning management system built for Solana developer education. The platform combines interactive coding challenges, gamified progression, and on-chain credentials into a unified learning experience.

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Pages   │ │Components│ │  Hooks   │ │  Services │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘  │
│       └─────────────┴────────────┴─────────────┘        │
│                          │                               │
│       ┌──────────────────┼──────────────────┐           │
│       ▼                  ▼                  ▼           │
│  ┌─────────┐     ┌────────────┐     ┌────────────┐     │
│  │Supabase │     │ Sanity CMS │     │  Solana    │     │
│  │ (Auth,  │     │ (Content)  │     │ (Wallet,  │     │
│  │  DB)    │     │            │     │  On-Chain) │     │
│  └─────────┘     └────────────┘     └────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite + TypeScript (strict) |
| Styling | Tailwind CSS + CSS Variables (HSL design tokens) |
| UI Components | shadcn/ui + Radix Primitives |
| State Management | React Query (server state) + React Context (app state) |
| Routing | React Router v6 (lazy-loaded routes) |
| Backend | Supabase (Auth, PostgreSQL, Edge Functions) |
| CMS | Sanity (headless, with local mock fallback) |
| Blockchain | Solana Wallet Adapter + @solana/web3.js |
| Code Editor | Monaco Editor (lazy-loaded) |
| Animations | Framer Motion |
| i18n | Custom context-based solution (EN, PT-BR, ES) |
| Analytics | GA4 + PostHog + Sentry |

## Directory Structure

```
src/
├── components/           # UI components (domain-based)
│   ├── auth/             # Authentication (ProtectedRoute, AdminRoute)
│   ├── course/           # Course-related (CourseCard)
│   ├── editor/           # Code editor (CodeEditor)
│   ├── gamification/     # XP, levels, streaks, achievements
│   ├── layout/           # App shell (Navbar, Footer, MainLayout)
│   ├── ui/               # shadcn/ui primitives
│   └── wallet/           # Solana wallet integration
├── cms/                  # Sanity CMS client, queries, schemas
├── hooks/                # Custom React hooks
├── i18n/                 # Internationalization (translations + context)
├── integrations/         # Auto-generated Supabase client & types
├── pages/                # Route-level page components
├── services/             # Business logic & data layer
└── test/                 # Test setup and utilities
```

## Component Architecture

### Page Components (`src/pages/`)

Each page is a top-level route component wrapped in `MainLayout`:

| Page | Route | Description |
|------|-------|-------------|
| `Index` | `/` | Landing page with hero, features, social proof |
| `Courses` | `/courses` | Filterable course catalog |
| `CourseDetail` | `/courses/:slug` | Course overview + enrollment |
| `Lesson` | `/courses/:slug/lessons/:lessonId` | Split-pane lesson viewer |
| `Dashboard` | `/dashboard` | User progress hub (protected) |
| `Profile` | `/profile` | User profile + credentials (protected) |
| `Leaderboard` | `/leaderboard` | XP rankings (clickable → public profile) |
| `Settings` | `/settings` | User preferences (protected) |
| `Certificate` | `/certificates/:id` | Credential viewer + sharing |
| `Community` | `/community` | Discussion forum with threads, voting, replies |
| `PublicProfile` | `/profile/:username` | Public user stats, skills, achievements, credentials |
| `AdminDashboard` | `/admin` | Course management, user analytics (RBAC-protected) |
| `Onboarding` | `/onboarding` | Skill assessment quiz + learning path recommendation |
| `Auth` | `/auth` | Login/signup with email + Google OAuth |
| `ResetPassword` | `/reset-password` | Secure password reset via email |

### Layout System

```
MainLayout
├── Navbar (nav links, language/theme switcher, wallet connect)
├── {children}  ← Page content
└── Footer (links, social, newsletter)
```

### Domain Components

**Gamification** (`src/components/gamification/`):
- `XPProgressBar` — Visual XP bar with level thresholds
- `LevelBadge` — Current level display
- `StreakCalendar` — Daily activity heatmap
- `AchievementGrid` — Badge showcase
- `SuccessCelebration` — Particle effects on challenge completion

**Wallet** (`src/components/wallet/`):
- `SolanaWalletProvider` — Wallet adapter context wrapper
- `WalletConnectModal` — Multi-wallet connection dialog
- `XPBalanceDisplay` — On-chain XP token balance
- `NFTCredentialGallery` — Credential NFT grid

**Editor** (`src/components/editor/`):
- `CodeEditor` — Monaco Editor with Rust/TS/JSON support, test runner

## Data Flow

### Authentication Flow

```
User → Auth Page → Supabase Auth (Email/Google)
                         │
                         ▼
              Trigger: handle_new_user()
                         │
                         ▼
              Insert into profiles table
                         │
                         ▼
              useAuth() hook provides session + profile
```

### Content Flow

```
Sanity CMS (if configured)
       │
       ▼
  useCMSContent() ──fallback──▶ Mock Data (services/mock-data.ts)
       │
       ▼
  Page Components render content
```

### Learning Progress Flow

```
User Action (complete lesson / challenge)
       │
       ▼
  LearningProgressService (interface)
       │
       ├── MockLearningProgress (current: localStorage)
       │
       └── SolanaLearningProgress (future: on-chain PDAs)
              │
              ├── Enrollment PDA (per user × course)
              ├── Progress bitmap (256 lessons)
              ├── XP mint (Token-2022, soulbound)
              └── Credential NFT (Metaplex Core)
```

## Service Abstraction Layer

The `LearningProgressService` interface (`src/services/types.ts`) abstracts all progress and gamification logic:

```typescript
interface LearningProgressService {
  getProgress(userId, courseId): Promise<Progress | null>
  getAllProgress(userId): Promise<Progress[]>
  completeLesson(userId, courseId, lessonIndex): Promise<void>
  enrollCourse(userId, courseId): Promise<void>
  getXP(userId): Promise<number>
  getLevel(userId): Promise<number>
  getStreak(userId): Promise<StreakData>
  getLeaderboard(timeframe): Promise<LeaderboardEntry[]>
  getCredentials(userId): Promise<Credential[]>
  getAchievements(userId): Promise<Achievement[]>
  claimAchievement(userId, achievementId): Promise<void>
  getProfile(userId): Promise<UserProfile>
  updateProfile(userId, updates): Promise<void>
}
```

**Current implementation**: `MockLearningProgress` uses localStorage + mock data.
**Future implementation**: `SolanaLearningProgress` will call on-chain program instructions.

The `ServiceProvider` context makes the active implementation available app-wide via `useLearningService()`.

## On-Chain Integration Points

### What's Implemented (Devnet-ready)

| Feature | Status | Details |
|---------|--------|---------|
| Wallet authentication | ✅ Live | Multi-wallet adapter (Phantom, Solflare, etc.) |
| XP balance display | ✅ Stubbed | Reads from service interface; ready for Token-2022 |
| Credential display | ✅ Stubbed | Mock data; ready for Metaplex Core NFT reads |
| Leaderboard | ✅ Stubbed | Mock data; ready for Helius DAS API indexing |
| Course enrollment | ✅ Stubbed | Local tracking; ready for on-chain PDA creation |

### What Needs Backend Signing (Stubbed)

| Feature | On-Chain Account | Notes |
|---------|-----------------|-------|
| Lesson completion | Progress PDA (bitmap) | Backend signs tx to prevent cheating |
| Course finalization | Enrollment PDA → close | Reclaims rent, issues credential |
| Credential issuance | Metaplex Core NFT | Soulbound, evolving per track |
| Achievement claiming | AchievementReceipt PDA | Soulbound NFT per achievement |
| XP minting | Token-2022 mint | Soulbound (NonTransferable) |

### PDA Derivation (from INTEGRATION.md)

```
Course PDA:        [b"course", course_id]
Enrollment PDA:    [b"enrollment", course_pda, learner]
Progress PDA:      [b"progress", enrollment_pda]
Achievement PDA:   [b"achievement_type", achievement_id]
Receipt PDA:       [b"achievement_receipt", achievement_pda, learner]
```

## Database Schema

### Supabase Tables

**profiles** — User metadata synced with auth:

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | References auth.users |
| `display_name` | text | User's display name |
| `username` | text | Unique handle |
| `bio` | text | Profile bio |
| `xp` | integer | Cached XP balance |
| `level` | integer | Derived: floor(sqrt(xp/100)) |
| `streak` | integer | Current streak days |
| `wallet_address` | text | Connected Solana wallet (**hidden from public view**) |
| `wallet_connected` | boolean | Wallet link status |
| `avatar_url` | text | Profile picture URL |
| `twitter_username` | text | Social link |
| `github_username` | text | Social link |
| `profile_public` | boolean | Public visibility toggle |

**user_roles** — Role-based access control:

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | References auth.users (CASCADE delete) |
| `role` | app_role | Enum: `admin`, `moderator`, `user` |

**public_profiles** — Secure view (excludes `wallet_address`):
- Used for public profile pages to prevent wallet address harvesting
- `SECURITY INVOKER` ensures RLS is respected

**RLS Policies**:
- profiles: Users can read/update own profile. Public profiles visible to all (via secure view)
- user_roles: Users can read own roles. Admins can manage all roles via `has_role()` function

**Security Definer Functions**:
- `has_role(user_id, role)` — Checks user role without RLS recursion
- `handle_new_user()` — Auto-creates profile on signup
- `update_updated_at_column()` — Timestamp maintenance

## Analytics Architecture

```
User Event → analytics.track(event, properties)
                  │
                  ├── GA4 (gtag) — Page views, custom events
                  ├── PostHog — Session replay, heatmaps, feature flags
                  ├── Clarity — Heatmaps, session recordings, user insights
                  ├── Hotjar — Heatmaps, recordings, feedback (alternative)
                  └── Sentry — Error monitoring, performance tracing
```

Custom events tracked: `lesson_completed`, `course_enrolled`, `challenge_passed`, `wallet_connected`, `achievement_unlocked`.

### Heatmap Configuration

Configure one or both heatmap providers via environment variables:
- `VITE_CLARITY_ID` — Microsoft Clarity (free, recommended)
- `VITE_HOTJAR_ID` — Hotjar (freemium, richer feedback tools)

Both integrate automatically via `analytics.init()` — no code changes needed.

## Authentication Limitations

### GitHub OAuth

GitHub OAuth is **not supported** by the managed authentication provider (Lovable Cloud). The bounty requirement for GitHub sign-in cannot be fulfilled in the current deployment environment.

**Workaround for self-hosted deployments:**
1. Deploy with your own Supabase project
2. Configure GitHub OAuth in Supabase Auth settings
3. Replace `lovable.auth.signInWithOAuth` calls with `supabase.auth.signInWithOAuth`
4. Add GitHub to the Account Linking section in Settings

The codebase is designed to make this swap trivial — all OAuth calls are centralized in `Auth.tsx` and `Settings.tsx`.

## Course Enrollment — On-Chain Flow

```
User clicks "Enroll" on CourseDetail
        │
        ├── Wallet connected?
        │     ├── YES → Build Memo transaction with enrollment data
        │     │         → User signs in wallet (Phantom/Solflare)
        │     │         → Transaction confirmed on Devnet
        │     │         → Signature stored, viewable on Explorer
        │     │         → Local progress also persisted
        │     └── NO  → Off-chain enrollment via LearningProgressService
        │
        └── Not signed in? → Prompt to sign in
```

**Current implementation**: Uses Solana Memo Program to record enrollment intent on-chain. The learner signs directly — no backend needed.

**Future**: Replace Memo instruction with Anchor program's `enroll` instruction that creates an Enrollment PDA.

## Performance Optimizations

- **Code splitting**: All non-landing routes lazy-loaded via `React.lazy`
- **Heavy libraries**: Monaco Editor and Sanity client loaded on-demand
- **Image optimization**: Lazy loading with `loading="lazy"`
- **Bundle targets**: Lighthouse Performance 90+, LCP < 2.5s

## CMS Architecture

Sanity CMS manages course content with automatic fallback:

```
useCourses() / useLessons()
       │
       ├── Sanity configured? → Fetch from Sanity API
       │
       └── Not configured? → Return mock data (zero-config dev)
```

Schemas: `course`, `module`, `lesson`, `instructor`, `learningPath`.

See [CMS_GUIDE.md](./CMS_GUIDE.md) for content management details.

## i18n Architecture

All UI strings externalized in `src/i18n/translations.ts` with nested key structure:

```typescript
const translations = {
  en: { nav: { courses: "Courses", ... }, ... },
  pt: { nav: { courses: "Cursos", ... }, ... },
  es: { nav: { courses: "Cursos", ... }, ... },
};
```

`useTranslation()` hook provides `t()` function and `language` state. Language switcher in navbar persists selection.

## Security

### Access Control
- **RBAC**: `user_roles` table with `has_role()` security definer function
- **AdminRoute**: Server-side role validation (not just client-side auth check)
- **ProtectedRoute**: JWT-based auth check for authenticated-only pages

### Data Protection
- All database access gated by Row Level Security (RLS)
- `public_profiles` view excludes `wallet_address` to prevent harvesting
- Auth tokens managed by Supabase (JWT)
- No private keys stored in frontend code

### Edge Function Security
- AI assistant edge function validates JWT before processing
- Server-side secrets (LOVABLE_API_KEY) never exposed to client
- CORS headers configured for web app access

### Wallet Security
- Wallet signatures verified client-side via Solana Wallet Adapter
- Wallet addresses stored privately, not exposed in public queries

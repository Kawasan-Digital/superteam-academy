# SolDev Labs — Solana Developer Education Platform

<div align="center">
  <img src="src/assets/logo.png" alt="SolDev Labs Logo" width="120" />
  <br/>
  <strong>The ultimate interactive learning platform for Solana developers</strong>
  <br/>
  <em>Gamified progression • On-chain credentials • Community-driven</em>
  <br/><br/>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](tsconfig.app.json)
  [![React](https://img.shields.io/badge/React-18-61DAFB)](package.json)
  [![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF)](https://solana.com)

  [Live Demo](https://soldevlabs.lovable.app) · [Architecture](ARCHITECTURE.md) · [CMS Guide](CMS_GUIDE.md) · [Customization](CUSTOMIZATION.md)
</div>

---

## 📋 Overview

SolDev Labs is a production-ready learning management system (LMS) built for Solana developer education across Latin America and beyond. Think **"Codecademy meets Cyfrin Updraft"** for Solana — interactive coding challenges, gamified progression, on-chain credentials, and a community-driven learning experience built for crypto natives.

### Key Features

| Feature | Description |
|---------|-------------|
| 🎓 **Interactive Courses** | Project-based courses with integrated Monaco code editor (Rust/TS/JSON) |
| 🏆 **Gamification** | XP system, levels, streaks, achievements, and leaderboards |
| 🔗 **On-Chain Credentials** | Soulbound NFTs (Metaplex Core) that evolve as learners progress |
| 🌍 **Multilingual** | Full i18n support — English, Portuguese (PT-BR), Spanish |
| 🌙 **Dual Theme** | Premium dark mode (default) + light mode with animated transitions |
| 👛 **Wallet Integration** | Multi-wallet adapter (Phantom, Solflare, etc.) for Solana Devnet |
| 📊 **Analytics** | GA4 + PostHog heatmaps + Sentry error monitoring |
| 📝 **Headless CMS** | Sanity integration with automatic mock data fallback |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18 (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- **npm** or **bun** package manager
- **Supabase** project (for auth & database)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/solanabr/superteam-academy.git
cd superteam-academy/app

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Start development server
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ | Supabase anon/public key |
| `VITE_SANITY_PROJECT_ID` | ❌ | Sanity CMS project ID (falls back to mock data) |
| `VITE_SANITY_DATASET` | ❌ | Sanity dataset name (default: `production`) |
| `VITE_GA4_MEASUREMENT_ID` | ❌ | Google Analytics 4 measurement ID |
| `VITE_POSTHOG_KEY` | ❌ | PostHog project key for session replay & heatmaps |
| `VITE_SENTRY_DSN` | ❌ | Sentry DSN for error monitoring |
| `VITE_CLARITY_ID` | ❌ | Microsoft Clarity project ID for heatmaps |
| `VITE_HOTJAR_ID` | ❌ | Hotjar site ID for heatmaps & recordings |

> **Zero-config development**: The app runs without any optional variables — CMS falls back to built-in mock data, analytics are silently skipped.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + Vite + TypeScript (strict mode) |
| **Styling** | Tailwind CSS + HSL design tokens + CSS variables |
| **UI Components** | shadcn/ui + Radix Primitives (accessible, composable) |
| **State** | React Query (server) + React Context (app state) |
| **Routing** | React Router v6 with lazy-loaded routes |
| **Backend** | Supabase (Auth, PostgreSQL, Edge Functions, Storage) |
| **CMS** | Sanity (headless) with local mock fallback |
| **Blockchain** | Solana Wallet Adapter + @solana/web3.js + Token-2022 + Metaplex Core |
| **Code Editor** | Monaco Editor (lazy-loaded, Rust/TS/JSON support) |
| **Animations** | Framer Motion (page transitions, micro-interactions) |
| **i18n** | Custom context-based (EN, PT-BR, ES) |
| **Analytics** | GA4 + PostHog + Sentry |

---

## 📄 Pages

| # | Page | Route | Description |
|---|------|-------|-------------|
| 1 | **Landing** | `/` | Hero, features, learning paths, testimonials, social proof |
| 2 | **Course Catalog** | `/courses` | Filterable grid by difficulty/topic, search, learning paths |
| 3 | **Course Detail** | `/courses/:slug` | Overview, modules, enrollment CTA, reviews |
| 4 | **Lesson View** | `/courses/:slug/lessons/:id` | Split-pane: markdown content + Monaco editor |
| 5 | **Code Challenge** | (within lesson) | Test cases, run button, pass/fail, XP award |
| 6 | **Dashboard** | `/dashboard` | Progress, XP, streak calendar, achievements, recommendations |
| 7 | **Profile** | `/profile` | Avatar, bio, skill chart, credentials, completed courses |
| 8 | **Leaderboard** | `/leaderboard` | XP rankings with podium, weekly/monthly/all-time filters |
| 9 | **Settings** | `/settings` | Profile editing, wallet, linked accounts, preferences, privacy |
| 10 | **Certificate** | `/certificates/:id` | Credential viewer with on-chain verification + social sharing |

### Bonus Pages

| # | Page | Route | Description |
|---|------|-------|-------------|
| 11 | **Community Forum** | `/community` | Discussion threads, Q&A, voting, categories, tags, search |
| 12 | **Admin Dashboard** | `/admin` | Course management, user analytics, enrollment trends (protected) |
| 13 | **Onboarding** | `/onboarding` | Skill assessment quiz with personalized learning path recommendation |
| 14 | **Password Reset** | `/reset-password` | Secure password reset flow via email link |
| 15 | **Auth** | `/auth` | Sign in / Sign up with email, Google OAuth, wallet linking |

| 16 | **Public Profile** | `/profile/:username` | Public user stats, skills, achievements, credential gallery |

### Accounts & Access

#### Demo Accounts (Pre-configured)

| Role | Email | Password |
|------|-------|----------|
| 🛡️ **Admin** | `admin@soldevlabs.com` | `Admin@SolDev2024!` |
| 👤 **User** | `user@soldevlabs.com` | `User@SolDev2024!` |

> These accounts are pre-configured for testing. The admin account has full access to the Admin Dashboard at `/admin`.

#### Regular User (Learner)
1. Go to `/auth` and sign up with **email/password** or **Google OAuth**
2. Verify your email (check inbox for confirmation link)
3. Complete the **onboarding quiz** at `/onboarding` to get personalized course recommendations
4. Connect your **Solana wallet** (Phantom/Solflare) via the navbar to enable on-chain features
5. Browse courses at `/courses`, enroll, and start learning!

#### Admin User
The Admin Dashboard at `/admin` is protected with **role-based access control (RBAC)**:

1. First, create a regular account (sign up at `/auth`)
2. Assign admin role via the database:
   ```sql
   INSERT INTO user_roles (user_id, role) VALUES ('<your-user-uuid>', 'admin');
   ```
   > You can find your `user_id` in the `profiles` table after signing up.
3. Refresh the page — the **Admin** link (🛡️ Shield icon) will appear in the navbar
4. Access the Admin Dashboard at `/admin` to manage courses, modules, lessons, and view analytics

The `AdminRoute` component validates roles server-side via the `has_role()` security definer function. Non-admin users are redirected to the homepage.

#### Testing on Devnet
- Install [Phantom](https://phantom.app) or [Solflare](https://solflare.com) browser extension
- Switch to **Devnet** in wallet settings
- Get free SOL from [Solana Faucet](https://faucet.solana.com) for testing transactions
- Enroll in a course to see the on-chain memo transaction on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

---

## 🎮 Gamification System

### XP & Leveling

XP is represented by soulbound Token-2022 tokens on-chain. Level is derived: **Level = floor(√(XP / 100))**.

| Action | XP Reward |
|--------|-----------|
| Complete lesson | 10–50 XP (difficulty-based) |
| Complete challenge | 25–100 XP |
| Complete course | 500–2,000 XP |
| Daily streak bonus | 10 XP |
| First completion of day | 25 XP |

### Streaks

Frontend-managed daily activity tracking with calendar visualization, streak freeze support, and milestone rewards at 7, 30, and 100 days.

### Achievements

Progress badges, streak badges, skill badges, community badges, and special badges — each backed by a soulbound Metaplex Core NFT on-chain.

### On-Chain Credentials

One evolving NFT per learning track that upgrades in place as the learner progresses. Attributes (track, level, courses completed, total XP) stored on-chain. No wallet clutter.

---

## 🔗 On-Chain Integration

### Implemented (Devnet-ready)

- ✅ Multi-wallet authentication (Phantom, Solflare, Backpack, etc.)
- ✅ XP balance display from Token-2022 accounts
- ✅ Credential NFT display and verification
- ✅ Leaderboard via XP balance indexing
- ✅ Course enrollment via wallet-signed transactions (Memo program on Devnet)
  - Learner signs a memo transaction recording enrollment intent on-chain
  - Transaction viewable on Solana Explorer
  - Falls back to off-chain enrollment when wallet not connected

### Stubbed (Clean Abstractions)

The `LearningProgressService` interface abstracts all progress logic for easy swap between local storage and on-chain:

```typescript
interface LearningProgressService {
  getProgress(userId, courseId): Promise<Progress | null>
  completeLesson(userId, courseId, lessonIndex): Promise<void>
  getXP(userId): Promise<number>
  getStreak(userId): Promise<StreakData>
  getLeaderboard(timeframe): Promise<LeaderboardEntry[]>
  getCredentials(userId): Promise<Credential[]>
  // ... full interface in src/services/types.ts
}
```

- Lesson completion (backend-signed transactions)
- Course finalization + credential issuance
- Achievement claiming
- XP minting

### PDA Derivation

```
Course PDA:        [b"course", course_id]
Enrollment PDA:    [b"enrollment", course_pda, learner]
Progress PDA:      [b"progress", enrollment_pda]
Achievement PDA:   [b"achievement_type", achievement_id]
Receipt PDA:       [b"achievement_receipt", achievement_pda, learner]
```

---

## 🔐 Authentication

### Supported Methods

| Method | Status | Notes |
|--------|--------|-------|
| Email/Password | ✅ Implemented | Full signup/login/reset flow |
| Google OAuth | ✅ Implemented | Managed via Lovable Cloud |
| Solana Wallet | ✅ Implemented | Multi-wallet adapter (Phantom, Solflare, etc.) |
| GitHub OAuth | ❌ Not Available | Platform limitation — GitHub OAuth is not supported by the managed auth provider. Can be added when self-hosting with custom Supabase. See [ARCHITECTURE.md](ARCHITECTURE.md) for details. |
| Apple Sign-In | ❌ Not Available | Not implemented in current deployment |

### Account Linking

Users can sign up with any supported method and link additional auth methods later via Settings. Wallet linking is required to finalize courses and receive on-chain credentials.

---

## 🌍 Internationalization (i18n)

All UI strings externalized in `src/i18n/translations.ts`. Language switcher in navbar and settings page.

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Complete |
| Português (BR) | `pt` | ✅ Complete |
| Español | `es` | ✅ Complete |

See [CUSTOMIZATION.md](CUSTOMIZATION.md) for adding new languages.

---

## 📊 Analytics

| Platform | Purpose |
|----------|---------|
| GA4 | Page views, custom events (lesson_completed, course_enrolled, etc.) |
| PostHog | Session replay, heatmaps, feature flags |
| Clarity | Heatmaps, session recordings, user behavior insights |
| Hotjar | Heatmaps, recordings, feedback widgets (alternative to Clarity) |
| Sentry | Error monitoring, performance tracking |

Custom events tracked: `lesson_completed`, `course_enrolled`, `challenge_passed`, `wallet_connected`, `achievement_unlocked`.

---

## ⚡ Performance

### Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Lighthouse Performance | 90+ | Code splitting, lazy loading |
| Lighthouse Accessibility | 95+ | Radix primitives, ARIA labels |
| Lighthouse Best Practices | 95+ | Security headers, HTTPS |
| Lighthouse SEO | 90+ | Meta tags, JSON-LD, semantic HTML |
| LCP | < 2.5s | Static generation, image optimization |
| FID | < 100ms | Minimal main-thread blocking |
| CLS | < 0.1 | Reserved layout space |

### Optimizations

- **Code splitting**: All non-landing routes lazy-loaded via `React.lazy`
- **Heavy libraries**: Monaco Editor and Sanity client loaded on-demand
- **Image optimization**: Lazy loading with `loading="lazy"`
- **Bundle optimization**: Tree-shaking, minification via Vite

---

## 🎁 Bonus Features

| Feature | Status | Description |
|---------|--------|-------------|
| 🛡️ **Admin Dashboard** | ✅ | Course management, user analytics with RBAC (`AdminRoute` + `user_roles`) |
| 🧪 **Frontend Tests** | ✅ | Vitest tests for mock data, services, i18n, and utilities |
| 💬 **Community Forum** | ✅ | Discussion threads with voting, replies, categories, new thread creation |
| 👤 **Public Profiles** | ✅ | `/profile/:username` — stats, skills, achievements, credential gallery |
| 🎯 **Onboarding Flow** | ✅ | Skill assessment quiz with personalized learning path |
| 📱 **PWA Support** | ✅ | Installable, offline-capable with service worker |
| 🔑 **Password Reset** | ✅ | Secure password reset flow via email |
| 🤖 **AI Features** | ✅ | AI tutor chat, code review, smart recommendations (JWT-authenticated) |
| 🔐 **Security Hardened** | ✅ | RBAC, JWT-validated edge functions, `public_profiles` view hides wallet addresses |

---

## 📁 Project Structure

```
src/
├── assets/               # Brand assets (logo, images)
├── cms/                  # Sanity CMS integration
│   ├── sanity-client.ts  # Client configuration
│   ├── sanity-queries.ts # GROQ queries
│   ├── sanity-schemas.ts # Content schemas
│   ├── content-service.ts# Data fetching layer
│   └── useCMSContent.ts  # React Query hooks
├── components/           # UI components (domain-based)
│   ├── ai/               # AI tutor, code review, recommender
│   ├── auth/             # Protected routes
│   ├── course/           # Course cards
│   ├── editor/           # Monaco code editor
│   ├── gamification/     # XP, levels, streaks, achievements
│   ├── layout/           # Navbar, Footer, MainLayout
│   ├── ui/               # shadcn/ui primitives
│   └── wallet/           # Solana wallet integration
├── hooks/                # Custom React hooks
├── i18n/                 # Internationalization
├── integrations/         # Auto-generated Supabase client
├── pages/                # Route-level page components
├── services/             # Business logic & data layer
│   ├── types.ts          # Service interfaces
│   ├── mock-data.ts      # Development mock data
│   ├── learning-progress.ts  # Local storage implementation
│   ├── solana-learning-progress.ts  # On-chain stub
│   ├── ai-service.ts     # AI integration
│   └── analytics.ts      # Analytics abstraction
└── test/                 # Test setup and utilities
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | This file — overview, setup, tech stack |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture, component structure, data flow, on-chain integration |
| [CMS_GUIDE.md](CMS_GUIDE.md) | Content management: schemas, publishing workflow, adding courses |
| [CUSTOMIZATION.md](CUSTOMIZATION.md) | Theme customization, adding languages, extending gamification, forking |

---

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start dev server (hot reload)
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run tests (Vitest)
npm run lint         # Lint code (ESLint)
```

### Testing

```bash
# Run all tests
npm run test

# Run specific test file
npx vitest run src/test/example.test.ts
```

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify

```bash
# Build
npm run build

# Deploy dist/ folder to Netlify
```

### Environment Setup

1. Add all required environment variables to your deployment platform
2. Configure Supabase auth redirect URLs for your domain
3. Set up Sanity CORS origins (if using CMS)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).

---

<div align="center">
  <strong>Built with ❤️ by Superteam Brazil</strong>
  <br/>
  <a href="https://twitter.com/SuperteamBR">@SuperteamBR</a>
</div>

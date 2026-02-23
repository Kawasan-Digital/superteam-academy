# Customization Guide — Solana Academy LMS

This guide covers how to customize the platform's theme, add new languages, extend the gamification system, and fork the project for your own community.

---

## Theme Customization

### Design Token System

All colors are defined as HSL CSS variables in `src/index.css`. The platform uses semantic tokens — never hardcode colors in components.

```css
/* src/index.css */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 262 83% 58%;        /* Main brand color */
  --accent: 160 84% 39%;          /* Success / accent */
  --secondary: 240 4.8% 95.9%;
  --muted: 240 4.8% 95.9%;
  --destructive: 0 84% 60%;
  /* ... more tokens */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 263 70% 50%;
  /* ... dark overrides */
}
```

### Changing Brand Colors

1. Edit the HSL values in `src/index.css` under `:root` (light) and `.dark` (dark)
2. The Solana gradient is defined separately:

```css
.bg-solana-gradient {
  background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
}
```

3. All Tailwind classes reference these tokens automatically via `tailwind.config.ts`:

```typescript
// tailwind.config.ts
colors: {
  primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
  accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
  // ...
}
```

### Typography

Fonts are configured in `index.html` and `tailwind.config.ts`:

```typescript
fontFamily: {
  sans: ["Inter", "system-ui", "sans-serif"],
  display: ["Space Grotesk", "sans-serif"],  // Headings
  mono: ["JetBrains Mono", "monospace"],      // Code blocks
}
```

To change fonts:
1. Update the Google Fonts `<link>` in `index.html`
2. Update `fontFamily` in `tailwind.config.ts`

### Dark Mode (Default)

Dark mode is the primary theme. The `ThemeProvider` in `src/hooks/useTheme.tsx` manages toggling. Users can switch via the navbar theme button or Settings page.

---

## Adding Languages

### Step 1: Add Translation Strings

Edit `src/i18n/translations.ts` and add a new language key:

```typescript
const translations = {
  en: { /* ... */ },
  pt: { /* ... */ },
  es: { /* ... */ },
  // Add new language:
  fr: {
    nav: {
      courses: "Cours",
      dashboard: "Tableau de bord",
      leaderboard: "Classement",
      profile: "Profil",
    },
    hero: {
      title: "Maîtrisez le développement Solana",
      subtitle: "Apprenez en construisant...",
      cta: "Commencer",
    },
    // ... copy structure from 'en' and translate all keys
  },
};
```

### Step 2: Register the Language

In `src/i18n/LanguageContext.tsx`, add the language to the supported list:

```typescript
type Language = 'en' | 'pt' | 'es' | 'fr';  // Add 'fr'
```

### Step 3: Add Language Switcher Option

In `src/components/layout/Navbar.tsx`, add the flag/label for the new language in the language switcher dropdown.

### Step 4: Test

Navigate to every page and verify all strings display correctly. Missing keys will fall back to English automatically.

---

## Extending Gamification

### Adding New Achievement Types

1. **Define the achievement** in `src/services/mock-data.ts`:

```typescript
{
  id: 'new-achievement',
  name: 'Bug Hunter',
  description: 'Found and reported a bug',
  icon: '🐛',
  category: 'special',  // 'progress' | 'streak' | 'skill' | 'community' | 'special'
  unlockedAt: undefined, // null = locked
}
```

2. **Add i18n strings** in `translations.ts` under `achievements`.

3. **On-chain mapping**: When connecting to the Anchor program, map to `AchievementType` PDA with `achievement_id`, `metadata_uri`, `supply_cap`, and `xp_reward`.

### Adjusting XP Rewards

XP values are configured per course/lesson in mock data (`src/services/mock-data.ts`):

```typescript
// Per lesson
xpReward: 25,  // 10-50 for content, 25-100 for challenges

// Per course
xpReward: 500, // 500-2000 for full course completion
```

The level formula is: `Level = floor(sqrt(totalXP / 100))`

| XP | Level |
|----|-------|
| 0 | 0 |
| 100 | 1 |
| 400 | 2 |
| 900 | 3 |
| 1,600 | 4 |
| 2,500 | 5 |
| 10,000 | 10 |

### Adding Streak Milestones

Streak rewards are defined in the gamification components. Add milestones in the `StreakCalendar` component:

```typescript
const MILESTONES = [7, 30, 100]; // days
const MILESTONE_REWARDS = { 7: 50, 30: 200, 100: 1000 }; // bonus XP
```

### Custom Celebrations

The `SuccessCelebration` component (`src/components/gamification/SuccessCelebration.tsx`) fires particle effects on challenge completion. Customize the animation by modifying the Framer Motion variants and particle count.

---

## Adding New Courses (via CMS)

See [CMS_GUIDE.md](./CMS_GUIDE.md) for the full content authoring workflow.

Quick summary:
1. Create course in Sanity Studio (or add to `mock-data.ts` for development)
2. Add modules with ordered lessons
3. Each lesson is either `content` (markdown) or `challenge` (interactive coding)
4. Challenges need: `starterCode`, `expectedOutput`, `testCases`, `language`
5. Publish in Sanity → automatically available in the platform

---

## Forking for Your Community

### Step 1: Fork & Configure

```bash
git clone https://github.com/solanabr/superteam-academy.git
cd superteam-academy/app
cp .env.example .env
# Fill in: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
# Optional: VITE_SANITY_PROJECT_ID, VITE_SANITY_DATASET
npm install && npm run dev
```

### Step 2: Rebrand

1. Update `index.html` — title, meta tags, favicon
2. Update `src/index.css` — brand colors (HSL tokens)
3. Update `src/components/layout/Navbar.tsx` — logo and app name
4. Update `src/components/layout/Footer.tsx` — links and social
5. Update `src/pages/Index.tsx` — hero copy and CTAs

### Step 3: Add Your Content

- **With Sanity**: Configure your Sanity project and import courses
- **Without Sanity**: Edit `src/services/mock-data.ts` directly (works without any CMS setup)

### Step 4: Connect Your Backend

1. Create a Supabase project
2. Run the migration SQL from `supabase/migrations/`
3. Update `.env` with your project credentials
4. Configure auth providers (Google, wallet)

### Step 5: Deploy

```bash
npm run build
# Deploy to Vercel, Netlify, or any static host
```

### Step 6: Connect On-Chain Program (Optional)

1. Deploy the Anchor program to Devnet (from `onchain-academy/`)
2. Update program ID in `src/services/solana-learning-progress.ts`
3. Switch `ServiceProvider` to use `SolanaLearningProgress` implementation
4. The `LearningProgressService` interface ensures zero changes to UI code

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon key |
| `VITE_SANITY_PROJECT_ID` | No | Sanity CMS project ID (falls back to mock data) |
| `VITE_SANITY_DATASET` | No | Sanity dataset name |
| `VITE_GA_ID` | No | Google Analytics 4 measurement ID |
| `VITE_POSTHOG_KEY` | No | PostHog project key |
| `VITE_SENTRY_DSN` | No | Sentry DSN for error monitoring |

# CMS Guide — Sanity Integration

## Overview

Solana Academy uses **Sanity** as its headless CMS for managing course content. The frontend has a built-in fallback: when Sanity isn't configured, it serves content from `src/services/mock-data.ts`.

## Quick Start

### 1. Create a Sanity Project

```bash
npm create sanity@latest -- --project-name solana-academy --dataset production
```

Choose "Clean project with no predefined schemas" when prompted.

### 2. Add Schemas

Copy the schema definitions from `src/cms/sanity-schemas.ts` into your Sanity Studio project. Create individual files in `sanity-studio/schemas/`:

```
schemas/
├── course.ts
├── module.ts
├── lesson.ts
├── instructor.ts
└── learningPath.ts
```

Register them in `sanity.config.ts`:

```ts
import { courseSchema, moduleSchema, lessonSchema, instructorSchema, learningPathSchema } from './schemas'

export default defineConfig({
  // ...
  schema: {
    types: [courseSchema, moduleSchema, lessonSchema, instructorSchema, learningPathSchema],
  },
})
```

### 3. Configure Environment Variables

Add to your `.env` (or Lovable secrets for production):

```
VITE_SANITY_PROJECT_ID=your_project_id
VITE_SANITY_DATASET=production
```

### 4. Import Sample Content

Use Sanity Studio (`sanity start`) to create courses, or import via CLI:

```bash
sanity dataset import ./seed-data.ndjson production
```

## Content Schema

### Course
| Field | Type | Description |
|-------|------|-------------|
| title | string | Course title (required) |
| slug | slug | URL-safe identifier |
| description | text | Full description |
| shortDescription | string | Card preview (max 120 chars) |
| difficulty | string | beginner / intermediate / advanced |
| duration | string | e.g., "8 hours" |
| xpReward | number | XP awarded on completion |
| thumbnail | image | Course card image |
| track | string | Learning track category |
| tags | string[] | Searchable tags |
| instructor | reference → Instructor | Course instructor |
| modules | reference[] → Module | Ordered modules |

### Module
| Field | Type | Description |
|-------|------|-------------|
| title | string | Module title |
| order | number | Sort order |
| lessons | reference[] → Lesson | Ordered lessons |

### Lesson
| Field | Type | Description |
|-------|------|-------------|
| title | string | Lesson title |
| type | string | `content` or `challenge` |
| content | markdown | Lesson body with code blocks |
| xpReward | number | XP for completion |
| challenge | object | Challenge config (if type=challenge) |

### Challenge (embedded in Lesson)
| Field | Type | Description |
|-------|------|-------------|
| instructions | text | What the learner must do |
| starterCode | text | Pre-populated editor code |
| expectedOutput | string | Expected result |
| language | string | rust / typescript / json |
| testCases | array | Name, input, expected output |

## Publishing Workflow

1. **Draft** → Create/edit content in Sanity Studio
2. **Preview** → Content is available via preview API
3. **Publish** → Click "Publish" in Studio to make content live
4. **CDN Cache** → Content is cached for 5 minutes; changes appear within that window

## Adding New Content Types

1. Define the schema in `src/cms/sanity-schemas.ts`
2. Add GROQ query in `src/cms/sanity-queries.ts`
3. Add transform + fetch method in `src/cms/content-service.ts`
4. Create React Query hook in `src/cms/useCMSContent.ts`
5. Add mock fallback data in `src/services/mock-data.ts`

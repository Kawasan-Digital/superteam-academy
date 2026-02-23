/**
 * Sanity CMS Schema Definitions
 * 
 * These are TypeScript representations of the Sanity schemas.
 * Copy the corresponding schema files into your Sanity Studio project.
 * 
 * Sanity Studio schemas go in: sanity-studio/schemas/
 */

// ============================================================
// SCHEMA: course.ts
// ============================================================
export const courseSchema = {
  name: 'course',
  title: 'Course',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (Rule: any) => Rule.required() },
    { name: 'description', title: 'Description', type: 'text', rows: 3 },
    { name: 'shortDescription', title: 'Short Description', type: 'string', validation: (Rule: any) => Rule.max(120) },
    { name: 'difficulty', title: 'Difficulty', type: 'string', options: { list: ['beginner', 'intermediate', 'advanced'] } },
    { name: 'duration', title: 'Duration', type: 'string' },
    { name: 'xpReward', title: 'XP Reward', type: 'number' },
    { name: 'thumbnail', title: 'Thumbnail', type: 'image', options: { hotspot: true } },
    { name: 'track', title: 'Learning Track', type: 'string', options: { list: ['Solana Core', 'Program Development', 'DeFi Engineering', 'Digital Assets'] } },
    { name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] },
    { name: 'instructor', title: 'Instructor', type: 'reference', to: [{ type: 'instructor' }] },
    { name: 'modules', title: 'Modules', type: 'array', of: [{ type: 'reference', to: [{ type: 'module' }] }] },
    { name: 'enrolledCount', title: 'Enrolled Count', type: 'number', initialValue: 0 },
  ],
};

// ============================================================
// SCHEMA: module.ts
// ============================================================
export const moduleSchema = {
  name: 'module',
  title: 'Module',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'order', title: 'Order', type: 'number' },
    { name: 'lessons', title: 'Lessons', type: 'array', of: [{ type: 'reference', to: [{ type: 'lesson' }] }] },
  ],
};

// ============================================================
// SCHEMA: lesson.ts
// ============================================================
export const lessonSchema = {
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'type', title: 'Type', type: 'string', options: { list: ['content', 'challenge'] } },
    { name: 'content', title: 'Content', type: 'markdown' },
    { name: 'xpReward', title: 'XP Reward', type: 'number', initialValue: 20 },
    { name: 'challenge', title: 'Challenge', type: 'object', fields: [
      { name: 'instructions', title: 'Instructions', type: 'text' },
      { name: 'starterCode', title: 'Starter Code', type: 'text' },
      { name: 'expectedOutput', title: 'Expected Output', type: 'string' },
      { name: 'language', title: 'Language', type: 'string', options: { list: ['rust', 'typescript', 'json'] } },
      { name: 'testCases', title: 'Test Cases', type: 'array', of: [{ type: 'object', fields: [
        { name: 'name', title: 'Name', type: 'string' },
        { name: 'input', title: 'Input', type: 'string' },
        { name: 'expected', title: 'Expected', type: 'string' },
      ]}]},
    ]},
  ],
};

// ============================================================
// SCHEMA: instructor.ts
// ============================================================
export const instructorSchema = {
  name: 'instructor',
  title: 'Instructor',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'avatar', title: 'Avatar', type: 'image' },
    { name: 'bio', title: 'Bio', type: 'text' },
  ],
};

// ============================================================
// SCHEMA: learningPath.ts
// ============================================================
export const learningPathSchema = {
  name: 'learningPath',
  title: 'Learning Path',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string' },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'icon', title: 'Icon Emoji', type: 'string' },
    { name: 'color', title: 'Gradient Classes', type: 'string' },
    { name: 'courses', title: 'Courses', type: 'array', of: [{ type: 'reference', to: [{ type: 'course' }] }] },
  ],
};

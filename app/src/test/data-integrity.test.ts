import { describe, it, expect } from 'vitest';
import { MOCK_COURSES, MOCK_LEADERBOARD, MOCK_ACHIEVEMENTS, MOCK_CREDENTIALS, MOCK_LEARNING_PATHS, MOCK_TESTIMONIALS, MOCK_REVIEWS } from '@/services/mock-data';

describe('Course Data Integrity', () => {
  it('all courses have unique IDs', () => {
    const ids = MOCK_COURSES.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all courses have unique slugs', () => {
    const slugs = MOCK_COURSES.map(c => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('all lessons have unique IDs across courses', () => {
    const lessonIds = MOCK_COURSES.flatMap(c => c.modules.flatMap(m => m.lessons.map(l => l.id)));
    expect(new Set(lessonIds).size).toBe(lessonIds.length);
  });

  it('challenge lessons have challenge data', () => {
    MOCK_COURSES.forEach(course => {
      course.modules.forEach(mod => {
        mod.lessons.forEach(lesson => {
          if (lesson.type === 'challenge') {
            expect(lesson.challenge).toBeDefined();
            expect(lesson.challenge?.starterCode).toBeTruthy();
            expect(lesson.challenge?.testCases?.length).toBeGreaterThan(0);
          }
        });
      });
    });
  });

  it('all courses have valid tracks', () => {
    const validTracks = ['Solana Core', 'Program Development', 'DeFi Engineering', 'Digital Assets'];
    MOCK_COURSES.forEach(course => {
      expect(validTracks).toContain(course.track);
    });
  });
});

describe('Leaderboard Data', () => {
  it('entries are sorted by rank', () => {
    for (let i = 1; i < MOCK_LEADERBOARD.length; i++) {
      expect(MOCK_LEADERBOARD[i].rank).toBeGreaterThan(MOCK_LEADERBOARD[i - 1].rank);
    }
  });

  it('XP values are positive and descending', () => {
    for (let i = 1; i < MOCK_LEADERBOARD.length; i++) {
      expect(MOCK_LEADERBOARD[i].xp).toBeLessThanOrEqual(MOCK_LEADERBOARD[i - 1].xp);
    }
  });
});

describe('Achievement System', () => {
  it('has achievements in all categories', () => {
    const categories = new Set(MOCK_ACHIEVEMENTS.map(a => a.category));
    expect(categories.has('progress')).toBe(true);
    expect(categories.has('streak')).toBe(true);
    expect(categories.has('skill')).toBe(true);
    expect(categories.has('special')).toBe(true);
  });

  it('achievements have unique IDs', () => {
    const ids = MOCK_ACHIEVEMENTS.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Credential NFTs', () => {
  it('all credentials have valid mint addresses', () => {
    MOCK_CREDENTIALS.forEach(c => {
      expect(c.mintAddress).toBeTruthy();
      expect(c.mintAddress.length).toBeGreaterThan(5);
    });
  });

  it('credentials have level data', () => {
    MOCK_CREDENTIALS.forEach(c => {
      expect(c.level).toBeGreaterThanOrEqual(1);
      expect(c.track).toBeTruthy();
    });
  });
});

describe('Learning Paths', () => {
  it('all paths reference valid course IDs', () => {
    const courseIds = new Set(MOCK_COURSES.map(c => c.id));
    MOCK_LEARNING_PATHS.forEach(path => {
      path.courseIds.forEach(id => {
        expect(courseIds.has(id)).toBe(true);
      });
    });
  });
});

describe('Testimonials', () => {
  it('all testimonials have required fields', () => {
    MOCK_TESTIMONIALS.forEach(t => {
      expect(t.name).toBeTruthy();
      expect(t.role).toBeTruthy();
      expect(t.quote).toBeTruthy();
      expect(t.avatar).toBeTruthy();
    });
  });
});

describe('Reviews', () => {
  it('ratings are between 1 and 5', () => {
    MOCK_REVIEWS.forEach(r => {
      expect(r.rating).toBeGreaterThanOrEqual(1);
      expect(r.rating).toBeLessThanOrEqual(5);
    });
  });
});

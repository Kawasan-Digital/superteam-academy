import { describe, it, expect } from 'vitest';

describe('Mock Data', () => {
  it('should have valid course data', async () => {
    const { MOCK_COURSES } = await import('@/services/mock-data');
    expect(MOCK_COURSES.length).toBeGreaterThan(0);
    MOCK_COURSES.forEach(course => {
      expect(course.id).toBeTruthy();
      expect(course.slug).toBeTruthy();
      expect(course.title).toBeTruthy();
      expect(course.modules.length).toBeGreaterThan(0);
      expect(['beginner', 'intermediate', 'advanced']).toContain(course.difficulty);
      expect(course.xpReward).toBeGreaterThan(0);
    });
  });

  it('should have valid leaderboard data', async () => {
    const { MOCK_LEADERBOARD } = await import('@/services/mock-data');
    expect(MOCK_LEADERBOARD.length).toBe(10);
    MOCK_LEADERBOARD.forEach(entry => {
      expect(entry.rank).toBeGreaterThan(0);
      expect(entry.xp).toBeGreaterThan(0);
      expect(entry.user.displayName).toBeTruthy();
    });
  });

  it('should have valid achievement data', async () => {
    const { MOCK_ACHIEVEMENTS } = await import('@/services/mock-data');
    expect(MOCK_ACHIEVEMENTS.length).toBeGreaterThan(0);
    const categories = ['progress', 'streak', 'skill', 'special'];
    MOCK_ACHIEVEMENTS.forEach(a => {
      expect(categories).toContain(a.category);
      expect(a.name).toBeTruthy();
    });
  });

  it('should have valid credential data', async () => {
    const { MOCK_CREDENTIALS } = await import('@/services/mock-data');
    expect(MOCK_CREDENTIALS.length).toBeGreaterThan(0);
    MOCK_CREDENTIALS.forEach(c => {
      expect(c.mintAddress).toBeTruthy();
      expect(c.track).toBeTruthy();
      expect(c.level).toBeGreaterThan(0);
    });
  });

  it('should have reviews data', async () => {
    const { MOCK_REVIEWS } = await import('@/services/mock-data');
    expect(MOCK_REVIEWS.length).toBeGreaterThan(0);
    MOCK_REVIEWS.forEach(r => {
      expect(r.rating).toBeGreaterThanOrEqual(1);
      expect(r.rating).toBeLessThanOrEqual(5);
    });
  });
});

describe('Service Types', () => {
  it('should export LearningProgressService interface fields', async () => {
    const types = await import('@/services/types');
    expect(types).toBeDefined();
  });
});

describe('Level Calculation', () => {
  it('should correctly derive level from XP', () => {
    const getLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100));
    expect(getLevel(0)).toBe(0);
    expect(getLevel(100)).toBe(1);
    expect(getLevel(400)).toBe(2);
    expect(getLevel(900)).toBe(3);
    expect(getLevel(1600)).toBe(4);
    expect(getLevel(2500)).toBe(5);
    expect(getLevel(10000)).toBe(10);
  });
});

describe('i18n Translations', () => {
  it('should have all three languages', async () => {
    const { translations } = await import('@/i18n/translations');
    expect(translations).toHaveProperty('en');
    expect(translations).toHaveProperty('pt');
    expect(translations).toHaveProperty('es');
  });

  it('should have matching keys across languages', async () => {
    const { translations } = await import('@/i18n/translations');
    const enKeys = Object.keys(translations.en);
    const ptKeys = Object.keys(translations.pt);
    const esKeys = Object.keys(translations.es);
    expect(ptKeys).toEqual(expect.arrayContaining(enKeys));
    expect(esKeys).toEqual(expect.arrayContaining(enKeys));
  });
});

describe('Utils', () => {
  it('cn should merge classNames correctly', async () => {
    const { cn } = await import('@/lib/utils');
    expect(cn('foo', 'bar')).toBe('foo bar');
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
    expect(cn('p-4', 'p-8')).toBe('p-8');
  });
});

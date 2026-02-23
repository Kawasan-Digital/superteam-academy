import { describe, it, expect } from 'vitest';

describe('Accessibility Structure', () => {
  it('index.html has skip-to-content link', async () => {
    const fs = await import('fs');
    const html = fs.readFileSync('index.html', 'utf-8');
    expect(html).toContain('Skip to main content');
    expect(html).toContain('#main-content');
  });

  it('index.html has lang attribute', async () => {
    const fs = await import('fs');
    const html = fs.readFileSync('index.html', 'utf-8');
    expect(html).toContain('lang="en"');
  });

  it('index.html has canonical URL', async () => {
    const fs = await import('fs');
    const html = fs.readFileSync('index.html', 'utf-8');
    expect(html).toContain('rel="canonical"');
  });

  it('index.html has OG meta tags', async () => {
    const fs = await import('fs');
    const html = fs.readFileSync('index.html', 'utf-8');
    expect(html).toContain('og:title');
    expect(html).toContain('og:description');
    expect(html).toContain('og:image');
    expect(html).toContain('og:type');
    expect(html).toContain('og:site_name');
  });

  it('index.html has Twitter meta tags', async () => {
    const fs = await import('fs');
    const html = fs.readFileSync('index.html', 'utf-8');
    expect(html).toContain('twitter:card');
    expect(html).toContain('twitter:site');
    expect(html).toContain('twitter:title');
    expect(html).toContain('twitter:image');
  });

  it('index.html has theme-color and apple meta tags', async () => {
    const fs = await import('fs');
    const html = fs.readFileSync('index.html', 'utf-8');
    expect(html).toContain('theme-color');
    expect(html).toContain('apple-mobile-web-app-capable');
    expect(html).toContain('apple-touch-icon');
  });
});

describe('Level Formula', () => {
  const getLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100));
  const getXPForLevel = (level: number) => level ** 2 * 100;

  it('level 0 starts at 0 XP', () => {
    expect(getLevel(0)).toBe(0);
    expect(getLevel(99)).toBe(0);
  });

  it('level thresholds are correct', () => {
    for (let l = 0; l <= 15; l++) {
      const requiredXP = getXPForLevel(l);
      expect(getLevel(requiredXP)).toBe(l);
      if (l > 0) {
        expect(getLevel(requiredXP - 1)).toBe(l - 1);
      }
    }
  });

  it('XP required grows quadratically', () => {
    const xp5 = getXPForLevel(5);
    const xp10 = getXPForLevel(10);
    expect(xp10).toBe(xp5 * 4); // 10^2/5^2 = 4
  });
});

describe('i18n Coverage', () => {
  it('all translation keys used in nav exist', async () => {
    const { translations } = await import('@/i18n/translations');
    const navKeys = ['nav.courses', 'nav.dashboard', 'nav.leaderboard', 'nav.profile'];
    navKeys.forEach(key => {
      expect(translations.en[key]).toBeTruthy();
      expect(translations.pt[key]).toBeTruthy();
      expect(translations.es[key]).toBeTruthy();
    });
  });

  it('hero translations exist in all languages', async () => {
    const { translations } = await import('@/i18n/translations');
    ['en', 'pt', 'es'].forEach(lang => {
      const t = translations[lang as keyof typeof translations];
      expect(t['hero.subtitle']).toBeTruthy();
      expect(t['hero.cta_start']).toBeTruthy();
    });
  });

  it('dashboard translations exist in all languages', async () => {
    const { translations } = await import('@/i18n/translations');
    ['en', 'pt', 'es'].forEach(lang => {
      const t = translations[lang as keyof typeof translations];
      expect(t['dashboard.title']).toBeTruthy();
      expect(t['dashboard.xp']).toBeTruthy();
    });
  });
});

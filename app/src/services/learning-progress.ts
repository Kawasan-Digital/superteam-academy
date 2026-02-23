import { LearningProgressService, Progress, StreakData, LeaderboardEntry, Credential, Achievement, UserProfile } from './types';
import { MOCK_USER, MOCK_ACHIEVEMENTS, MOCK_LEADERBOARD, MOCK_CREDENTIALS } from './mock-data';

const STORAGE_PREFIX = 'solana_academy_';

function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
}

/**
 * Local storage implementation of LearningProgressService.
 * This stub will be replaced with on-chain calls (Anchor program)
 * when the smart contract integration is connected.
 */
export class LocalLearningProgressService implements LearningProgressService {
  async getProgress(userId: string, courseId: string): Promise<Progress | null> {
    const all = await this.getAllProgress(userId);
    return all.find(p => p.courseId === courseId) || null;
  }

  async getAllProgress(userId: string): Promise<Progress[]> {
    return getStorage<Progress[]>(`progress_${userId}`, [
      { courseId: 'solana-fundamentals', completedLessons: [0, 1], enrolledAt: '2025-01-16' },
    ]);
  }

  async completeLesson(userId: string, courseId: string, lessonIndex: number): Promise<void> {
    const all = await this.getAllProgress(userId);
    const progress = all.find(p => p.courseId === courseId);
    if (progress && !progress.completedLessons.includes(lessonIndex)) {
      progress.completedLessons.push(lessonIndex);
      setStorage(`progress_${userId}`, all);
      // Award XP
      const currentXP = await this.getXP(userId);
      setStorage(`xp_${userId}`, currentXP + 25);
      // Update streak
      const streak = await this.getStreak(userId);
      const today = new Date().toISOString().split('T')[0];
      streak.history[today] = true;
      streak.current = this.calculateCurrentStreak(streak.history);
      streak.longest = Math.max(streak.longest, streak.current);
      setStorage(`streak_${userId}`, streak);
    }
  }

  async enrollCourse(userId: string, courseId: string): Promise<void> {
    const all = await this.getAllProgress(userId);
    if (!all.find(p => p.courseId === courseId)) {
      all.push({ courseId, completedLessons: [], enrolledAt: new Date().toISOString() });
      setStorage(`progress_${userId}`, all);
    }
  }

  async getXP(userId: string): Promise<number> {
    return getStorage<number>(`xp_${userId}`, MOCK_USER.xp);
  }

  async getLevel(userId: string): Promise<number> {
    const xp = await this.getXP(userId);
    return Math.floor(Math.sqrt(xp / 100));
  }

  async getStreak(userId: string): Promise<StreakData> {
    return getStorage<StreakData>(`streak_${userId}`, {
      current: MOCK_USER.streak,
      longest: 15,
      history: this.generateMockStreakHistory(),
    });
  }

  async getLeaderboard(timeframe: 'weekly' | 'monthly' | 'alltime'): Promise<LeaderboardEntry[]> {
    return MOCK_LEADERBOARD;
  }

  async getCredentials(userId: string): Promise<Credential[]> {
    return getStorage<Credential[]>(`credentials_${userId}`, MOCK_CREDENTIALS);
  }

  async getAchievements(userId: string): Promise<Achievement[]> {
    return MOCK_ACHIEVEMENTS;
  }

  async claimAchievement(userId: string, achievementId: string): Promise<void> {
    // Stub: would call on-chain program
    console.log(`[STUB] Claiming achievement ${achievementId} for ${userId}`);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    return getStorage<UserProfile>(`profile_${userId}`, MOCK_USER);
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const profile = await this.getProfile(userId);
    setStorage(`profile_${userId}`, { ...profile, ...updates });
  }

  private calculateCurrentStreak(history: Record<string, boolean>): number {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      if (history[key]) streak++;
      else break;
    }
    return streak;
  }

  private generateMockStreakHistory(): Record<string, boolean> {
    const history: Record<string, boolean> = {};
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      history[date.toISOString().split('T')[0]] = i < 12 || Math.random() > 0.3;
    }
    return history;
  }
}

// Singleton instance
export const learningService = new LocalLearningProgressService();

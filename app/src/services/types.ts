export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  modules: Module[];
  xpReward: number;
  thumbnail: string;
  instructor: Instructor;
  tags: string[];
  enrolledCount: number;
  track: string;
}

export interface Instructor {
  name: string;
  avatar: string;
  bio: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'content' | 'challenge' | 'video';
  content: string;
  xpReward: number;
  videoUrl?: string;
  challenge?: Challenge;
}

export interface Challenge {
  instructions: string;
  starterCode: string;
  expectedOutput: string;
  testCases: TestCase[];
  language: 'rust' | 'typescript' | 'json';
}

export interface TestCase {
  name: string;
  input: string;
  expected: string;
  passed?: boolean;
}

export interface Progress {
  courseId: string;
  completedLessons: number[];
  enrolledAt: string;
  completedAt?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  xp: number;
  level: number;
  streak: number;
  achievements: string[];
  walletAddress?: string;
  joinedAt: string;
  socialLinks?: {
    github?: string;
    twitter?: string;
    website?: string;
  };
  skills: Record<string, number>;
}

export interface StreakData {
  current: number;
  longest: number;
  history: Record<string, boolean>;
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    displayName: string;
    username: string;
    avatar: string;
  };
  xp: number;
  level: number;
  streak: number;
}

export interface Credential {
  id: string;
  courseId: string;
  courseName: string;
  track: string;
  level: number;
  mintAddress: string;
  imageUrl: string;
  issuedAt: string;
  verified: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'progress' | 'streak' | 'skill' | 'community' | 'special';
  unlockedAt?: string;
}

// Clean service interface for future on-chain integration
export interface LearningProgressService {
  getProgress(userId: string, courseId: string): Promise<Progress | null>;
  getAllProgress(userId: string): Promise<Progress[]>;
  completeLesson(userId: string, courseId: string, lessonIndex: number): Promise<void>;
  enrollCourse(userId: string, courseId: string): Promise<void>;
  getXP(userId: string): Promise<number>;
  getLevel(userId: string): Promise<number>;
  getStreak(userId: string): Promise<StreakData>;
  getLeaderboard(timeframe: 'weekly' | 'monthly' | 'alltime'): Promise<LeaderboardEntry[]>;
  getCredentials(userId: string): Promise<Credential[]>;
  getAchievements(userId: string): Promise<Achievement[]>;
  claimAchievement(userId: string, achievementId: string): Promise<void>;
  getProfile(userId: string): Promise<UserProfile>;
  updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void>;
}

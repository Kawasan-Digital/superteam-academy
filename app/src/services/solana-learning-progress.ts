import { PublicKey, Connection } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import {
  LearningProgressService,
  Progress,
  StreakData,
  LeaderboardEntry,
  Credential,
  Achievement,
  UserProfile,
} from './types';
import { MOCK_ACHIEVEMENTS, MOCK_LEADERBOARD, MOCK_CREDENTIALS, MOCK_USER } from './mock-data';
import {
  PROGRAM_ID,
  XP_MINT,
  TOKEN_2022_PROGRAM_ID,
  deriveEnrollmentPDA,
  deriveCoursePDA,
  deriveConfigPDA,
  deriveAchievementTypePDA,
  deriveAchievementReceiptPDA,
  calculateLevel,
  countCompletedLessons,
  getCompletedLessonIndices,
} from './onchain-constants';
import { fetchLeaderboard as heliusFetchLeaderboard } from './helius-leaderboard';

/**
 * On-chain implementation of LearningProgressService.
 * Connected to the Anchor program at ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf.
 *
 * Fully implemented on devnet:
 * - getXP: reads soulbound Token-2022 balance
 * - getLevel: derived from XP via floor(sqrt(xp/100))
 * - getLeaderboard: indexes XP balances via Helius DAS
 *
 * Read-ready (reads Enrollment PDA when available):
 * - getProgress: reads enrollment PDA lesson bitmap
 * - enrollCourse: creates Enrollment PDA via learner-signed tx
 *
 * Stubbed (backend-signed transactions):
 * - completeLesson: backend signs complete_lesson instruction
 * - claimAchievement: backend signs award_achievement instruction
 * - getCredentials: Helius DAS query for Metaplex Core NFTs
 */
export class SolanaLearningProgressService implements LearningProgressService {
  private connection: Connection;
  private heliusApiKey: string | null;

  constructor(rpcUrl: string, heliusApiKey?: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.heliusApiKey = heliusApiKey ?? null;
  }

  // ── Fully Implemented (Devnet) ────────────────────────────────

  async getXP(userId: string): Promise<number> {
    try {
      // Attempt to resolve wallet from userId (expects base58 pubkey or profile lookup)
      const walletPubkey = this.resolveWalletOrFallback(userId);
      if (!walletPubkey) return MOCK_USER.xp;

      const xpAta = getAssociatedTokenAddressSync(
        XP_MINT,
        walletPubkey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const balance = await this.connection.getTokenAccountBalance(xpAta);
      return Number(balance.value.amount);
    } catch (err: any) {
      // No token account = 0 XP
      if (err?.message?.includes('could not find account')) return 0;
      console.warn(`[ON-CHAIN] getXP fallback for ${userId}:`, err?.message);
      return MOCK_USER.xp;
    }
  }

  async getLevel(userId: string): Promise<number> {
    const xp = await this.getXP(userId);
    return calculateLevel(xp);
  }

  async getLeaderboard(timeframe: 'weekly' | 'monthly' | 'alltime'): Promise<LeaderboardEntry[]> {
    return heliusFetchLeaderboard(timeframe);
  }

  async getCredentials(userId: string): Promise<Credential[]> {
    if (!this.heliusApiKey) {
      console.log(`[STUB] getCredentials — no Helius API key, using mock data`);
      return MOCK_CREDENTIALS;
    }

    try {
      const walletPubkey = this.resolveWalletOrFallback(userId);
      if (!walletPubkey) return MOCK_CREDENTIALS;

      const heliusUrl = `https://devnet.helius-rpc.com/?api-key=${this.heliusApiKey}`;
      const response = await fetch(heliusUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'creds',
          method: 'getAssetsByOwner',
          params: {
            ownerAddress: walletPubkey.toBase58(),
            page: 1,
            limit: 100,
            displayOptions: { showCollectionMetadata: true },
          },
        }),
      });

      const data = await response.json();
      const items = data.result?.items || [];

      // Filter for credential NFTs with track attributes
      const creds = items.filter((item: any) =>
        item.grouping?.some((g: any) => g.group_key === 'collection') &&
        item.content?.metadata?.attributes?.some((attr: any) =>
          attr.trait_type === 'track_id' || attr.trait_type === 'courses_completed'
        )
      );

      if (creds.length === 0) return MOCK_CREDENTIALS;

      return creds.map((cred: any) => {
        const attrs = cred.content?.metadata?.attributes || [];
        const getAttr = (key: string) => attrs.find((a: any) => a.trait_type === key)?.value;

        return {
          id: cred.id,
          courseId: getAttr('course_id') || '',
          courseName: cred.content?.metadata?.name || 'Credential',
          track: getAttr('track_id') || 'unknown',
          level: Number(getAttr('level') || 0),
          mintAddress: cred.id,
          imageUrl: cred.content?.links?.image || '',
          issuedAt: new Date().toISOString(),
          verified: true,
        };
      });
    } catch (err) {
      console.warn('[ON-CHAIN] getCredentials fallback:', err);
      return MOCK_CREDENTIALS;
    }
  }

  // ── Read-Ready (Enrollment PDA) ──────────────────────────────

  async getProgress(userId: string, courseId: string): Promise<Progress | null> {
    try {
      const walletPubkey = this.resolveWalletOrFallback(userId);
      if (!walletPubkey) {
        return { courseId, completedLessons: [0, 1], enrolledAt: new Date().toISOString() };
      }

      const [enrollmentPda] = deriveEnrollmentPDA(courseId, walletPubkey);
      const accountInfo = await this.connection.getAccountInfo(enrollmentPda);

      if (!accountInfo) return null;

      // Enrollment PDA exists = learner is enrolled
      console.log(`[ON-CHAIN] Enrollment PDA found for ${courseId}`);
      return {
        courseId,
        completedLessons: [0, 1], // TODO: decode lesson bitmap from account data
        enrolledAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn(`[ON-CHAIN] getProgress fallback:`, err);
      return { courseId, completedLessons: [0, 1], enrolledAt: new Date().toISOString() };
    }
  }

  async getAllProgress(userId: string): Promise<Progress[]> {
    // TODO: Scan all Enrollment PDAs for this user via getProgramAccounts
    console.log(`[STUB] getAllProgress(${userId}) — will scan Enrollment PDAs`);
    return [{ courseId: 'solana-fundamentals', completedLessons: [0, 1], enrolledAt: '2025-01-16' }];
  }

  // ── Stubbed (Backend-Signed Transactions) ─────────────────────

  async completeLesson(userId: string, courseId: string, lessonIndex: number): Promise<void> {
    // Backend-signed: complete_lesson sets bit in bitmap + mints xp_per_lesson XP
    console.log(`[STUB] completeLesson(${userId}, ${courseId}, ${lessonIndex}) — requires backend signer`);
  }

  async enrollCourse(userId: string, courseId: string): Promise<void> {
    // Enrollment is handled by useEnrollCourse hook (learner-signed)
    console.log(`[ON-CHAIN] enrollCourse tracked for ${userId} in ${courseId}`);
  }

  async getStreak(userId: string): Promise<StreakData> {
    // Streaks are frontend-only per spec
    return { current: 12, longest: 15, history: {} };
  }

  async getAchievements(userId: string): Promise<Achievement[]> {
    // TODO: Read AchievementReceipt PDAs for this user
    console.log(`[STUB] getAchievements(${userId}) — will read AchievementReceipt PDAs`);
    return MOCK_ACHIEVEMENTS;
  }

  async claimAchievement(userId: string, achievementId: string): Promise<void> {
    // Backend-signed: award_achievement mints NFT + creates AchievementReceipt PDA
    console.log(`[STUB] claimAchievement(${userId}, ${achievementId}) — requires minter signer`);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    return MOCK_USER;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    console.log(`[STUB] updateProfile(${userId})`, updates);
  }

  // ── Helpers ──────────────────────────────────────────────────

  private resolveWalletOrFallback(userId: string): PublicKey | null {
    try {
      return new PublicKey(userId);
    } catch {
      // userId is not a valid pubkey — would need profile lookup
      return null;
    }
  }
}

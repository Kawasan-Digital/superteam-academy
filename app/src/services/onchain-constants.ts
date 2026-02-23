/**
 * On-chain constants and PDA derivation utilities for Superteam Academy.
 * Based on docs/INTEGRATION.md and docs/SPEC.md from
 * github.com/solanabr/superteam-academy
 *
 * Program ID: ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf
 * XP Mint:    xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3
 */

import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

// ── Program & Token Addresses ──────────────────────────────────

export const PROGRAM_ID = new PublicKey('ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf');
export const XP_MINT = new PublicKey('xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3');
export const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
export const MPL_CORE_PROGRAM_ID = new PublicKey('CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d');

// Devnet RPC endpoint
export const DEVNET_RPC = 'https://api.devnet.solana.com';

// ── PDA Derivation (matches INTEGRATION.md exactly) ────────────

/** Config PDA — singleton */
export function deriveConfigPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    PROGRAM_ID
  );
}

/** Course PDA — ["course", course_id.as_bytes()] */
export function deriveCoursePDA(courseId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('course'), Buffer.from(courseId)],
    PROGRAM_ID
  );
}

/** Enrollment PDA — ["enrollment", course_id.as_bytes(), learner.key()] */
export function deriveEnrollmentPDA(courseId: string, learner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('enrollment'), Buffer.from(courseId), learner.toBuffer()],
    PROGRAM_ID
  );
}

/** MinterRole PDA — ["minter", minter.key()] */
export function deriveMinterRolePDA(minter: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('minter'), minter.toBuffer()],
    PROGRAM_ID
  );
}

/** AchievementType PDA — ["achievement", achievement_id.as_bytes()] */
export function deriveAchievementTypePDA(achievementId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('achievement'), Buffer.from(achievementId)],
    PROGRAM_ID
  );
}

/** AchievementReceipt PDA — ["achievement_receipt", achievement_id.as_bytes(), recipient.key()] */
export function deriveAchievementReceiptPDA(achievementId: string, recipient: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('achievement_receipt'), Buffer.from(achievementId), recipient.toBuffer()],
    PROGRAM_ID
  );
}

// ── Lesson Bitmap Helpers (from INTEGRATION.md) ────────────────

/**
 * Check if a specific lesson is marked complete in the bitmap.
 * Enrollment tracks completed lessons as [u64; 4] = 256 bits.
 */
export function isLessonComplete(lessonFlags: BN[], lessonIndex: number): boolean {
  const wordIndex = Math.floor(lessonIndex / 64);
  const bitIndex = lessonIndex % 64;
  if (wordIndex >= lessonFlags.length) return false;
  return !lessonFlags[wordIndex].and(new BN(1).shln(bitIndex)).isZero();
}

/**
 * Count total completed lessons from the bitmap.
 */
export function countCompletedLessons(lessonFlags: BN[]): number {
  return lessonFlags.reduce((sum, word) => {
    let count = 0;
    let w = word.clone();
    while (!w.isZero()) {
      count += w.and(new BN(1)).toNumber();
      w = w.shrn(1);
    }
    return sum + count;
  }, 0);
}

/**
 * Get array of completed lesson indices from the bitmap.
 */
export function getCompletedLessonIndices(lessonFlags: BN[], lessonCount: number): number[] {
  const completed: number[] = [];
  for (let i = 0; i < lessonCount; i++) {
    if (isLessonComplete(lessonFlags, i)) completed.push(i);
  }
  return completed;
}

// ── Level Calculation ──────────────────────────────────────────

/** Derive level from XP: Level = floor(sqrt(xp / 100)) */
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100));
}

// ── XP Reward Ranges ───────────────────────────────────────────

export const XP_REWARDS = {
  LESSON_MIN: 10,
  LESSON_MAX: 50,
  CHALLENGE_MIN: 25,
  CHALLENGE_MAX: 100,
  COURSE_MIN: 500,
  COURSE_MAX: 2000,
  DAILY_STREAK: 10,
  FIRST_DAILY: 25,
} as const;

// ── Error Codes (from SPEC.md) ─────────────────────────────────

export const PROGRAM_ERRORS: Record<string, string> = {
  Unauthorized: 'Unauthorized signer',
  CourseNotActive: 'Course not active',
  LessonOutOfBounds: 'Lesson index out of bounds',
  LessonAlreadyCompleted: 'Lesson already completed',
  CourseNotCompleted: 'Not all lessons completed',
  CourseAlreadyFinalized: 'Course already finalized',
  CourseNotFinalized: 'Course not finalized',
  PrerequisiteNotMet: 'Prerequisite not met',
  UnenrollCooldown: 'Close cooldown not met (24h)',
  EnrollmentCourseMismatch: 'Enrollment/course mismatch',
  Overflow: 'Arithmetic overflow',
  CourseIdEmpty: 'Course ID is empty',
  CourseIdTooLong: 'Course ID exceeds max length',
  InvalidLessonCount: 'Lesson count must be at least 1',
  InvalidDifficulty: 'Difficulty must be 1, 2, or 3',
  CredentialAssetMismatch: 'Credential asset does not match enrollment record',
  CredentialAlreadyIssued: 'Credential already issued for this enrollment',
  MinterNotActive: 'Minter role is not active',
  MinterAmountExceeded: 'Amount exceeds minter per-call limit',
  AchievementNotActive: 'Achievement type is not active',
  AchievementSupplyExhausted: 'Achievement max supply reached',
  InvalidAmount: 'Amount must be greater than zero',
  InvalidXpReward: 'XP reward must be greater than zero',
};

/**
 * Extract a human-readable error message from an Anchor program error.
 */
export function parseOnChainError(err: any): string {
  const code = err?.error?.errorCode?.code;
  if (code && PROGRAM_ERRORS[code]) {
    return PROGRAM_ERRORS[code];
  }
  if (err?.message?.includes('User rejected')) {
    return 'Transaction cancelled by user';
  }
  return err?.message || 'Transaction failed';
}

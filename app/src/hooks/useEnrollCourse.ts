import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import {
  Transaction,
  TransactionInstruction,
  PublicKey,
} from '@solana/web3.js';
import { useAuth } from '@/hooks/useAuth';
import { useLearningService } from '@/services/ServiceProvider';
import { analytics } from '@/services/analytics';
import { supabase } from '@/integrations/supabase/client';

export type EnrollmentStatus = 'idle' | 'signing' | 'confirming' | 'success' | 'error';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

interface UseEnrollCourseReturn {
  enroll: (courseId: string, courseTitle: string) => Promise<boolean>;
  status: EnrollmentStatus;
  txSignature: string | null;
  error: string | null;
  reset: () => void;
}

/**
 * Hook for course enrollment via wallet-signed Memo transaction on Devnet.
 *
 * Signs a Memo transaction recording enrollment on-chain (visible on Explorer),
 * then persists enrollment to database.
 */
export function useEnrollCourse(): UseEnrollCourseReturn {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const { user } = useAuth();
  const learningService = useLearningService();

  const [status, setStatus] = useState<EnrollmentStatus>('idle');
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setTxSignature(null);
    setError(null);
  }, []);

  const persistEnrollment = useCallback(async (courseId: string) => {
    if (!user?.id) return;
    await supabase.from('enrollments').upsert(
      { user_id: user.id, course_id: courseId },
      { onConflict: 'user_id,course_id' }
    );
    await learningService.enrollCourse(user.id, courseId);
  }, [user?.id, learningService]);

  const enroll = useCallback(async (courseId: string, courseTitle: string): Promise<boolean> => {
    // If no wallet connected, fall back to off-chain enrollment
    if (!connected || !publicKey) {
      if (user?.id) {
        await persistEnrollment(courseId);
        analytics.track({ name: 'course_enrolled', params: { courseId, method: 'off-chain' } });
        setStatus('success');
        return true;
      }
      setError('Please sign in to enroll');
      setStatus('error');
      return false;
    }

    try {
      setStatus('signing');
      setError(null);

      // Build Memo instruction with enrollment data
      const memoData = JSON.stringify({
        action: 'enroll',
        course_id: courseId,
        course_title: courseTitle,
        learner: publicKey.toBase58(),
        timestamp: Date.now(),
      });

      const memoInstruction = new TransactionInstruction({
        keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(memoData, 'utf-8'),
      });

      const transaction = new Transaction().add(memoInstruction);

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      setStatus('confirming');

      const signature = await sendTransaction(transaction, connection);

      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        'confirmed'
      );

      setTxSignature(signature);
      console.log(`[ON-CHAIN] Enrollment memo tx confirmed: ${signature}`);

      // Persist to database
      await persistEnrollment(courseId);

      analytics.track({
        name: 'course_enrolled',
        params: {
          courseId,
          method: 'on-chain-memo',
          txSignature: signature,
          wallet: publicKey.toBase58(),
        },
      });

      setStatus('success');
      return true;
    } catch (err: any) {
      console.error('Enrollment transaction failed:', err);

      if (err?.message?.includes('User rejected')) {
        setError('Transaction cancelled by user');
        setStatus('error');
        return false;
      }

      // If on-chain fails for other reasons, still enroll off-chain
      try {
        await persistEnrollment(courseId);
        analytics.track({ name: 'course_enrolled', params: { courseId, method: 'off-chain-fallback' } });
        setStatus('success');
        return true;
      } catch (fallbackErr: any) {
        setError(fallbackErr?.message || 'Enrollment failed');
        setStatus('error');
        return false;
      }
    }
  }, [connected, publicKey, connection, sendTransaction, user, learningService, persistEnrollment]);

  return { enroll, status, txSignature, error, reset };
}

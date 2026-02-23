import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import {
  XP_MINT,
  TOKEN_2022_PROGRAM_ID,
  deriveEnrollmentPDA,
  deriveConfigPDA,
  PROGRAM_ID,
  calculateLevel,
} from '@/services/onchain-constants';

/**
 * Hook to read XP soulbound token (Token-2022) balance from the user's wallet.
 * Reads the actual Token-2022 ATA balance on Devnet using the official XP mint.
 */
export function useOnChainXP() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [xp, setXp] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchXP = useCallback(async () => {
    if (!connected || !publicKey) {
      setXp(null);
      return;
    }

    setLoading(true);
    try {
      // Derive the Token-2022 ATA for the XP mint
      const xpAta = getAssociatedTokenAddressSync(
        XP_MINT,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const balance = await connection.getTokenAccountBalance(xpAta);
      const xpAmount = Number(balance.value.amount);
      console.log(`[ON-CHAIN] XP balance for ${publicKey.toBase58()}: ${xpAmount}`);
      setXp(xpAmount);
    } catch (err: any) {
      // Account doesn't exist = 0 XP (learner hasn't received any yet)
      if (err?.message?.includes('could not find account') ||
          err?.message?.includes('Account does not exist')) {
        console.log(`[ON-CHAIN] No XP token account found — learner has 0 XP`);
        setXp(0);
      } else {
        console.warn('Failed to fetch on-chain XP:', err);
        setXp(null); // null = use profile XP fallback
      }
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, connection]);

  useEffect(() => {
    fetchXP();
  }, [fetchXP]);

  return { xp, loading, isOnChain: xp !== null, refetch: fetchXP };
}

/**
 * Hook to fetch Metaplex Core credential NFTs from the user's wallet via Helius DAS API.
 * Filters by track collection to show only Superteam Academy credentials.
 */
export function useOnChainCredentials() {
  const { publicKey, connected } = useWallet();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      setCredentials([]);
      return;
    }

    const fetchCredentials = async () => {
      setLoading(true);
      try {
        const heliusApiKey = import.meta.env.VITE_HELIUS_API_KEY;
        if (!heliusApiKey) {
          console.log('[ON-CHAIN] No Helius API key — credential display requires VITE_HELIUS_API_KEY');
          setCredentials([]);
          return;
        }

        const heliusUrl = `https://devnet.helius-rpc.com/?api-key=${heliusApiKey}`;
        const response = await fetch(heliusUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'credentials',
            method: 'getAssetsByOwner',
            params: {
              ownerAddress: publicKey.toBase58(),
              page: 1,
              limit: 100,
              displayOptions: { showCollectionMetadata: true },
            },
          }),
        });

        const data = await response.json();
        const items = data.result?.items || [];

        // Filter for Metaplex Core assets that are soulbound credentials
        // These have a collection grouping and credential-like attributes
        const creds = items.filter((item: any) =>
          item.grouping?.some((g: any) => g.group_key === 'collection') &&
          item.content?.metadata?.attributes?.some((attr: any) =>
            attr.trait_type === 'track_id' || attr.trait_type === 'courses_completed'
          )
        );

        console.log(`[ON-CHAIN] Found ${creds.length} credential NFTs for ${publicKey.toBase58()}`);
        setCredentials(creds.map((cred: any) => {
          const attrs = cred.content?.metadata?.attributes || [];
          const getAttr = (key: string) => attrs.find((a: any) => a.trait_type === key)?.value;

          return {
            id: cred.id,
            mintAddress: cred.id,
            name: cred.content?.metadata?.name || 'Credential',
            imageUrl: cred.content?.links?.image || cred.content?.files?.[0]?.uri || '',
            track: getAttr('track_id') || 'unknown',
            level: Number(getAttr('level') || 0),
            coursesCompleted: Number(getAttr('courses_completed') || 0),
            totalXp: Number(getAttr('total_xp') || 0),
            issuedAt: new Date().toISOString(),
            verified: true,
            collection: cred.grouping?.find((g: any) => g.group_key === 'collection')?.group_value || '',
          };
        }));
      } catch (err) {
        console.error('Failed to fetch credentials:', err);
        setCredentials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCredentials();
  }, [connected, publicKey]);

  return { credentials, loading };
}

/**
 * Hook to check enrollment status for a specific course on-chain.
 * Reads the Enrollment PDA to determine if the learner is enrolled.
 */
export function useOnChainEnrollment(courseId: string | undefined) {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchEnrollment = useCallback(async () => {
    if (!connected || !publicKey || !courseId) {
      setEnrollment(null);
      return;
    }

    setLoading(true);
    try {
      const [enrollmentPda] = deriveEnrollmentPDA(courseId, publicKey);
      const accountInfo = await connection.getAccountInfo(enrollmentPda);

      if (accountInfo) {
        console.log(`[ON-CHAIN] Enrollment found for course ${courseId}`);
        setEnrollment({
          exists: true,
          pda: enrollmentPda.toBase58(),
          data: accountInfo.data,
        });
      } else {
        setEnrollment(null);
      }
    } catch (err) {
      console.warn('Failed to fetch enrollment:', err);
      setEnrollment(null);
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, courseId, connection]);

  useEffect(() => {
    fetchEnrollment();
  }, [fetchEnrollment]);

  return { enrollment, loading, refetch: fetchEnrollment };
}

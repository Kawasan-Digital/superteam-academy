/**
 * Helius DAS API integration for on-chain leaderboard.
 * Indexes XP soulbound token (Token-2022) balances to derive rankings.
 *
 * Uses the official XP mint from the Superteam Academy program:
 * XP Mint: xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3
 *
 * Falls back to mock data when VITE_HELIUS_API_KEY is not configured.
 */

import type { LeaderboardEntry } from './types';
import { MOCK_LEADERBOARD } from './mock-data';
import { XP_MINT, calculateLevel } from './onchain-constants';

const HELIUS_API_KEY = import.meta.env.VITE_HELIUS_API_KEY;
const HELIUS_RPC_URL = HELIUS_API_KEY
  ? `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : null;

interface HeliusAsset {
  id: string;
  content?: {
    metadata?: {
      name?: string;
      symbol?: string;
    };
  };
  token_info?: {
    balance?: number;
    decimals?: number;
    mint_authority?: string;
    supply?: number;
  };
  ownership?: {
    owner?: string;
  };
}

interface HeliusSearchResponse {
  result?: {
    items?: HeliusAsset[];
    total?: number;
    page?: number;
  };
}

/**
 * Fetch all holders of the XP token using Helius DAS getTokenLargestAccounts.
 */
async function fetchXPHolders(): Promise<Array<{ wallet: string; balance: number }>> {
  if (!HELIUS_RPC_URL) return [];

  try {
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'xp-leaderboard',
        method: 'searchAssets',
        params: {
          grouping: ['collection', XP_MINT.toBase58()],
          page: 1,
          limit: 100,
          sortBy: { sortBy: 'created', sortDirection: 'desc' },
        },
      }),
    });

    const data: HeliusSearchResponse = await response.json();
    const items = data.result?.items || [];

    return items
      .filter((item) => item.ownership?.owner && item.token_info?.balance)
      .map((item) => ({
        wallet: item.ownership!.owner!,
        balance: (item.token_info!.balance || 0) / Math.pow(10, item.token_info!.decimals || 0),
      }))
      .sort((a, b) => b.balance - a.balance);
  } catch (err) {
    console.warn('[Helius] Failed to fetch XP holders, using fallback:', err);
    return [];
  }
}

/**
 * Get an individual wallet's XP token balance via Helius DAS API.
 */
export async function getWalletXPBalance(walletAddress: string): Promise<number> {
  if (!HELIUS_RPC_URL) return 0;

  try {
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'wallet-xp',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: walletAddress,
          page: 1,
          limit: 100,
          displayOptions: { showFungible: true },
        },
      }),
    });

    const data = await response.json();
    const items = data.result?.items || [];

    const xpMintStr = XP_MINT.toBase58();
    const xpToken = items.find(
      (item: HeliusAsset) => item.id === xpMintStr || item.token_info?.mint_authority === xpMintStr
    );

    if (xpToken?.token_info?.balance) {
      return xpToken.token_info.balance / Math.pow(10, xpToken.token_info.decimals || 0);
    }

    return 0;
  } catch {
    return 0;
  }
}

/**
 * Build leaderboard entries from on-chain XP token balances.
 * Falls back to mock data if Helius is not configured or returns no results.
 */
export async function fetchLeaderboard(
  timeframe: 'weekly' | 'monthly' | 'alltime' = 'alltime'
): Promise<LeaderboardEntry[]> {
  const holders = await fetchXPHolders();

  if (holders.length > 0) {
    return holders.map((holder, index) => ({
      rank: index + 1,
      user: {
        id: holder.wallet,
        displayName: truncateWallet(holder.wallet),
        username: holder.wallet.slice(0, 8).toLowerCase(),
        avatar: '',
      },
      xp: Math.round(holder.balance),
      level: calculateLevel(holder.balance),
      streak: 0, // Streak is frontend-only per spec
    }));
  }

  // Fallback to mock data
  if (timeframe === 'weekly') {
    return [...MOCK_LEADERBOARD].sort((a, b) => b.streak - a.streak).map((e, i) => ({ ...e, rank: i + 1 }));
  }
  if (timeframe === 'monthly') {
    return [...MOCK_LEADERBOARD].sort((a, b) => (b.xp * 0.7 + b.streak * 100) - (a.xp * 0.7 + a.streak * 100)).map((e, i) => ({ ...e, rank: i + 1 }));
  }
  return MOCK_LEADERBOARD;
}

function truncateWallet(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

/**
 * Check if Helius DAS API is configured and available.
 */
export function isHeliusConfigured(): boolean {
  return !!HELIUS_API_KEY;
}

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type WalletAuthStatus = 'idle' | 'connecting' | 'signing' | 'verifying' | 'success' | 'error';

export function useWalletAuth() {
  const { publicKey, signMessage, connect, select, wallets, connected } = useWallet();
  const { toast } = useToast();
  const [status, setStatus] = useState<WalletAuthStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const loginWithWallet = useCallback(async () => {
    try {
      setStatus('connecting');
      setError(null);

      // If no wallet connected, try to select Phantom first
      if (!connected || !publicKey) {
        const phantom = wallets.find(w => w.adapter.name === 'Phantom');
        if (phantom) {
          select(phantom.adapter.name);
          // Give wallet adapter time to initialize
          await new Promise(r => setTimeout(r, 500));
          await connect();
          await new Promise(r => setTimeout(r, 500));
        }
      }

      if (!signMessage) {
        throw new Error('Wallet does not support message signing. Please use Phantom or Solflare.');
      }

      setStatus('signing');

      const timestamp = Date.now();
      const message = `Sign in to SolDev Labs\nTimestamp: ${timestamp}`;
      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);

      if (!publicKey) throw new Error('No wallet connected');

      setStatus('verifying');

      const { data, error: fnError } = await supabase.functions.invoke('wallet-auth', {
        body: {
          publicKey: publicKey.toBase58(),
          signature: Array.from(signature),
          message,
        },
      });

      if (fnError || data?.error) {
        throw new Error(data?.error || fnError?.message || 'Authentication failed');
      }

      // Set the session in Supabase client
      const { session, isNewUser } = data;
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      setStatus('success');
      toast({
        title: isNewUser ? 'Account Created!' : 'Welcome Back!',
        description: isNewUser
          ? 'Your wallet account has been created. Welcome to SolDev Labs!'
          : 'Signed in with your wallet successfully.',
      });

      return true;
    } catch (err: any) {
      console.error('Wallet auth error:', err);
      const msg = err?.message || 'Failed to authenticate with wallet';
      
      // User rejected the signing
      if (msg.includes('User rejected') || msg.includes('cancelled') || msg.includes('denied')) {
        setError('Signing cancelled by user');
      } else {
        setError(msg);
      }
      
      setStatus('error');
      toast({
        title: 'Wallet Login Failed',
        description: msg.includes('User rejected') ? 'You cancelled the signing request.' : msg,
        variant: 'destructive',
      });
      return false;
    }
  }, [publicKey, signMessage, connect, select, wallets, connected, toast]);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return { loginWithWallet, status, error, reset };
}

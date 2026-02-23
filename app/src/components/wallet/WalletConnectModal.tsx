import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ExternalLink, ChevronRight, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/LanguageContext';
import { useWallet } from '@solana/wallet-adapter-react';
import type { WalletName } from '@solana/wallet-adapter-base';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const WALLET_META: Record<string, { color: string; popular: boolean }> = {
  Phantom: { color: 'from-[hsl(270,80%,60%)] to-[hsl(270,60%,40%)]', popular: true },
  Solflare: { color: 'from-[hsl(25,95%,55%)] to-[hsl(35,95%,50%)]', popular: true },
  Backpack: { color: 'from-[hsl(210,90%,50%)] to-[hsl(220,80%,40%)]', popular: true },
  Ledger: { color: 'from-[hsl(0,0%,15%)] to-[hsl(0,0%,25%)]', popular: false },
  Torus: { color: 'from-[hsl(220,90%,55%)] to-[hsl(230,85%,45%)]', popular: false },
  Glow: { color: 'from-[hsl(155,80%,45%)] to-[hsl(165,70%,35%)]', popular: false },
};

export function WalletConnectModal() {
  const { t } = useTranslation();
  const { wallets, select, connect, disconnect, publicKey, connected, connecting, wallet } = useWallet();
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [justConnected, setJustConnected] = useState(false);

  const shortAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null;

  // Save wallet address to profile when connected
  useEffect(() => {
    if (connected && publicKey && user && profile) {
      const address = publicKey.toBase58();
      if (profile.wallet_address !== address) {
        updateProfile({ wallet_address: address, wallet_connected: true });
      }
    }
  }, [connected, publicKey, user, profile?.wallet_address]);

  const handleSelect = useCallback(async (walletName: WalletName) => {
    try {
      select(walletName);
      // connect() is called automatically after select when autoConnect is true,
      // but we call it explicitly for immediate feedback
      setTimeout(async () => {
        try {
          await connect();
          setJustConnected(true);
          setTimeout(() => {
            setJustConnected(false);
            setOpen(false);
          }, 1200);
        } catch (err: any) {
          // User rejected or wallet not installed
          if (!err?.message?.includes('User rejected')) {
            toast({
              title: 'Connection failed',
              description: err?.message || 'Could not connect to wallet',
              variant: 'destructive',
            });
          }
        }
      }, 100);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to select wallet',
        variant: 'destructive',
      });
    }
  }, [select, connect, toast]);

  const handleDisconnect = useCallback(async () => {
    await disconnect();
    if (user) {
      updateProfile({ wallet_address: null, wallet_connected: false });
    }
    toast({ title: 'Wallet disconnected' });
  }, [disconnect, user, updateProfile, toast]);

  const popularWallets = wallets.filter(w => WALLET_META[w.adapter.name]?.popular);
  const otherWallets = wallets.filter(w => !WALLET_META[w.adapter.name]?.popular);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {connected && shortAddress ? (
          <Button variant="outline" size="sm" className="gap-2 border-accent/30 text-accent hover:bg-accent/10 group">
            <motion.div
              className="w-2 h-2 rounded-full bg-accent"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <span className="font-mono text-xs">{shortAddress}</span>
          </Button>
        ) : (
          <Button size="sm" className="gap-2 bg-solana-gradient text-background hover:opacity-90 font-semibold">
            <Wallet className="w-4 h-4" />
            {t('nav.connect_wallet')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            {justConnected ? 'Connected!' : connected ? 'Wallet Connected' : 'Connect Wallet'}
          </DialogTitle>
          {!justConnected && !connected && (
            <p className="text-sm text-muted-foreground">
              Choose your preferred Solana wallet to continue
            </p>
          )}
        </DialogHeader>

        {justConnected ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center py-8 gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center"
            >
              <Check className="w-8 h-8 text-accent" />
            </motion.div>
            <p className="text-sm text-foreground font-medium">Wallet connected successfully</p>
            <p className="text-xs font-mono text-muted-foreground">{shortAddress}</p>
          </motion.div>
        ) : connected ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border">
              {wallet?.adapter.icon && (
                <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-8 h-8 rounded-lg" />
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{wallet?.adapter.name}</p>
                <p className="text-xs font-mono text-muted-foreground">{publicKey?.toBase58()}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                handleDisconnect();
                setOpen(false);
              }}
            >
              Disconnect Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {popularWallets.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Recommended</p>
                {popularWallets.map((w, i) => {
                  const ready = w.readyState === 'Installed';
                  return (
                    <motion.button
                      key={w.adapter.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleSelect(w.adapter.name as WalletName)}
                      disabled={connecting}
                      className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border bg-secondary/20 hover:bg-secondary/50 hover:border-primary/20 transition-all group disabled:opacity-50"
                    >
                      <img src={w.adapter.icon} alt={w.adapter.name} className="w-8 h-8 rounded-lg" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">{w.adapter.name}</span>
                          {ready && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                              Detected
                            </span>
                          )}
                        </div>
                      </div>
                      {connecting && wallet?.adapter.name === w.adapter.name ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full"
                        />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                      )}
                    </motion.button>
                  );
                })}
              </>
            )}

            {otherWallets.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider pt-3">More wallets</p>
                <div className="grid grid-cols-3 gap-2">
                  {otherWallets.map((w, i) => (
                    <motion.button
                      key={w.adapter.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      onClick={() => handleSelect(w.adapter.name as WalletName)}
                      disabled={connecting}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:bg-secondary/30 hover:border-primary/20 transition-all disabled:opacity-50"
                    >
                      <img src={w.adapter.icon} alt={w.adapter.name} className="w-8 h-8 rounded-lg" />
                      <span className="text-xs text-muted-foreground font-medium">{w.adapter.name}</span>
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            {wallets.length === 0 && (
              <div className="text-center py-8">
                <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-foreground font-medium mb-1">No wallets detected</p>
                <p className="text-xs text-muted-foreground">Install a Solana wallet to continue</p>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                New to Solana?{' '}
                <a href="https://solana.com/wallets" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                  Get a wallet <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

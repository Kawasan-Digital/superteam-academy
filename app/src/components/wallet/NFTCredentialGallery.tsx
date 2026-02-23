import { motion } from 'framer-motion';
import { ExternalLink, Shield, Sparkles, Award, Layers, Zap, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Credential } from '@/services/types';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from '@/i18n/LanguageContext';

interface NFTCredentialGalleryProps {
  credentials: Credential[];
}

const trackGradients: Record<string, string> = {
  'Solana Core': 'from-primary via-primary/80 to-accent',
  'DeFi': 'from-accent via-accent/80 to-primary',
  'NFT & Gaming': 'from-destructive via-primary to-accent',
  'Security': 'from-destructive via-destructive/60 to-primary',
};

const trackIcons: Record<string, typeof Sparkles> = {
  'Solana Core': Layers,
  'DeFi': Zap,
  'NFT & Gaming': Sparkles,
  'Security': Shield,
};

const SOLANA_EXPLORER_BASE = 'https://explorer.solana.com';

function getSolanaExplorerUrl(mintAddress: string): string {
  return `${SOLANA_EXPLORER_BASE}/address/${mintAddress}?cluster=devnet`;
}

function CopyMintButton({ mintAddress }: { mintAddress: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mintAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded text-[10px] hover:bg-secondary/80 transition-colors cursor-pointer"
        >
          {mintAddress.slice(0, 4)}...{mintAddress.slice(-4)}
          {copied ? <Check className="w-2.5 h-2.5 text-accent" /> : <Copy className="w-2.5 h-2.5" />}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-mono text-xs">{mintAddress}</p>
        <p className="text-muted-foreground text-[10px]">{copied ? 'Copied!' : 'Click to copy mint address'}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function NFTCredentialGallery({ credentials }: NFTCredentialGalleryProps) {
  const { t } = useTranslation();

  if (credentials.length === 0) {
    return <EmptyState type="credentials" />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">On-Chain Credentials</h3>
          <Badge variant="outline" className="text-[10px] gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Solana Devnet
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">{credentials.length} NFT{credentials.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {credentials.map((cred, i) => {
          const gradient = trackGradients[cred.track] || 'from-primary to-accent';
          const TrackIcon = trackIcons[cred.track] || Sparkles;
          const progressPercent = Math.min(cred.level * 33, 100);

          return (
            <motion.div
              key={cred.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Gradient header with NFT visual */}
              <div className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-card/30" />
                {/* Animated hex pattern */}
                <div className="absolute inset-0 opacity-15">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='white' stroke-opacity='0.3'/%3E%3C/svg%3E")`,
                    backgroundSize: '30px 30px',
                  }} />
                </div>
                
                {/* NFT Icon with track-specific icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-18 h-18 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 flex items-center justify-center shadow-2xl"
                    animate={{ rotate: [0, 2, -2, 0], scale: [1, 1.02, 1] }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                  >
                    <TrackIcon className="w-8 h-8 text-primary" />
                  </motion.div>
                </div>

                {/* Soulbound badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-card/80 backdrop-blur-sm text-[10px] text-muted-foreground font-medium border border-border/30">
                  <Shield className="w-3 h-3" /> Soulbound
                </div>

                {/* Level badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-card/80 backdrop-blur-sm text-xs font-bold text-foreground border border-border/30">
                  Lv. {cred.level}
                </div>

                {/* Verified badge */}
                {cred.verified && (
                  <div className="absolute bottom-10 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/20 backdrop-blur-sm text-[10px] text-accent font-semibold">
                    <Check className="w-3 h-3" /> Verified On-Chain
                  </div>
                )}

                {/* Evolving progress bar */}
                <div className="absolute bottom-3 left-3 right-3 space-y-1">
                  <div className="flex justify-between text-[9px] text-card/80 font-medium">
                    <span>Track Progress</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-card/20 overflow-hidden backdrop-blur-sm">
                    <motion.div
                      className="h-full rounded-full bg-accent"
                      initial={{ width: '0%' }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground text-sm leading-tight">{cred.courseName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{cred.track}</Badge>
                    <span className="text-[10px] text-muted-foreground">Metaplex Core NFT</span>
                  </div>
                </div>

                {/* Metadata row */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {new Date(cred.issuedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <CopyMintButton mintAddress={cred.mintAddress} />
                </div>

                {/* On-chain attributes preview */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-secondary/50 rounded-lg py-1.5 px-1">
                    <div className="text-[10px] text-muted-foreground">Track</div>
                    <div className="text-xs font-semibold text-foreground truncate">{cred.track.split(' ')[0]}</div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg py-1.5 px-1">
                    <div className="text-[10px] text-muted-foreground">Level</div>
                    <div className="text-xs font-semibold text-foreground">{cred.level}</div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg py-1.5 px-1">
                    <div className="text-[10px] text-muted-foreground">Status</div>
                    <div className="text-xs font-semibold text-accent">Active</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Link to={`/certificates/${cred.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs border-border text-foreground hover:border-primary/30">
                      View Certificate
                    </Button>
                  </Link>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={getSolanaExplorerUrl(cred.mintAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-primary">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">View on Solana Explorer (Devnet)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground py-2">
        <Shield className="w-3.5 h-3.5" />
        <span>Credentials are soulbound Metaplex Core NFTs — non-transferable, permanently frozen, and verifiable on Solana Devnet</span>
      </div>
    </div>
  );
}

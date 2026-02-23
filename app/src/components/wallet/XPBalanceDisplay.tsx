import { motion } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-counter';

interface XPBalanceDisplayProps {
  xp: number;
  level: number;
  variant?: 'compact' | 'full';
}

export function XPBalanceDisplay({ xp, level, variant = 'compact' }: XPBalanceDisplayProps) {
  if (variant === 'compact') {
    return (
      <motion.div 
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <Zap className="w-3.5 h-3.5 text-accent" />
        <span className="text-sm font-mono font-semibold text-foreground">
          <AnimatedCounter value={xp} duration={1} />
        </span>
        <div className="w-px h-4 bg-border" />
        <TrendingUp className="w-3.5 h-3.5 text-primary" />
        <span className="text-sm font-semibold text-foreground">Lv.{level}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl border border-border bg-card relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-solana-gradient opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <p className="text-xs text-muted-foreground font-medium">XP Token Balance</p>
        </div>
        <div className="flex items-baseline gap-2">
          <AnimatedCounter
            value={xp}
            className="text-3xl font-display font-bold text-gradient"
            duration={1.5}
          />
          <span className="text-sm text-muted-foreground">XP</span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-primary" /> Level {level}</span>
          <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded border border-border">Soulbound • Non-Transferable</span>
        </div>
      </div>
    </motion.div>
  );
}

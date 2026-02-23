import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface XPProgressBarProps {
  currentXP: number;
  currentLevel: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function XPProgressBar({ currentXP, currentLevel, showLabel = true, size = 'md', animated = true }: XPProgressBarProps) {
  const currentLevelXP = (currentLevel ** 2) * 100;
  const nextLevelXP = ((currentLevel + 1) ** 2) * 100;
  const progress = Math.min(((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100, 100);
  const xpNeeded = nextLevelXP - currentXP;

  const heights = { sm: 'h-1.5', md: 'h-3', lg: 'h-4' };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-sm">
            <Zap className="w-4 h-4 text-accent" />
            <span className="font-semibold text-foreground">{currentXP.toLocaleString()} XP</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {xpNeeded.toLocaleString()} XP to Level {currentLevel + 1}
          </span>
        </div>
      )}
      <div className={`w-full rounded-full bg-secondary overflow-hidden ${heights[size]} relative`}>
        <motion.div
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          className="h-full rounded-full bg-solana-gradient relative"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[gradient-shift_3s_ease_infinite] bg-[length:200%_100%]" />
        </motion.div>
        {/* Glow at progress tip */}
        <motion.div
          initial={animated ? { left: '0%' } : false}
          animate={{ left: `${progress}%` }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent/40 blur-md"
        />
      </div>
    </div>
  );
}

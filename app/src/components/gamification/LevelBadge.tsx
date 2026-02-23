import { motion } from 'framer-motion';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const levelTiers = [
  { min: 0, max: 2, label: 'Novice', accent: 'border-muted-foreground/30', bg: 'bg-secondary' },
  { min: 3, max: 5, label: 'Apprentice', accent: 'border-primary/40', bg: 'bg-primary/10' },
  { min: 6, max: 8, label: 'Developer', accent: 'border-primary/60', bg: 'bg-primary/15' },
  { min: 9, max: 12, label: 'Expert', accent: 'border-accent/60', bg: 'bg-accent/10' },
  { min: 13, max: 99, label: 'Master', accent: 'border-accent', bg: 'bg-accent/15' },
];

function getTier(level: number) {
  return levelTiers.find(t => level >= t.min && level <= t.max) || levelTiers[0];
}

export function LevelBadge({ level, size = 'md', showLabel = true, animated = true }: LevelBadgeProps) {
  const tier = getTier(level);
  const sizes = {
    sm: { container: 'w-10 h-10', text: 'text-sm', label: 'text-[10px]' },
    md: { container: 'w-14 h-14', text: 'text-lg', label: 'text-xs' },
    lg: { container: 'w-20 h-20', text: 'text-2xl', label: 'text-sm' },
  };
  const s = sizes[size];

  return (
    <div className="relative inline-flex flex-col items-center gap-1.5">
      <div className="relative">
        {/* Outer glow for high levels */}
        {level >= 6 && (
          <div className="absolute -inset-1 rounded-2xl bg-solana-gradient opacity-15 blur-md animate-pulse-glow" />
        )}
        <motion.div
          initial={animated ? { scale: 0, rotate: -180 } : false}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className={`${s.container} rounded-xl border-2 ${tier.accent} ${tier.bg} flex items-center justify-center relative overflow-hidden`}
        >
          {/* Inner gradient shimmer */}
          {level >= 3 && (
            <div className="absolute inset-0 bg-solana-gradient opacity-[0.08]" />
          )}
          <span className={`${s.text} font-display font-bold text-foreground relative z-10`}>{level}</span>
        </motion.div>
      </div>
      {showLabel && (
        <motion.span
          initial={animated ? { opacity: 0, y: 5 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${s.label} font-medium text-muted-foreground`}
        >
          {tier.label}
        </motion.span>
      )}
    </div>
  );
}
